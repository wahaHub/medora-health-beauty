## /hospital/messages 性能分析报告（2026-02-22）

### 0. 结论摘要（先看这一段）

从你提供的服务端 logs 与代码对齐后可以确定：**页面壳不慢**（`GET /hospital/messages 200 in 62ms`），慢点主要来自“消息加载链路”里的两类问题：

- **P0：`GET /api/hospital/conversations/{id}/messages` 本身非常慢（4.9s）**  
  目前实现会先做一次 `COUNT(*)` 再 `findMany(take=50)`；当某个对话消息量大时，`COUNT(*)` 很容易变成 \(O(n)\) 扫描，成为主要瓶颈（你的日志里这条接口 `render: 4.9s`）。
- **P0：附件 signed-url 请求瀑布 + 错误形态不合理（404 被当成 500）**  
  前端会为每个附件单独调用 `POST /api/storage/signed-url`。你日志显示它被调用了很多次，并且存在：
  - 多次 `Object not found`（实际是 404），却返回 **500**（会被误判为“系统错误”，也更容易触发重复请求/重试）
  - 单次签名耗时波动大：**300ms~1.7s** 常见，且出现 **6.6s/6.9s** 的长尾
- **P0：开发环境重复请求 ×2（放大器）**  
  `GET /api/hospital/conversations` 在同一次加载过程中出现两次（2.0s 与 1561ms），高度符合 React 开发模式下 `useEffect` 被触发两次（StrictMode）的特征；会把慢接口的成本放大一倍，也会加重 DB/Storage 的连接竞争。
- **P1：鉴权/Keycloak 的 debug 日志过重且有安全风险**  
  `medical-crm/lib/auth/keycloak-client.ts` 会在每次解析 token 时打印 **完整 payload**（含 email/hospital_id 等），既影响性能也不适合长期保留（尤其上线后）。

> 结论：要明显改善体感，优先级不是“再加并行”，而是：**（1）消息列表 API 去掉 COUNT 或改 keyset；（2）signed-url 批量化/懒加载/负缓存 + 正确返回 404；（3）消除重复请求与过重日志。**

---

### 1. 环境与范围

- **页面**：`http://localhost:3002/hospital/messages`
- **前端实现**：
  - 页面：`medical-crm/app/hospital/messages/page.tsx`
  - 聊天组件：`medical-crm/components/messages/chat-layout.tsx`
  - 对话列表：`medical-crm/components/messages/conversation-list.tsx`
  - 消息面板（含附件缩略图 & signed-url）：`medical-crm/components/messages/active-chat.tsx`
- **后端实现（Next.js Route Handlers）**：
  - 对话列表：`medical-crm/app/api/hospital/conversations/route.ts`
  - 对话详情：`medical-crm/app/api/hospital/conversations/[conversationId]/route.ts`
  - 消息列表/发送：`medical-crm/app/api/hospital/conversations/[conversationId]/messages/route.ts`
  - 单条消息 minimal 轮询：`medical-crm/app/api/hospital/conversations/[conversationId]/messages/[messageId]/route.ts`
  - 附件签名 URL：`medical-crm/app/api/storage/signed-url/route.ts`
- **数据源**：
  - DB：Prisma（`medical-crm/lib/prisma.ts`）
  - Storage：Supabase Storage（service role，`medical-crm/lib/supabaseServer.ts`）

---

### 2. 现象与证据（从你提供的日志抽取）

#### 2.1 页面壳很快，慢在数据接口 + 附件签名

- `GET /hospital/messages 200 in 62ms (compile: 11ms, render: 51ms)`  
  说明：路由渲染不是瓶颈。

#### 2.2 API 瀑布（按“对用户体感影响”排序）

> 下面均取自你贴出的服务端耗时（`render:`），已省略 compile。

- **对话列表**：`GET /api/hospital/conversations`
  - 200 in **2.0s**
  - 200 in **1561ms**（重复一次）
- **对话详情**：`GET /api/hospital/conversations/770e...0101`
  - 200 in **1548ms**
- **消息列表**：`GET /api/hospital/conversations/770e...0101/messages`
  - 200 in **4.9s**
- **附件 signed-url**：`POST /api/storage/signed-url`
  - 多次 200（~**367ms ~ 1769ms**）
  - 多次 500（根因是 `Object not found`）
  - 出现 **6.6s / 6.9s** 的长尾

#### 2.3 关键错误：Object not found → 500

日志片段（摘录）：

```
Error creating signed URL: Error [StorageApiError]: Object not found
...
POST /api/storage/signed-url 500 in 1655ms
```

判断：

- 这是“文件路径在 Storage 中不存在”的业务型问题（应当是 404/空结果），不应作为 500 抛给前端。
- 由于前端当前只缓存成功的 signedUrl，**失败不会被缓存**，会在组件重渲染/列表刷新时重复触发，放大接口压力与体感抖动。

---

### 3. 加载链路拆解（更像真实用户体验的视角）

把消息页拆成 2 条路径，避免把耗时错误地“全部相加”：

#### 3.1 首屏路径（只打开页面）

- 页面壳（很快）
- `AuthContext` 拉 session：`GET /api/auth/session`（几毫秒量级，主要是开发日志噪音）
- 对话列表：`GET /api/hospital/conversations`（当前 1.5~2.0s，且开发环境可能 ×2）

首屏体感接近：`max(会话, 对话列表)`，并且会被“重复请求 ×2”放大。

#### 3.2 打开一个对话（用户点击对话）

- 对话详情：`GET /api/hospital/conversations/{id}`（~1.5s）
- 消息列表：`GET /api/hospital/conversations/{id}/messages`（~4.9s）
- 附件缩略图：对每个附件触发 `POST /api/storage/signed-url`（N 次，且有 404→500 与 6~7s 长尾）

这一条路径会显著影响“点进对话后要等多久才能看到完整消息/附件”的体感。

---

### 4. 根因定位（按接口）

#### 4.1 `GET /api/hospital/conversations`：重复调用 + 返回量不受控（潜在）

- **前端触发点**：`medical-crm/components/messages/conversation-list.tsx` 的 `useEffect(fetch)`  
  开发环境下容易出现重复调用（StrictMode）。你日志里同一 endpoint 确实出现两次。
- **后端实现**：`medical-crm/app/api/hospital/conversations/route.ts`
  - 会额外查询一次 `users` 来拿 `hospitalId`
  - `findMany` 当前**没有分页**（如果医院对话很多，会把 DB/序列化/传输成本拉高）

可优化方向：

- **前端去重**：SWR/React Query 的 in-flight dedupe，或在 effect 内用 ref 防重复。
- **后端分页**：至少 `take` + cursor，避免一次性拉全量。
- **减少额外查询**：登录时把 `hospitalId(UUID)` 放进 session cookie（避免每次列表都查 users）。

#### 4.2 `GET /api/hospital/conversations/{id}`：慢得不合理（~1.5s）

该接口只是一次 `findUnique + include case(select...)`，理论上应接近毫秒级~几十毫秒（本地 DB）或几十~几百毫秒（远程 DB）。

如果持续 ~1.5s，优先怀疑：

- DB 连接/资源竞争（与并发请求叠加、或开发环境重复请求）
- 某些全局中间件/日志过重导致 event loop 被占用

建议先按第 6 章加入“分段计时”，把 1.5s 拆成：DB 查询耗时 vs 应用层处理耗时。

#### 4.3 `GET /api/hospital/conversations/{id}/messages`：COUNT 导致 \(O(n)\) + payload 过胖（高概率）

后端实现（`medical-crm/app/api/hospital/conversations/[conversationId]/messages/route.ts`）当前逻辑：

- `prisma.message.count({ where: { conversationId } })`
- `prisma.message.findMany({ take: limit, include: { sender: true }, orderBy: createdAt asc })`

问题点：

- **COUNT 对大对话很贵**：即使有索引，`COUNT(*)` 仍可能需要扫描大量索引条目。
- **include sender: true**：会把 `users` 全字段查出来（你 UI 实际只要 `name/role/avatarUrl`）。

最直接的优化（通常能立刻把秒级打到亚秒级）：

- **去掉 COUNT**：用 `take: limit + 1` 判断 `hasMore`，避免全量计数。
- **改 keyset 分页**：`WHERE (created_at, id) < (cursorTime, cursorId)` + `ORDER BY created_at DESC, id DESC LIMIT 50`，避免 offset/并发插入导致的分页不稳定与性能退化。
- **收窄 sender 字段**：`sender: { select: { id, name, role, avatarUrl } }`

> 注：你们已经在 migration `medical-crm/migrations/006_optimize_conversations_for_list.sql` 为 `messages(conversation_id, created_at DESC)` 建了复合索引；如果当前 DB 仍然慢，可能意味着该 migration 尚未在你当前环境的数据库执行，或慢点主要来自 COUNT。

#### 4.4 `POST /api/storage/signed-url`：高频 N 次调用 + 404 误报 500 + 长尾

- **前端触发点**：`medical-crm/components/messages/active-chat.tsx`
  - `AttachmentThumbnail` 内 `useSignedUrl(attachment.url)` 会对每个附件单独请求 signed-url
  - 客户端有 `signedUrlCache`，但**只缓存成功**，失败会重复打
- **后端实现**：`medical-crm/app/api/storage/signed-url/route.ts`
  - Supabase Storage 返回 `Object not found` 时被统一当成 500

可优化方向（按收益）：

- **P0：正确返回 404/业务错误码**（别用 500）
- **P0：负缓存**（missing path 在一段时间内不再请求）
- **P1：批量签名**  
  新增 `POST /api/storage/signed-urls`（paths 数组）或在现有接口支持批量，后端使用 Supabase 的批量签名能力（或并发池 p-limit），把 N 次请求降到 1 次。
- **P1：懒加载**  
  非图片附件缩略图不必立即签名；仅在用户点击预览/下载时再签名。

---

### 5. 顶层根因分层（先修“性质”，再修“细节”）

#### 5.1 P0：消息接口的 COUNT（极可能是 4.9s 主因）

先把 `GET /messages` 从“全量计数 + 拉 50 条”改成“只拉 51 条判断 hasMore”，通常能带来数量级改善。

#### 5.2 P0：signed-url 瀑布与错误形态（导致附件区域慢 + 不稳定）

现状是“请求多 + 单次慢 + 有 6~7s 长尾 + 404→500”。这会让 UI 附件区域长期转圈，且 server logs 被错误刷屏。

#### 5.3 P0：开发环境重复请求（把慢点放大一倍）

即便生产环境不双触发，开发测量与联调会被严重干扰；并且重复请求会制造更多 DB/Storage 并发竞争，让 p95/p99 更差。

#### 5.4 P1：过重日志（Keycloak payload 全量打印）

这类日志既影响性能，也带来敏感信息泄露风险，应尽快加开关或删除。

---

### 6. 建议的验证/测量方案（最小侵入、快速定位）

目标：把“2s / 1.5s / 4.9s / 6.9s”拆到更具体的子阶段，避免盲改。

#### 6.1 统一 requestId（定位重复与竞态）

为以下接口在日志里打印同一个 `requestId`（例如 `crypto.randomUUID()`）：

- `/api/hospital/conversations`
- `/api/hospital/conversations/{id}`
- `/api/hospital/conversations/{id}/messages`
- `/api/storage/signed-url`

这样能一眼看出“同一个 endpoint 是否被调用两次、先后顺序、是否被覆盖”。

#### 6.2 分段计时：messages API 必做

在 `/api/hospital/conversations/{id}/messages` 内分别计时：

- count 耗时
- findMany 耗时
- map/序列化耗时（尤其 attachments JSON）

#### 6.3 signed-url 记录：path + errorCode + 耗时分布

需要能回答：

- 404 的 path 占比是多少（是否历史脏数据）
- p95/p99 的 signed-url 单次耗时是多少
- 是否存在“同一路径重复签名”（说明缓存未命中/失败未缓存）

---

### 7. 优化方案（按优先级、风险、预期收益）

#### 7.1 P0（高收益，低风险）：messages API 去 COUNT + keyset 分页

- 去掉 `count()`：用 `take: limit + 1` 推导 `hasMore`
- 分页改 keyset（向上翻历史更稳定）：`createdAt + id` 作为 cursor
- sender 字段收窄（避免 `include: true` 拉全字段）

预期：`4.9s` → **< 500ms ~ 1s**（取决于 DB 距离与数据量，但通常会大幅下降）。

#### 7.2 P0（高收益，低风险）：signed-url 404 正常化 + 负缓存

- 后端：Object not found 返回 404（或 200 + `success:false` 且 `code: OBJECT_NOT_FOUND`）
- 前端：对失败结果做负缓存（例如缓存 5 分钟），避免重复打

预期：错误刷屏消失、附件区域抖动减少，Storage 压力显著下降。

#### 7.3 P0（中收益，低风险）：移除/门控 Keycloak debug 日志

- 只在显式 `DEBUG_KEYCLOAK=1` 时打印 token keys
- 永远不要打印完整 payload（包含敏感信息）

预期：降低 event loop 压力，减少“看起来很慢但其实在打日志”的干扰。

#### 7.4 P1（高收益，中风险）：signed-url 批量化（1 次请求替代 N 次）

- 新增批量签名接口：一次返回 `path -> signedUrl`
- 后端加并发池（p-limit 5~10）或直接用 SDK 的批量 API（若可用）

预期：附件区域从“请求风暴”变成“单次可控请求”，p95/p99 更稳定。

#### 7.5 P1（中收益，中风险）：对话列表分页 + 前端 dedupe

- `/api/hospital/conversations` 增加 `take/cursor`
- 前端使用 SWR/React Query（核心收益是 dedupe+cache，而不是并行）

---

### 8. 关于“是不是很多问题导致慢”的回答（用你这份日志）

是的，但不是“每条都致命”。按你贴的日志，**最值得先动刀的**只有两类：

- **messages API 的 4.9s**（强烈怀疑是 COUNT）
- **signed-url 的 N 次请求 + 404→500 + 长尾**（明确的瀑布与错误形态问题）

重复请求、鉴权日志、以及对话列表/详情 1.5~2s 的慢，是“放大器/次要问题”，应排在其后。

---

### 9. 预期效果（更可信的估计方式）

不要用“把所有接口相加”的模型估算；更合理的是分两段：

- **首屏（只打开消息页，不点对话）**：主要看 `GET /api/hospital/conversations`（并消除开发双请求）  
- **打开对话（点进一个对话）**：主要看 `GET /messages` + signed-url 的附件策略

建议的阶段性目标：

- `GET /messages`：4.9s → **< 1s**
- signed-url：N 次、p99 6~7s → **批量/懒加载后稳定在 < 1s 级（或点击时触发）**
- 重复请求：×2 → **×1**

---

### 附录 A：关键文件索引（便于直接开改）

- 页面：`medical-crm/app/hospital/messages/page.tsx`
- 对话列表 UI & hook：`medical-crm/components/messages/conversation-list.tsx`
- 消息 UI（附件 & signed-url）：`medical-crm/components/messages/active-chat.tsx`
- API：
  - `medical-crm/app/api/hospital/conversations/route.ts`
  - `medical-crm/app/api/hospital/conversations/[conversationId]/route.ts`
  - `medical-crm/app/api/hospital/conversations/[conversationId]/messages/route.ts`
  - `medical-crm/app/api/storage/signed-url/route.ts`
- 鉴权/Keycloak：
  - `medical-crm/server/lib/auth.ts`
  - `medical-crm/lib/auth/keycloak-client.ts`

