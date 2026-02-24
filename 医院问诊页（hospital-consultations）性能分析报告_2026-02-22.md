## /hospital/consultations 性能分析报告（2026-02-22）

### 0. 结论摘要（先看这一段）

从你提供的 logs 与代码对齐后可以确定：**页面壳本身不慢**（`GET /hospital/consultations 200 in 24~54ms`），慢主要来自两类问题：

- **P0：`/api/hospital/consultations` 在 `hospitalId=null` 时做“全表列表 + 全表统计”**  
  你的日志里明确打印了 `hospitalId: null`，因此：
  - 列表查询缺少 `hospital_id` 过滤，无法命中你们为该页面准备的复合索引（见迁移 `007_optimize_consultations_for_list_no_concurrent.sql`）
  - 统计 SQL 也会对全表做聚合（`WHERE 1=1`），导致 **1.3–1.9s** 的 API 耗时（你日志中的 `render: 1359~1942ms`）
  - 这不仅慢，还是**权限隔离风险**（医院端理论上不应看到其他医院的数据）

- **P0：Session 刷新失败导致“多余的跳转/重复请求”**  
  `GET /api/auth/session` 里出现 `Token refresh failed: Error: Failed to refresh token`，随后你又看到了 `GET /login` 与重新登录的一串请求。  
  这会把一次正常页面加载放大成“加载 → 登出 → 登录 → 再加载”，体感会明显变慢且不稳定。

- **P1：日志量过大（尤其是打印 JWT 全 payload）会放大 IO 开销**  
  `lib/auth/keycloak-client.ts` 的 `extractRoles()` 每次都会打印：
  - `[Keycloak] Token keys: ...`
  - `[Keycloak] Full payload: {...}`（包含完整 claims）
  这类日志在高并发/频繁 session 校验场景会显著拖慢服务端，并污染排障信号。

- **P1：重复请求（开发环境常见）会把慢接口“乘以 2”**  
  你 logs 里 `/api/hospital/consultations?limit=20` 出现了多次（1825ms、1363ms、1394ms、1945ms）。  
  这通常来自：React Strict Mode 双 mount、hooks `useEffect(fetch)` 无去重/缓存、或组件重挂载。

> 最关键的第一刀是：**让 consultations API 100% 带上“当前医院 hospitalId（UUID）”过滤**，并让 stats 同样按医院过滤；这会同时提升性能 + 修正权限边界。

---

### 1. 环境与范围

- **页面**：`http://localhost:3002/hospital/consultations`
- **前端形态**：Next.js App Router Client Component  
  - 页面文件：`medical-crm/app/hospital/consultations/page.tsx`
- **后端形态**：Next.js Route Handlers + Prisma  
  - API：`medical-crm/app/api/hospital/consultations/route.ts`
- **鉴权/会话**：自研 session cookie + Keycloak refresh  
  - Session API：`medical-crm/app/api/auth/session/route.ts`
  - Provider：`medical-crm/lib/auth/AuthContext.tsx`
  - Token 解析：`medical-crm/lib/auth/keycloak-client.ts`

---

### 2. 现象与证据（从你提供的日志抽取）

#### 2.1 页面壳很快，慢在 API

- `GET /hospital/consultations 200 in 54ms (compile: 10ms, render: 43ms)`
- `GET /hospital/consultations 200 in 24ms (compile: 5ms, render: 19ms)`

说明：路由渲染不是瓶颈。

#### 2.2 API 瀑布（按影响排序）

- **`GET /api/hospital/consultations?limit=20`**
  - 200 in **1825ms**（`render: 1823ms`）
  - 200 in **1363ms**（`render: 1359ms`）
  - 200 in **1394ms**（`render: 1392ms`）
  - 200 in **1945ms**（`render: 1942ms`）

- **`GET /api/auth/session`**
  - 200 in **50ms**
  - 200 in **153ms**（期间出现 refresh 失败并清 cookie）
  - 后续稳定时可到 3–4ms（同日志中出现）

#### 2.3 consultations API 的“危险信号”：hospitalId 是 null

你的日志里已经打印了参数：

```
📋 Hospital 获取问诊列表: { cursor: null, limit: 20, status: null, date: null, hospitalId: null }
```

这意味着服务端会走“无医院过滤”的路径，直接放大 DB 扫描/排序/聚合成本。

#### 2.4 Session 刷新失败 → 跳登录

日志显示：

```
Token refresh failed: Error: Failed to refresh token
...
GET /login 200 in 11ms
```

在用户体验上，这会表现为：

- 首次进入 consultations 时先 loading
- 过程中 session 被清掉
- ProtectedRoute 重定向到 `/login`
- 登录成功后再回到 hospital 路由，重新触发一轮数据加载

---

### 3. 代码级根因定位（按模块）

#### 3.1 `useConsultations()`：未注入 hospitalId（导致后端走全表路径）

- **实现文件**：`medical-crm/lib/api/hospital/hooks.ts`
- **现状**：`useConsultations()` 只把 `params.hospitalId` 透传到 query string；但页面调用是 `useConsultations()`（无参数），因此默认不会携带 hospitalId。
- **结果**：后端 `hospitalId` 为空时无法使用复合索引（你们已经写了索引迁移 007）。

#### 3.2 `/api/hospital/consultations`：目前“允许 hospitalId 缺省”

- **实现文件**：`medical-crm/app/api/hospital/consultations/route.ts`
- **关键点**：
  - 列表查询：`prisma.consultation.findMany({ where: finalWhere, orderBy: scheduledAt desc + id desc, take: limit+1, ... })`
  - stats 查询：raw SQL 聚合统计（当 hospitalId 为空时即全表）

> 这段代码顶部注释写了“添加 hospitalId 过滤（利用复合索引）”，但当前实际运行日志显示 hospitalId 为空，因此优化没有发挥作用。

#### 3.3 DB 索引优化已经存在，但被“缺少过滤条件”绕开了

- **索引迁移文件**：`medical-crm/migrations/007_optimize_consultations_for_list_no_concurrent.sql`
- **包含索引**：
  - `idx_consultations_hospital_scheduled (hospital_id, scheduled_at DESC, id DESC)`
  - `idx_consultations_hospital_status_scheduled (hospital_id, status, scheduled_at DESC, id DESC)`
  - 以及用于 stats 的 partial index

只有当查询条件包含 `hospital_id = ?`（以及可选 status）时，这些索引才会真正让查询从“扫全表/大范围排序”降为“走索引/小范围排序”。

#### 3.4 Session/Keycloak：refresh 失败 + 过度日志

- **Session API**：`medical-crm/app/api/auth/session/route.ts`
  - 当 token 剩余 < 5 分钟会主动 refresh
  - refresh 失败会**直接 delete session cookie**，相当于把用户踢下线

- **Keycloak token 解析**：`medical-crm/lib/auth/keycloak-client.ts`
  - `extractRoles()` 每次解码 token 都打印 `Token keys` + `Full payload`
  - 这会造成日志风暴（尤其是页面加载期间多次 `/api/auth/session` 请求）

---

### 4. 顶层根因分层（先修“性质”，再修“细节”）

#### 4.1 P0：医院维度过滤缺失（性能 + 权限双风险）

这是你这组 logs 中对加载速度影响最大的点：

- 列表查询：无 `hospitalId` → 可能扫描/排序更多行
- stats 聚合：无 `hospitalId` → 全表聚合

#### 4.2 P0：refresh 失败导致强制登出（放大器）

refresh 失败不一定意味着当前 access token 已失效；但你们的策略是“失败就删 cookie”，会造成：

- 多余的 `/login` 跳转
- 多余的页面与数据请求
- 体感“不稳定/忽快忽慢”

#### 4.3 P1：重复请求（开发环境）+ 无缓存/去重

`useEffect(fetch)` 模式天然缺少：

- in-flight 去重
- 缓存（避免重挂载重复打 API）
- 竞态控制（避免“第二次失败覆盖第一次成功”等问题）

#### 4.4 P1：payload/日志的“放大效应”

- consultations 列表目前会把 `aiSummary` 带回（可能是大 JSON），会放大 JSON 序列化/传输/解析成本
- JWT 全 payload 日志会放大 IO 与 CPU

---

### 5. 建议的验证/测量方案（最小侵入、先定位再下刀）

#### 5.1 把 1.3–1.9s 拆分：DB/序列化/其他

在 `medical-crm/app/api/hospital/consultations/route.ts` 加分段计时（只在开发环境）：

- 列表查询耗时（consultations）
- stats SQL 耗时
- `formattedItems` 映射耗时（JSON 处理）
- 响应体大小（`JSON.stringify` 长度）

#### 5.2 验证索引是否真的被使用

对比两种请求的 explain：

- A：`hospitalId = null`（当前）
- B：`hospitalId = <uuid>`（修复后）

观察是否命中：

- `idx_consultations_hospital_scheduled`
- `idx_consultations_hospital_status_scheduled`

#### 5.3 把 refresh 失败原因打出来（否则只能猜）

当前 `refreshToken()` 只抛出 `'Failed to refresh token'`，建议把 Keycloak 返回的 status/body 打出来（至少在 dev），否则无法判断是：

- client_id / secret 配置问题
- refresh token 过期/被轮换
- issuer 不对
- Keycloak 网络/可用性问题

---

### 6. 优化方案（按优先级、风险、预期收益）

#### 6.1 P0：让 consultations API 默认按“当前医院”过滤

目标：保证 `hospitalId` 不再为 null，且不依赖前端传参。

可选落地方向（推荐从上往下）：

- **方案 A（推荐）：登录时把 DB 的 `hospitalId(UUID)` 写入 session cookie**  
  `app/api/auth/login/route.ts` 里在写 cookie 前，用 `user.email` 查一次数据库取到 `users.hospital_id`（UUID），写进 session（例如 `session.user.hospitalUuid`）。  
  之后 `/api/hospital/consultations` 直接从 cookie 读取 hospitalUuid 作为过滤条件。

- **方案 B：consultations API 读取 session cookie，自行查一次 user → hospitalId**  
  每次接口请求都查 DB，会多一个查询，但能立刻修正权限边界；后续再改成方案 A 的“登录时写入”即可消除这笔开销。

- **方案 C：Keycloak token claim 直接存 hospital UUID**  
  从根源统一身份字段，但需要改 Keycloak mapper/用户属性，落地略慢。

#### 6.2 P0：refresh 失败不要立刻清 cookie（先“稳定可用”）

更稳妥的策略：

- refresh 失败时，如果当前 access token 仍未过期：先继续返回旧 session（并告警），不要立刻登出
- 只有当 access token 已过期且 refresh 也失败：再清 cookie 并要求重新登录

这能显著减少“加载中被踢下线”的体感问题。

#### 6.3 P1：咨询列表返回数据减肥（尤其是 `aiSummary`）

当前列表接口返回 `aiSummary`（可能是大 JSON）。建议：

- 列表只返回 `aiSummaryStatus` + 必要的简短字段
- 用户展开某条问诊时，再调用单独的接口取 `aiSummary`（或按 consultationId 批量取）

预期收益：降低响应体大小 + 降低 JSON 序列化/解析时间 + 网络更快。

#### 6.4 P1：前端数据层加“去重 + 缓存”

把 `useEffect(fetch)` 迁移到 SWR/React Query（你们仓库里已有 React Query 的实践：`hooks/useData.ts`），重点收益是：

- dev/prod 都能减少重复请求
- 页面切换/返回时不必重新打同一接口
- 更好的竞态与错误处理

#### 6.5 P1：减少 Keycloak 调试日志

将 `keycloak-client.ts` 的以下日志改为“仅 dev + 可开关”：

- `[Keycloak] Token keys ...`
- `[Keycloak] Full payload ...`

---

### 7. 预期效果（更可信的口径）

在 consultations 链路里，首屏主要由 `GET /api/hospital/consultations?limit=20` 决定。修复 `hospitalId=null` 之后，更合理的目标是：

- `/api/hospital/consultations`：**从 1.3–1.9s 降到 < 300–600ms（取决于数据量与是否减肥 aiSummary）**
- 刷新失败不再导致跳登录：**体验从“不稳定/忽快忽慢”变为“稳定可用”**
- 重复请求：×N → **×1（或至少×1 + 命中缓存）**

---

### 附录 A：关键文件索引（便于你/团队直接开改）

- 页面：`medical-crm/app/hospital/consultations/page.tsx`
- Hooks：`medical-crm/lib/api/hospital/hooks.ts`（`useConsultations` / `useCases`）
- API：`medical-crm/app/api/hospital/consultations/route.ts`
- Session API：`medical-crm/app/api/auth/session/route.ts`
- 登录 API：`medical-crm/app/api/auth/login/route.ts`
- Auth Provider：`medical-crm/lib/auth/AuthContext.tsx`
- 路由保护：`medical-crm/components/auth/ProtectedRoute.tsx`
- DB 索引迁移：`medical-crm/migrations/007_optimize_consultations_for_list_no_concurrent.sql`

