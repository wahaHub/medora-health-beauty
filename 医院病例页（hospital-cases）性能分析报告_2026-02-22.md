## /hospital/cases 性能分析报告（2026-02-22）

### 0. 结论摘要（先看这一段）

从你提供的 server logs + 代码实现对齐后可以明确：**页面壳不慢**（`GET /hospital/cases 200 in 65ms`），慢主要来自两条链路：

- **P0：列表接口缺少医院维度过滤，触发“全表 COUNT + 全表排序”**  
  `GET /api/hospital/cases?page=1&limit=20` 需要 **1.3–1.5s** 才返回；而当前实现里 `where` 条件是 `WHERE 1=1`（`assignedHospitalId` 过滤 TODO 未做），这会把查询从“某个医院的 20 条”放大成“全站 cases 的 COUNT + ORDER BY updated_at”。

- **P0：详情聚合接口在首屏同步生成大量 Signed URLs（且存在重复签名/无上限扫描）**  
  `GET /api/hospital/cases/{caseId}/full?messageLimit=50` 用时 **16.8s**。该接口除了拉 case/messages 外，还会：
  - 汇总 documents + progress 诊断附件 + message attachments
  - **对每个文件逐个调用 Supabase Storage `createSignedUrl`**
  - 还会在 `diagnoses` 里再次对同一 `documentKey` 进行签名（重复工作）
  这类“网络调用 × 文件数量”的耗时在文档/附件较多时会线性爆炸，是 16.8s 的最可疑根因。

此外你日志里还有“放大器”（不一定是生产问题，但会显著影响本地体感）：

- **P0（放大器）：同一接口在开发环境被调用两次**  
  你日志里 `/api/auth/session` 与 `/api/hospital/cases` 都出现 **×2**。这在 Next.js + React Strict Mode（dev）+ `useEffect(fetch)` 场景非常常见。当前 hooks 没有做任何去重/缓存/取消，会把慢接口的体感直接放大 2 倍。

---

### 1. 环境与范围

- **页面**：`http://localhost:3002/hospital/cases`
- **相关页面与接口**
  - 列表页：`medical-crm/app/hospital/cases/page.tsx`
  - 列表 API：`medical-crm/app/api/hospital/cases/route.ts`
  - 详情页：`medical-crm/app/hospital/cases/[id]/page.tsx`
  - 详情聚合 API：`medical-crm/app/api/hospital/cases/[caseId]/full/route.ts`
- **数据源**
  - PostgreSQL（Prisma）：cases/users/documents/messages/…
  - Supabase Storage（Signed URL）：`createSignedUrl(key, 3600)`

---

### 2. 现象与证据（从你提供的日志抽取）

#### 2.1 页面路由渲染很快

- `GET /hospital/cases 200 in 65ms (compile: 17ms, render: 48ms)`  
  说明：页面壳、前端渲染不是瓶颈。

#### 2.2 列表数据接口慢（且出现两次）

- `GET /api/hospital/cases?page=1&limit=20 200 in 1512ms (render: 1510ms)`
- `GET /api/hospital/cases?page=1&limit=20 200 in 1288ms (render: 1284ms)`

对应的 Prisma 查询日志显示 where 条件为 `WHERE 1=1`，并执行：

- `COUNT(*) FROM (SELECT cases.id FROM cases WHERE 1=1 ...)`
- `SELECT ... FROM cases WHERE 1=1 ORDER BY updated_at DESC LIMIT ...`
- 以及 include 触发的 users/documents 批量查询

#### 2.3 详情聚合接口非常慢（16.8s）

- `GET /api/hospital/cases/660e.../full?messageLimit=50 200 in 16.8s`

同一次请求里可见 Prisma 会查询：

- `cases`（按 id）
- `users`（patient）
- `documents`（ACTIVE）
- `conversations`
- `case_progress`
- `messages`（conversationId = ?，取 50 条）
- `users`（sender）
- `COUNT(messages)`
- `messages`（conversationId IN (...) AND messageType=FILE，用于附件汇总）

但**这些数据库查询本身通常不应该达到 16.8s**；更符合 16.8s 的，是接口里还会为每个文档/附件逐个调用 Supabase Storage 生成签名 URL（这部分不会出现在 Prisma query logs 里）。

#### 2.4 Session API 日志（噪音，不是主因）

- `/api/auth/session` 返回 5–13ms，且打印了 cookie 长度与用户信息。  
  它对总耗时影响很小，但日志量偏大，会干扰定位。

---

### 3. 关键耗时路径（把“慢”拆成两条）

#### 3.1 列表页首屏路径

`/hospital/cases`（页面壳） → `useCases()` → `/api/hospital/cases`（1.3–1.5s）

这里的“慢”基本可以归因于 **列表 API 查询范围过大（where=1=1）**。

#### 3.2 详情页首屏路径

点击某个 case → `/hospital/cases/[id]`（页面壳很快）→ `useCaseFullDetail()` → `/api/hospital/cases/[id]/full`（16.8s）

这里的“慢”高度可疑来自：

- 文档/附件数较多 → Signed URL 生成次数多
- 可能存在重复签名（同一个 key 在多个步骤被签两遍）
- 文件消息附件查询未限制返回行数（FILE 消息量大时会放大）

---

### 4. 代码级根因定位（按接口）

#### 4.1 列表 Hook：无去重/缓存，开发环境可能触发双请求

- **文件**：`medical-crm/lib/api/hospital/hooks.ts`
- **现状**：`useCases()` 采用 `useEffect(() => fetch(), [fetch])`，没有去重、没有缓存。

影响：

- dev 下 Strict Mode 很容易看到同一请求 ×2（与你日志一致）
- 慢接口会被放大，且可能造成 loading 状态抖动

#### 4.2 列表 API：缺少 hospitalId 过滤 → 全表 COUNT + 全表排序

- **文件**：`medical-crm/app/api/hospital/cases/route.ts`
- **关键点**：
  - `where` 里 `assignedHospitalId` 过滤被注释为 TODO
  - 仍然执行 `case.count({ where })`（全表 count）
  - 主查询 `ORDER BY updatedAt DESC`（无过滤时会对全表排序）

这会在数据量增长后迅速恶化：即使只要 20 条，也得先在全表范围内完成 COUNT 与排序/扫描。

> 这和你日志里的 `WHERE 1=1` 完全吻合，是列表 1.3–1.5s 的首要嫌疑点。

#### 4.3 详情聚合 API：Signed URL 生成在首屏同步完成（且可能重复）

- **文件**：`medical-crm/app/api/hospital/cases/[caseId]/full/route.ts`

高风险点（按“最可能造成 16.8s”排序）：

- **(A) Signed URL 数量与耗时线性增长**  
  接口会对以下来源逐个签名：
  - `documents` 表中的每个文档
  - `case_progress.videoSummary.documentKey`（诊断附件 fallback）
  - `messages(FILE).attachments[]`（每个附件）
  - `diagnoses` 列表里再次对 `documentKey` 签名（重复）

- **(B) FILE 消息查询无上限**  
  `prisma.message.findMany({ where: { conversationId: { in }, messageType:'FILE' }, orderBy: { createdAt:'desc' } })` 没有 `take`，当历史文件消息多时会带来：
  - 更大的 DB 扫描与返回数据量
  - 更高的签名次数（attachments 数量暴涨）

- **(C) 查询字段未收窄**  
  文件消息只为了读 `attachments`，但默认会把 message 的其它字段也取回（content 等），增加序列化与传输成本。

---

### 5. 顶层根因分层（先修“性质”，再修“细节”）

#### 5.1 P0：列表 API 的“租户过滤”缺失

这是典型的“范围错误”问题：优化索引/SQL 之前，先把数据范围从“全站”收敛到“当前医院”。

#### 5.2 P0：详情聚合接口把“下载时才需要的签名 URL”前置成“首屏必做”

Signed URL 属于“交互时才需要”的数据（点击查看/下载才用）。在首屏同步全部生成，会把最慢的外部依赖（Storage）变成首屏关键路径。

#### 5.3 P0（放大器）：重复请求导致慢接口体感翻倍

这不是 SQL 能解决的。需要前端去重/缓存/取消（SWR/React Query 或最小实现），否则你会持续看到“明明单次 1.3s，体感却像 2–3s”。

---

### 6. 建议的验证/测量方案（最小侵入，先把 16.8s 拆开）

目标：把“16.8s”拆成可行动的分段指标。

- **6.1 给 `/full` 增加分段计时与计数**
  - Prisma 查询耗时（caseData、messages、count、fileMessages）
  - 需要签名的 key 总数（documents / progress / message attachments / diagnoses）
  - 实际调用 `createSignedUrl` 次数（以及去重后次数）

- **6.2 打印响应体规模（粗略即可）**
  - 返回 documents 数量、messages 数量
  - （可选）`JSON.stringify(data).length` 估算响应体字节数（仅 dev）

- **6.3 在浏览器 Network 面板确认是否存在 ×2 请求**
  - `/api/hospital/cases`
  - `/api/hospital/cases/[id]/full`

---

### 7. 优化方案（按优先级、风险、预期收益）

#### 7.1 P0（高收益、低风险）：列表 API 加 hospitalId 过滤 + 对齐索引

- **P0-A：从 session/token 获取 hospitalId，并加到 where**  
  目标：把 `WHERE 1=1` 收敛为 `WHERE assigned_hospital_id = ?`（以及状态/搜索条件）。

- **P0-B：为列表页建立复合索引（数据驱动）**  
  建议的候选索引：
  - `cases(assigned_hospital_id, updated_at DESC, id DESC)`
  - 若常按 stage 过滤：`cases(assigned_hospital_id, stage, updated_at DESC, id DESC)`

> 先做 P0-A 再做 P0-B：没有过滤时，索引收益会被“全表”吞没。

#### 7.2 P0（高收益、中风险）：详情聚合接口改“两段式签名”

思路：首屏先返回“文件清单（含 storageKey）”，**不生成 downloadUrl**；用户点击“查看/下载”时再签名（或只签名首屏可见的前 N 条）。

可选落地方式：

- **P0-C：新增 `GET /api/hospital/storage/signed-url?key=...`**  
  点击下载时请求一次签名 URL；可以顺便做短 TTL 缓存（例如 55 分钟）。

- **P0-D：保留 `/full` 但只签名前 N 份文档/附件**  
  UI 里“更多”再加载并签名，避免一次性把外部网络调用打满。

#### 7.3 P1（中收益、低风险）：/full 内部做去重 + 限制 FILE 消息扫描范围

- **P1-A：对 `signUrl(key)` 做 request-scope cache（Map）**  
  同一请求内同一个 key 只签名一次，避免 diagnoses/documents 重复签名。

- **P1-B：FILE 消息查询加上限 + 字段收窄**
  - 只 select `id, createdAt, attachments`（避免拉 content 等）
  - `take: 200`（或按业务决定）

- **P1-C：为 FILE 消息建立更合适的索引（需 EXPLAIN 验证）**
  - Partial index：`messages(conversation_id, created_at DESC) WHERE message_type='FILE'`
  - 或复合：`messages(conversation_id, message_type, created_at DESC, id DESC)`

#### 7.4 P1（中收益、中风险）：前端请求去重/缓存

当前 hooks 都是 `useEffect(fetch)`，建议逐步替换为 SWR/React Query：

- dedupe in-flight（避免 dev/重复渲染放大）
- cache（切回页面不必再等 1–2s）
- 更稳的 loading/错误状态管理（减少抖动）

#### 7.5 P2（低收益）：降低日志噪音

- `/api/auth/session` 不要在每次请求打印 cookie 长度与用户信息（至少用 debug 开关控制）。

---

### 8. 更可信的“预期效果”（用区间，不给拍脑袋数字）

在不改变业务功能前提下，比较现实的目标区间是：

- **列表 `/api/hospital/cases`**  
  - 做完 hospitalId 过滤后：通常应降到 **< 200ms**（取决于数据量与索引）
  - 再加复合索引：p95 更稳定

- **详情 `/api/hospital/cases/[id]/full`**  
  - 做“两段式签名”后：首屏通常可到 **< 1–3s**（取决于 messages/documents 数量）
  - 并且最关键：不再出现“文档一多就 10–20s”这种线性爆炸

---

### 附录 A：关键文件索引（便于直接开改）

- 列表页：`medical-crm/app/hospital/cases/page.tsx`
- 列表 Hook：`medical-crm/lib/api/hospital/hooks.ts`（`useCases`）
- 列表 API：`medical-crm/app/api/hospital/cases/route.ts`
- 详情页：`medical-crm/app/hospital/cases/[id]/page.tsx`（`useCaseFullDetail`）
- 详情聚合 API：`medical-crm/app/api/hospital/cases/[caseId]/full/route.ts`
- 你仓库已有的更底层分析：
  - `Cases页面数据库分析报告.md`
  - `medical-crm/migrations/008_optimize_cases_detail_page_ANALYSIS.sql`

