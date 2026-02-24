## /hospital/materials 性能分析报告（2026-02-22）

### 0. 结论摘要（先看这一段）

从日志与代码对齐后可以确定：**页面本身不慢**（`GET /hospital/materials 200 in 53ms`），慢的是页面加载后触发的一组 **`/api/hospital/materials-page/*` 数据请求**。当前体感“很慢 + 不稳定”的根因按影响排序是：

- **P0：远程依赖连接不稳定（硬伤）**  
  `hospital-info` 出现 `UND_ERR_CONNECT_TIMEOUT`（10s 连接超时），说明服务端请求远程 Supabase 时**连接建立就失败/过慢**。这不是纯 SQL 优化能解决的问题。
- **P0：重复请求 ×2 + 竞态覆盖（放大器）**  
  同一 API 在开发环境被调用两次；第二次 `hospital-info` 甚至 10s 超时 500，可能把 UI 状态覆盖成 error，造成“明明拿到数据仍显示失败/卡住”。
- **P0：`procedure-options` 查询过重（可立刻修）**  
  `procedure-options` 做 `!inner` join 且把 `overview`（长文本）选出来，极易造成响应体过大、序列化/传输/解析变慢（你的日志首个请求 3.0s）。
- **P1：过多 roundtrip + `select('*')` 造成 payload 胖**  
  多个接口都先“查第一个 active hospital id”，然后再查各自表；并且大量 `select('*')` 拉了 UI 不需要的大 JSON 字段，放大远程链路成本。
- **P1：显式禁用缓存**  
  `hospital-info` 返回 `Cache-Control: no-store`，使远程抖动被无限放大；`procedure-options` 这种低频数据也没有任何缓存/去重策略。

> 你朋友报告里的第 2/3/4/5 点（重复请求、hospital-info 慢、procedures 慢、procedure-options 慢）与本报告高度重合；主要需要修正的是“**串行相加=30s**”这个耗时模型（详见 3.2）。

---

### 1. 环境与范围

- **页面**：`http://localhost:3002/hospital/materials`
- **后端形态**：Next.js App Router 的 Route Handlers（`medical-crm/app/api/hospital/materials-page/*/route.ts`）
- **数据源**：通过 `@supabase/supabase-js` 使用 service role key 访问“主项目 Supabase”
  - 配置：`medical-crm/lib/mainSupabase.ts`

---

### 2. 现象与证据（从你提供的日志抽取）

#### 2.1 页面壳很快，慢在数据接口

- `GET /hospital/materials 200 in 53ms (compile: 14ms, render: 39ms)`  
  说明：页面路由渲染不是瓶颈。

#### 2.2 API 瀑布（按耗时从大到小）

> 以下均为你日志中的服务端耗时（`render:`），且很多请求出现 **两次**。

- **`GET /api/hospital/materials-page/hospital-info`**
  - 200 in **13.5s**
  - 500 in **10.5s**（错误是 `ConnectTimeoutError ... timeout: 10000ms`）
- **`GET /api/hospital/materials-page/procedures`**
  - 200 in **9.3s**
  - 200 in 1789ms
- **`GET /api/hospital/materials-page/procedure-options`**
  - 200 in **3.0s**
  - 200 in 769ms
- **`GET /api/hospital/materials-page/surgeons`**
  - 200 in **2.5s**
  - 200 in 1380ms
- **`GET /api/hospital/materials-page/cases`**
  - 200 in 1858ms
  - 200 in 2.0s

#### 2.3 关键错误（决定“慢 + 不稳定”的性质）

`hospital-info` 的错误：

```
TypeError: fetch failed
Caused by: ConnectTimeoutError: Connect Timeout Error ... timeout: 10000ms (UND_ERR_CONNECT_TIMEOUT)
```

这条证据意味着：**并不是“查询慢”那么简单**，而是服务端到远程 Supabase/其上游（Cloudflare）存在连接建立层面的不稳定，导致请求直接卡满 10s 后失败。

---

### 3. “你朋友补充报告”的对齐与修正

#### 3.1 与本报告重合（判断正确）

- **每个 API 都被调用 2 次**：日志确凿，且你们 hooks 是 `useEffect(fetch)` 模式，没有去重/取消/缓存，开发环境下非常容易触发双请求。
- **`hospital-info` 慢且偶发超时**：日志确凿；且代码已经 `Promise.all` 并行了 3 条查询，仍然 13.5s，说明主要瓶颈更可能是远程链路或某条查询极慢。
- **`procedures` 多次串行查询**：代码确实分段 roundtrip（先医院、再 hospital_procedures、再 procedures）。
- **`procedure-options` 的 join 很重**：代码确实 join 且选 `overview` 长文本。

#### 3.2 需要修正：不是“5 个 hooks 串行相加=30s”

“总耗时 = 13.5 + 9.3 + 3.0 + 2.5 + 2.0 ≈ 30s”这句话作为“首屏必然耗时模型”不严谨，原因：

- 你们每个 hook 的请求都是在各自组件 mount 后触发，**默认是并发启动**，首屏等待更接近 `max(...)` 而不是 `sum(...)`。
- 另外页面实现里存在 Tab 懒加载：`ProceduresTab / SurgeonsTab / CasesTab` 只有在 `visitedTabs` 包含对应 tab 时才会渲染（从而触发 `useProcedures/useSurgeons/useCases`）。

但这并不否认“用户体验可能接近累计相加”：

- 如果用户在短时间内快速点击多个 Tab（或某些逻辑使多个 Tab 同时渲染），就会在一个交互流程里触发更多请求，体验上会像“逐个加载、累计等待”。

> 因此建议报告里把耗时拆成两类：**首屏路径**与**全 Tab/全功能路径**，避免模型误导。

---

### 4. 代码级根因定位（按接口）

#### 4.1 `hospital-info`：远程 Supabase + 明确禁用缓存 + 偶发连接超时

- **实现文件**：`medical-crm/app/api/hospital/materials-page/hospital-info/route.ts`
- **数据源**：`getMainSupabaseClient()` → `medical-crm/lib/mainSupabase.ts`
  - `MAIN_SUPABASE_URL = 'https://yamlikuqgmqiigeaqzaz.supabase.co'`（远程）
  - 使用 service role key
- **查询结构**：
  - 先取 active hospital（`hospitals`）
  - 再 `Promise.all` 并行取 translation/location/nearbyAttractions（已并行）
- **返回头**：显式 `no-store`（每次都必打远程）

关键判断：

- 如果瓶颈来自“顺序查询”，`Promise.all` 应该能显著改善；但你仍然看到 **13.5s**，且另一次直接 **10s 连接超时**。  
  这更符合“远程连接/链路抖动”或“单条查询极慢（并非顺序）”。

> 建议先用“分段计时”把 13.5s 拆到具体哪条 Supabase 请求（见第 6 章）。

#### 4.2 `procedure-options`：join + 拉长文本（overview）导致 payload 过大

- **实现文件**：`medical-crm/app/api/hospital/materials-page/procedure-options/route.ts`
- **现状查询**：

```
select(`
  id,
  procedure_name,
  slug,
  procedure_translations!inner(language_code, overview)
`)
eq('procedure_translations.language_code', 'zh')
```

问题点：

- `overview` 通常是长文本，不适合作为下拉选项的“中文名”来源；即使 UI 不用，也会被传输/解析，变慢。
- `!inner` join + order + 全量返回，容易在数据量增大后变成秒级甚至更高。

#### 4.3 `procedures`：多次 roundtrip + `select('*')` + `in(id数组)` 放大远程成本

- **实现文件**：`medical-crm/app/api/hospital/materials-page/procedures/route.ts`
- **结构**：
  1) 查 hospital id  
  2) 查 hospital_procedures（全字段）  
  3) 再查 procedures（全字段，`in(procedureIds)`）

可优化点：

- 如果 Supabase 外键关系完备，可在 `hospital_procedures` 查询里直接选择关联 `procedures(...)`，减少 roundtrip 与 payload。
- 或至少把第三步的 procedures 选择字段收窄（只要 `id, procedure_name, slug, name_zh` 等）。

#### 4.4 `surgeons` / `cases`：`select('*')` 拉大 JSON 字段，远程链路下性价比低

这两条接口结构相对简单，但仍可能慢在：

- `select('*')` 返回大 JSON（如 `translations`, `bio`, `images` 等）
- 数据量较大时，全量传输 + JSON 解析耗时上升

---

### 5. 顶层根因分层（重要：先修“性质”，再修“细节”）

#### 5.1 P0：连接超时（网络/上游可达性）

证据是 `UND_ERR_CONNECT_TIMEOUT`。这意味着：

- 索引/SQL 优化无法解决“连不上/连接建立太慢”
- 把超时从 10s 改成 30s 可能让失败更慢、体感更差

更合理方向：

- **快速失败 + 降级返回可用数据**（不要整页 500/空白）
- **短 TTL 缓存**（减少触发远程连接的频率）
- **客户端/服务端请求去重**（避免同一时刻打两次远程）

#### 5.2 P0：重复请求与竞态覆盖

你日志里最危险的组合是：

- 第一次 `hospital-info` 成功（13.5s）
- 第二次 `hospital-info` 超时失败（10.5s）

如果前端简单用一个 state 接受两次结果，最终 UI 可能呈现：

- loading 抖动
- error 覆盖 success
- 页面看起来“更慢、更不稳定”

#### 5.3 P0：procedure-options payload 过重（立刻可降到亚秒级的机会）

下拉选项不应携带 `overview` 长文本；这是低风险高收益改动。

---

### 6. 先做“定位再下刀”：建议的验证/测量方案（最小侵入）

目标：把“13.5s”拆成“哪条查询慢 / 是否网络慢 / 是否 payload 大 / 是否重复调用造成竞态”。

#### 6.1 为每个 materials-page API 加统一的请求关联 ID（定位重复与竞态）

建议每次请求生成 `requestId`（例如 `crypto.randomUUID()`），日志打印时带上：

- requestId
- endpoint
- supabase 子查询耗时分段
- 返回数据规模（rows count / JSON size）

这样可以在日志里看到“同一个 endpoint 两次请求的顺序与覆盖关系”。

#### 6.2 `hospital-info` 做分段计时（必须）

在 `hospital-info/route.ts` 里对 4 个查询分别计时：

- fetch hospital
- fetch translation
- fetch location
- fetch nearbyAttractions

并打印每段耗时。这样才能判断：

- 是某一段查询慢
- 还是整体都慢（更像网络/连接/冷启动）

#### 6.3 记录响应体大小（找 payload 杀手）

尤其是：

- `procedure-options`（是否因为 join/overview 巨大）
- `surgeons` / `cases`（是否 `select('*')` 带来大 JSON）

#### 6.4 在浏览器 Network 面板确认两点

- 首屏到底发了哪些请求（是否真的触发了 procedures/surgeons/cases）
- 每条请求是否稳定触发两次（以及是否第二次更容易失败）

---

### 7. 优化方案（按优先级、风险、预期收益）

#### 7.1 P0（高收益、低/中风险）：先把“不稳定”变“稳定”

- **P0-A：修复重复请求的竞态（前端）**
  - 增加“inflight 去重 / AbortController / 只接受最后一次请求结果”的保护
  - 或引入 SWR/React Query（重点收益是：去重、缓存、重试、竞态控制）
  - 注意：SWR 的价值不是“并行化”（请求本来就并发），而是“**dedupe + cache + revalidate**”

- **P0-B：`hospital-info` 做降级返回**
  - 远程 translation/location/attractions 任意失败时，不要整条 500；优先返回基础 hospital（至少页面能渲染）
  - 同时把错误以可观测方式返回（例如 `partial: true` + warnings）

- **P0-C：给低频数据加短 TTL 缓存**
  - `procedure-options`：5~30 分钟缓存都合理
  - `hospital-info`：1~5 分钟缓存（后台编辑页也能接受）
  - 形式可以是 Next 侧缓存（如 `unstable_cache`）或响应头缓存（视部署环境而定）

#### 7.2 P0（高收益、低风险）：立刻把 `procedure-options` 变轻

- 去掉 join，至少不要选 `overview` 长文本
- 只返回下拉需要的字段：`id, procedure_name, slug`（以及真正存在的中文名字段）
- 如确需中文 label：不要用 overview 代替“名称”，应在表结构上提供 `name_zh` 或在翻译表里提供 `name` 字段

#### 7.3 P1（中收益、中风险）：减少 roundtrip 与 payload

- **P1-A：`procedures` 用关联 select 或收窄字段**
  - 把 `procedures` 查询字段收窄
  - 若外键关系正常，考虑在 `hospital_procedures` 查询里直接带上 `procedures(...)`

- **P1-B：所有接口避免 `select('*')`**
  - 为 UI 定义最小字段集（尤其含 JSONB 的表）

- **P1-C：不要在每个接口都“查第一个 active hospital”**
  - 从 session/token 解析 hospitalId（一次即可）
  - 或做一个服务端 “bootstrap” endpoint 统一返回 hospitalId 与所有 tab 的必要数据

#### 7.4 P2（长期收益）：结构性方案

- **P2-A：增加一个 `/materials-page/bootstrap` 聚合接口**
  - 一次请求返回：hospitalInfo + procedures + surgeons + cases + procedureOptions
  - 优点：减少请求数、减少重复 hospital 查询、统一缓存/降级策略

- **P2-B：Supabase/网络层优化**
  - 若业务允许，把 Supabase 区域/网络可达性优化（例如本地/机房到其区域链路）
  - 这部分通常是“能让超时消失”的关键，但需要基础设施支持

---

### 8. 关于“索引、JOIN 一次查完”的态度（该做，但别误判它能解决超时）

你朋友提出的索引/单次 JOIN 查询是合理的“数据库性能优化”，但需要强调：

- **连接超时**优先级更高：先确保可稳定连上远程服务。
- 只有当分段计时证明“连上了但查询慢”，索引与 JOIN 才会带来明显收益。

推荐顺序：

1) 分段计时定位是否“查询慢”还是“连接慢/不通”  
2) 若是查询慢：再考虑索引、字段收窄、JOIN/减少 roundtrip  
3) 若是连接慢：优先缓存、降级、去重、重试退避、基础设施排查

---

### 9. 预期效果（更可信的估计方式）

不要用“把 5 个接口耗时相加=30s”的模型来估算首屏；更合理的是按两条路径估算：

- **首屏路径（只渲染 Hospital Tab）**：主要由 `hospital-info`（再加上 procedure-options 若父组件始终请求）决定，理论上接近 `max(hospital-info, procedure-options)`。
- **全流程路径（用户依次访问所有 Tab）**：更像累计等待（尤其没有缓存时），但去重/缓存后会显著改善。

最可落地的目标（不承诺“2s”，先把不稳定消掉）：

- `procedure-options`：3.0s → **< 500ms**（去掉 join/overview + 缓存）
- `hospital-info`：13.5s/偶发超时 → **稳定在 1~3s**（缓存 + 降级 + 去重后，至少不再 10s 挂死）
- 重复请求：×2 → **×1**（dedupe/取消/缓存）

---

### 10. 对“今天/明天/本周”优化建议的评估与落地（补充）

本节对外部建议逐条评估：哪些**正确且高收益**、哪些需要**调整预期/适用范围**，并给出更落地的里程碑。

#### 10.1 今天可做（高收益，建议优先）

- ✅ **简化 `procedure-options` 查询（去掉 JOIN，尤其不要选 `overview` 长文本）**  
  这是典型“响应体减肥”优化：风险低、收益确定，通常能从秒级降到亚秒级，并减少带宽/JSON 解析负担。

- ✅ **引入 SWR/React Query（关键价值是去重与缓存，不是并行）**  
  目前 hooks 都是 `useEffect(fetch)`，开发环境出现“重复请求 ×2”时，SWR 能提供：
  - 请求去重（dedupe / 同 key 合并 in-flight）
  - 缓存（避免切 Tab/回到页面重复打远程）
  - 更好的竞态控制（降低“第二次失败覆盖第一次成功”的概率）
  > 注意：单纯把多个 fetch 用 `Promise.all` 包起来，往往**不会**显著改善首屏，因为这些请求本来就可能并发；真正能立刻改善的是“去重 + 缓存 + 竞态控制”。

- ✅ **添加 Next 层短 TTL 缓存（优先给低频数据）**  
  - `procedure-options`：5–30 分钟 TTL 合理  
  - `hospital-info`：1–5 分钟 TTL + 编辑后主动 revalidate（或绕过缓存）
  > 缓存 key 必须包含 `hospitalId`（或等价身份），避免跨医院串数据风险。

- ✅ **`hospital-info` 的失败降级（不要整条 500）**  
  你当前最致命的问题是 `UND_ERR_CONNECT_TIMEOUT`（10s）+ 500。更合理是：
  - 允许 translation/location/attractions 某一段失败时返回部分数据（`partial: true` + warnings）
  - 页面至少能渲染，体感从“挂死/报错”变成“可用但部分缺失”

#### 10.2 明天做（深度优化：有效，但依赖定位结果）

- ✅ **数据库索引**（只解决“连上了但查询慢”）  
  如果分段计时表明某条查询稳定慢（而不是连接超时/网络抖动），索引会有明显收益；但它无法解决 `ConnectTimeout`。

- ✅ **优化 `procedures` API（减少 roundtrip / 收窄字段 / 关联查询）**  
  当前结构至少 2–3 次远程 roundtrip 且 `select('*')`，在远程链路下成本会被放大。  
  推荐优先做“字段收窄 + 关联查询（如 `hospital_procedures` 带 `procedures(...)`）”，其次再考虑更激进的 JOIN/视图。

- ⚠️ **优化 `hospital-info` 为单次关联查询**（可能有帮助，但不是解决超时的核心）  
  你们已经 `Promise.all` 并行 3 条查询，仍然 13.5s 且有 10s connect timeout。  
  合并为单次关联查询可以减少 roundtrip，但若根因是“连接建立不稳定”，它依然会失败；因此应与“缓存 + 降级 + 去重”配套，而不是单独押注。

#### 10.3 本周做（架构升级：并非都适用于后台页）

- ✅/⚠️ **Redis 缓存**：在多实例/需要跨进程共享缓存时收益大；单机或少实例下，Next 层短 TTL 缓存已能覆盖大部分收益。建议在“P0 稳定性修复完成后”再上。

- ⚠️ **ISR（增量静态生成）**：通常**不适合** `/hospital/materials` 这类后台管理页（带 session/cookie/权限与编辑），容易缓存错人/数据不一致。ISR 更适合公共展示页（非登录态）。

- ✅/⚠️ **CDN 缓存**：对静态资源肯定有益；对带 Cookie 的 API 通常默认不缓存，若要缓存必须设计好 `Cache-Key/Vary` 与权限边界。对“后台 API 响应速度”不一定是主战场。

#### 10.4 更可信的“预期区间”（建议用这套口径对齐团队）

- **首屏（Hospital Tab）**：主要看 `hospital-info` 与（若父组件总取）`procedure-options`  
  - 做完「去重 + procedure-options 减肥 + 短 TTL 缓存 + hospital-info 降级」后，目标应是“稳定可用 + 不再 10s 挂死”，并把峰值拉下来。
- **全流程（依次点完各 Tab）**：缓存与去重的收益更明显  
  - 目标是“第二次进入/切回 Tab 几乎不再重新打远程”，把体验从“每次都等一遍”变成“基本秒开”。

---

### 附录 A：关键文件索引（便于你/团队直接开改）

- 页面入口：`medical-crm/app/hospital/materials/page.tsx`
  - `useHospitalInfo()` 在 `HospitalInfoTab`
  - `useProcedureOptions()` 在父组件（会影响首屏）
  - `useProcedures/useSurgeons/useCases` 位于各 Tab 组件（理论上应受 `visitedTabs` 控制）
- Hooks：`medical-crm/lib/api/hospital/materials-hooks.ts`
- API Routes：
  - `medical-crm/app/api/hospital/materials-page/hospital-info/route.ts`
  - `medical-crm/app/api/hospital/materials-page/procedure-options/route.ts`
  - `medical-crm/app/api/hospital/materials-page/procedures/route.ts`
  - `medical-crm/app/api/hospital/materials-page/surgeons/route.ts`
  - `medical-crm/app/api/hospital/materials-page/cases/route.ts`
- Supabase client：`medical-crm/lib/mainSupabase.ts`

