# 机械式菜单聊天机器人设计

日期：2026-06-01

## 背景

China 公共站现在使用右下角现有 `ChatWidget` 承接未注册患者。用户先填写 basic form，然后进入由 CRM v2 patient/case/session 支撑的聊天流程。

这次改动的目标，是停止在这个访客入站流程里使用 AI/v3/v4 的自由聊天回复。体验仍然像一个被引导的聊天，但所有回复和操作都应该是确定性的：固定 assistant 文案、composer 上方的 compact action-bar 按钮、可复用的 modal/upload/questionnaire block，以及 CRM v2 持久化状态。用户提交的资料、附件、病情表和联系顾问请求仍然必须进入 CRM v2。

相关 China 前端区域：

- `src/components/chat/ChatWidget.tsx`
- `src/components/chat/PatientEntryWindow.tsx`
- `src/components/chat/PatientChatComposer.tsx`
- `src/components/chat/PatientQuestionnaireModal.tsx`
- `src/components/chat/PatientMedicalFormModal.tsx`
- `src/services/api/patient-entry.ts`
- `src/services/api/patient-messages.ts`
- `src/services/api/patient-chatbot-v3.ts`

相关 CRM v2 区域：

- `/Users/haowang/Desktop/claws/medical-crm-v2/apps/api/src/routes/patient-protected.routes.ts`
- `/Users/haowang/Desktop/claws/medical-crm-v2/packages/application/src/use-cases/messages/send-message.use-case.ts`
- `/Users/haowang/Desktop/claws/medical-crm-v2/packages/application/src/use-cases/conversations/resume-conversation-ai.use-case.ts`
- `/Users/haowang/Desktop/claws/medical-crm-v2/packages/application/src/use-cases/question-collector/submit-response.use-case.ts`

## 目标

保留现有右下角聊天框和 basic form，但把 AI 自由对话替换成机械式菜单聊天流程：

1. 用户打开现有聊天框。
2. 用户完成现有 basic form。
3. CRM v2 继续创建或恢复 patient、case、session。
4. 聊天时间线显示一条固定 assistant 确认消息。
5. 聊天输入框上方出现一条矮矮的 compact action bar，不作为聊天 message 出现在历史里。第一条 action bar 显示四个固定选项：
   - `了解就医流程`
   - `上传医疗资料`
   - `联系顾问`
   - `填写病情表`
6. 用户选择一个动作后，compact action bar 立即隐藏，并开始一轮由 pre message、action message、post message 组成的 action turn。
7. action 完成后，该 action message 显示完成状态，并追加 post message。
8. compact action bar 刷新，只显示剩余可做或可重复做的动作。

流程可以循环，直到用户完成主要动作。可重复动作继续保留，但展示更新后的 label。

## 非目标

- 不创建新的独立聊天框。
- 不让患者自由输入走 AI/v3/v4 聊天路线。
- 不生成新的医疗建议、诊断或分诊文案。
- 不把每条装饰性的固定 assistant 消息都作为普通 CRM message 持久化，除非它代表有业务意义的事件。
- 不强制固定操作顺序。

## 固定 Assistant 文案

basic form 成功后显示：

> 您好，我是 Medora 医疗旅程助手。我们已经收到您的基本信息。接下来您可以先了解赴华就医流程、上传已有医疗资料、填写病情表，或请顾问接手联系您。您提交的内容会进入 Medora CRM，由人工团队跟进查看。

语气保持克制、服务型。不要暗示 bot 正在诊断、分诊或生成医疗建议。

## 菜单动作行为

### 通用交互模型

菜单渲染为聊天输入框正上方一条矮矮的 compact action bar。它不是聊天 message，不进入 scrollback 历史。

用户点击任意一个 action 后：

- compact action bar 立即隐藏。
- 追加一条 pre message，用来解释接下来会发生什么。
- 追加一条 action message。
- action 完成后，该 action message 显示完成状态。
- 追加一条 post message，用来确认已收到/已完成，并说明后续预期。
- compact action bar 刷新，展示可继续操作的动作。

选项无固定顺序，用户可以按任意顺序选择可用动作。

### Action Turn Message 模型

每一次被选择的 action turn 都有三段 message：

1. `preMessage`：用户选择动作后立刻展示的解释性文案。
2. `actionMessage`：真正执行动作的可复用 UI block，例如流程/服务规则确认 box、上传 box、handoff action、questionnaire modal trigger。
3. `postMessage`：只有 action 成功完成后才展示的收到/完成确认文案。

可重复动作后期可以再次进入。`actionMessage` 可以复用同一个组件，但 `preMessage` 和 `postMessage` 必须根据首次进入或再次进入选择不同文案。

示例：

- 第一次 `MEDICAL_RECORDS` 可以说明“请上传医疗资料”；再次进入时说明“可以补充上传材料”。
- 第一次 `QUESTIONNAIRE` 可以说明“请填写病情表”；再次进入时说明“可以修改病情表”。
- 一次性动作只需要首次进入文案。

共享前置条件：

- `MEDICAL_RECORDS`、`ADVISOR_HANDOFF`、`QUESTIONNAIRE` 三个动作都必须先完成服务规则确认。
- 这个前置条件复用 `PROCESS_GUIDE` 使用的同一个流程/服务规则 message box。
- 如果用户在确认服务规则前选择这三个动作中的任意一个，必须先展示该动作自己的 prerequisite pre message，解释“请您先同意赴华就医流程和服务规则，然后我们才能继续当前动作”。
- prerequisite pre message 后面的 action message 应展示流程/服务规则确认 box。
- 用户在该 box 中确认后，当前选择的动作继续在同一轮 turn 里执行；compact action bar 仍然隐藏，直到当前动作完成或失败。
- 如果用户关闭流程/服务规则 modal 但没有点击确认，当前动作不算完成，必须追加未确认 post message，说明暂时无法继续该动作；随后 compact action bar 重新出现，仍允许用户再次选择。
- 通过这个前置条件完成服务规则确认，也同时完成 `PROCESS_GUIDE`，所以后续 compact action bar 中不再显示 `了解就医流程`。

### 了解就医流程

Pre message：

`好的，我为您打开赴华就医流程说明。`

Action message：

- 复用现有流程说明 modal，但只有用户在 modal 里点击确认控件后才算完成。
- 仅打开 modal 不算完成。
- 如果用户关闭 modal 但没有确认，该 action 不算完成，action message 显示未确认/可重试状态。
- 完成后，该选项从 compact action bar 中隐藏。

确认后的 post message：

`您已确认赴华就医流程和服务规则。您可以继续上传医疗资料、填写病情表，或联系顾问。`

未确认/关闭 modal 后的 post message：

`您还没有确认赴华就医流程和服务规则。您可以稍后再次打开确认；确认后才能继续上传医疗资料、填写病情表或联系顾问。`

### 上传医疗资料

Pre message：

如果尚未确认服务规则：

`请您先同意赴华就医流程和服务规则，然后我们才能继续引导您上传医疗资料。`

确认服务规则后：

`您可以在以下的 message box 中上传您的医疗资料。我们的团队会在 24 小时之内审核您的资料，并给出最合适的医疗旅游建议和医院推荐。`

再次进入 pre message：

`您可以继续在以下的 message box 中补充上传医疗资料。我们的团队会把新资料一起纳入审核，会在 24 小时之内审核您的资料，并给出最合适的医疗旅游建议和医院推荐。`

Action message：

- 尽量复用现有资料收集/上传体验。
- 现有 `MaterialCollectionBlock` 已包含服务规则确认、资料清单，以及“文字和文件进入 CRM v2”的说明。
- 如果用户尚未确认服务规则，先展示现有流程/服务规则 message box。
- 用户确认服务规则后，在同一轮 selected action turn 中直接展示上传医疗资料的 message box。
- 至少成功上传 1 个附件后算完成。
- 首次上传成功后，compact action bar 中该动作继续保留，但 label 改为 `补充上传材料`。
- 后续补充上传仍然允许，并继续进入 CRM v2。

Post message：

`我们已收到您上传的医疗资料。Medora 医疗团队会在 24 小时内审核，并给出医疗旅游建议和医院推荐。`

再次进入 post message：

`我们已收到您补充上传的医疗资料，并会和此前资料一起审核，会在 24 小时之内审核您的资料，并给出最合适的医疗旅游建议。`

### 联系顾问

Pre message：

如果尚未确认服务规则：

`请您先同意赴华就医流程和服务规则，然后我们才能继续为您转接专业医疗团队。`

确认服务规则后：

`已为您把整个 case 转交给我们专业的医疗团队，Medora 医疗团队会在 24 小时内跟进并给出医疗建议，请注意查收您的邮箱。`

Action 行为：

- 先要求完成服务规则确认，逻辑与 `MEDICAL_RECORDS` 的前置条件一致。
- 调用 CRM v2 patient handoff endpoint。
- CRM v2 必须原子地把 care-team `ADMIN_PATIENT` session/conversation 切换到 `assistantMode = HUMAN_TAKEOVER`。
- endpoint 必须幂等。如果已经是人工接手，重复调用返回成功，不重复写系统提示。
- 完成后，该选项从 compact action bar 中隐藏。

Post message：

`您的 case 已转交给 Medora 医疗团队。请注意查收邮箱，我们会在 24 小时内跟进。`

### 填写病情表

Pre message：

如果尚未确认服务规则：

`请您先同意赴华就医流程和服务规则，然后我们才能继续引导您填写病情表。`

确认服务规则后：

`好的，请填写病情表，顾问和医生会根据这些信息评估您的情况。`

再次进入 pre message：

`您可以修改已填写的病情表。保存后，Medora 医疗团队会以最新内容为准继续评估。`

Action message：

- 先要求完成服务规则确认，逻辑与 `MEDICAL_RECORDS` 的前置条件一致。
- 追加固定介绍 message，并带现有 `QUESTIONNAIRE_MODAL_TRIGGER`。
- 点击后打开现有 `PatientQuestionnaireModal`，也就是 `PatientMedicalFormModal`。
- 提交后，该 action 完成。
- 提交完成后，compact action bar 中该动作继续保留，但 label 改为 `修改病情表`。
- `修改病情表` 打开同一个 modal，加载已有答案，并允许编辑。
- 保存时应更新/覆盖该 case 现有 CRM v2 questionnaire response。

Post message：

`我们已收到您的病情表。Medora 医疗团队会结合您的资料继续评估。`

再次进入 post message：

`您的病情表已更新。Medora 医疗团队会以最新内容继续评估。`

CRM v2 当前 `SubmitResponseUseCase` 已经会在 response 存在时更新已有 response。China 前端当前 `PatientMedicalFormModal` 在提交后会进入 read-only；实现时需要为这个机械聊天流程改成可编辑覆盖。

## 状态模型决策

CRM v2 是 mechanical chat state 的唯一权威。China 前端负责根据状态渲染，并发送 action select/complete 事件；不能只依赖本地组件状态。

状态 scope 是 CRM case + care-team patient session。状态存储在 CRM v2，而不是 China localStorage，因为刷新/session restore 后必须恢复已完成 action message、selected in-progress turn，以及 compact action bar 的可用状态。

Mechanical mode 是显式 CRM flag：

- `mechanicalChat.enabled = true`
- China guest widget 通过 `/onboarding/init` 创建的 session 设置该 flag。
- 它不是第三种 `assistantMode`；`assistantMode` 仍然只保留 `AI_ACTIVE | HUMAN_TAKEOVER`。
- mechanical mode 下，China widget 不调用 chatbot v3/v4 自由聊天接口。
- mechanical mode 下，即使 care-team session 仍是 `AI_ACTIVE`，CRM v2 也可以允许正式 patient document upload，因为这个公共 widget 已经由机械流程替代 AI 回复。

必需状态形状：

```ts
type MechanicalChatActionStatus = 'available' | 'selected' | 'completed';
type MechanicalChatActionKey =
  | 'PROCESS_GUIDE'
  | 'MEDICAL_RECORDS'
  | 'ADVISOR_HANDOFF'
  | 'QUESTIONNAIRE';

type MechanicalChatEvent = {
  id: string;
  turnId: string;
  actionKey: MechanicalChatActionKey;
  eventType: 'SELECTED' | 'COMPLETED';
  statusLabel: string;
  createdAt: string;
  idempotencyKey: string;
  selectedEventId?: string;
};

type MechanicalChatState = {
  enabled: boolean;
  introShown: boolean;
  actions: {
    processGuide: {
      status: MechanicalChatActionStatus;
      completedAt?: string;
    };
    medicalRecords: {
      status: 'available' | 'selected';
      hasCompletedBefore: boolean;
      uploadedCount: number;
      completedAt?: string;
    };
    advisorHandoff: {
      status: MechanicalChatActionStatus;
      completedAt?: string;
    };
    questionnaire: {
      status: 'available' | 'selected';
      hasCompletedBefore: boolean;
      completedAt?: string;
    };
  };
  events: MechanicalChatEvent[];
};
```

可重复动作状态规则：

- `PROCESS_GUIDE` 和 `ADVISOR_HANDOFF` 是一次性动作。完成后 status 为 `completed`，后续不可选。
- `MEDICAL_RECORDS` 和 `QUESTIONNAIRE` 是可重复动作。每次完成后当前 status 回到 `available`；历史完成通过 `hasCompletedBefore`、`completedAt`、`uploadedCount` 和 completed events 表示。
- 可重复动作被选择但当前 turn 未完成时，status 为 `selected`。
- label 由历史状态推导：
  - `MEDICAL_RECORDS.hasCompletedBefore = false` -> `上传医疗资料`
  - `MEDICAL_RECORDS.hasCompletedBefore = true` -> `补充上传材料`
  - `QUESTIONNAIRE.hasCompletedBefore = false` -> `填写病情表`
  - `QUESTIONNAIRE.hasCompletedBefore = true` -> `修改病情表`

初始化规则：

- `/onboarding/init` 为 China guest widget session 初始化 `mechanicalChat.enabled = true`、`introShown = true`、空 `events`，并把四个动作设为 `available`。
- 如果旧 mechanical session restore 时缺少 `introShown`，前端应把 `mechanicalChat.enabled = true` 当作足够条件来渲染 intro 和第一条 compact action bar。这是兼容 fallback，不是主要状态契约。
- intro 不是用户可关闭项。只要 mechanical mode enabled，重建时间线时都显示 intro。

## Mechanical State API

CRM v2 应暴露 patient-safe action endpoints。China 前端只能通过这些接口直接改变 mechanical state。

### Select Action

`POST /api/patient/sessions/:sessionId/mechanical-chat/actions/select`

Request：

```ts
{
  actionKey: MechanicalChatActionKey;
  idempotencyKey: string;
}
```

行为：

- 验证 patient 拥有该 session。
- 验证 `mechanicalChat.enabled = true`。
- 如果存在任意 selected event 尚未匹配 completed event，则拒绝新的 selection，并返回当前 `MechanicalChatState` 让前端重建进行中的 action。
- 对不可用的一次性动作返回拒绝，除非是相同 idempotency key 的重复 selected/completed。
- 追加 `SELECTED` event。
- 为本次 selected action 生成新的 `turnId`，并把 selected event `id` 和 `turnId` 返回给前端。
- 返回更新后的 `MechanicalChatState`。
- 不执行业务副作用，例如打开 modal、上传文件、提交问卷、handoff。

### Complete Action

`POST /api/patient/sessions/:sessionId/mechanical-chat/actions/complete`

Request：

```ts
{
  actionKey: MechanicalChatActionKey;
  selectedEventId: string;
  turnId: string;
  idempotencyKey: string;
  result?: {
    uploadedCount?: number;
    questionnaireResponseId?: string;
    handoffConversationId?: string;
  };
}
```

行为：

- 验证 ownership 和 mechanical mode。
- 验证 `selectedEventId` 和 `turnId` 指向当前 selected 且 incomplete 的 action。
- 如果该 action 对相同 business result 尚未完成，则追加 `COMPLETED` event。
- completed event 保存相同 `selectedEventId` 和 `turnId`。
- 一次性动作完成后标记为 completed。
- `MEDICAL_RECORDS`：刷新 uploaded count，设置 `hasCompletedBefore = true`，更新 `completedAt`，当前 status 回到 `available`，label 为 `补充上传材料`。
- `QUESTIONNAIRE`：设置 `hasCompletedBefore = true`，更新 `completedAt`，当前 status 回到 `available`，label 为 `修改病情表`。
- 返回更新后的 `MechanicalChatState`。

`result.uploadedCount` 是该 session/case 的已上传附件总数，不是本次 batch increment。如果 `MEDICAL_RECORDS` completion 未提供该值，CRM v2 应从已持久化的 formal message attachments 推导总数。

业务 endpoint 可以在内部调用 completion 逻辑，使业务写入和状态更新在需要时处于同一事务。

## 数据流

### Basic Form

- China 继续调用 `/onboarding/init`。
- CRM v2 创建/恢复 patient、case、widget/formal sessions。
- 前端随后渲染 mechanical intro，并在 composer 上方渲染第一条 compact action bar。

### Mechanical Messages

固定 mechanical messages、action messages 和 compact action bar 状态可以由前端根据 `MechanicalChatState` 生成。

它们不需要作为普通 CRM conversation messages 存储，除非代表 CRM staff 应看到的业务事件。

应作为业务数据或事件写入 CRM 的内容包括：

- 患者上传文件。
- 患者提交/更新病情表。
- 患者请求顾问接手。

### Uploads

上传路径应使用 formal CRM session upload/message API，确保文件进入 CRM v2：

- `POST /api/patient/sessions/:sessionId/attachments/upload`
- 上传到返回的 signed URL，或走 proxy fallback
- `POST /api/patient/sessions/:sessionId/messages` 保存 attachment metadata

当前 CRM v2 会在 `assistantMode = AI_ACTIVE` 时阻止 care-team formal patient message/upload。mechanical mode 下，资料上传必须不要求先 handoff，也不能触发 AI 回复。

后端区分规则：

- 如果该 session `mechanicalChat.enabled = true`，即使 `assistantMode = AI_ACTIVE`，也允许 care-team patient attachment upload 和 formal message save。
- 如果 `mechanicalChat.enabled !== true`，保留现有 AI_ACTIVE care-team session 返回 409 的行为。
- mechanical mode 下保存包含附件的 formal patient message 时，应在同一事务里标记/刷新 `MEDICAL_RECORDS` completion。
- 如果 signed file upload 成功但 formal message save 失败，不创建 CRM message，也不完成 `MEDICAL_RECORDS`。前端应保留 selected files 或允许用户用可用的 uploaded asset metadata 重试。

### Questionnaire

- 现有 `/intake/:caseId/response` 继续作为 patient-safe questionnaire endpoint。
- CRM v2 当前已有 response 时会更新已有 response。
- China 前端通过 `修改病情表` 打开时，必须允许重新打开并编辑已提交 response。
- questionnaire submit 成功应在同一业务流程里标记 `QUESTIONNAIRE` complete。如果 QC response 保存成功但 mechanical state update 失败，下次 restore/detail 应从已有 QC response 修复 mechanical status，并暴露 `QUESTIONNAIRE.hasCompletedBefore = true`。

### Handoff

新增 patient-safe endpoint：

`POST /api/patient/sessions/:sessionId/handoff`

必需行为：

- 验证 patient 拥有 session/case。
- 只允许 care-team `ADMIN_PATIENT` sessions。
- 原子切换 `assistantMode` 到 `HUMAN_TAKEOVER`。
- 如果本次调用导致状态切换，写入一条 system notice 或 business event。
- 返回更新后的 session/conversation state 和 mechanical state。
- 广播 websocket 更新给 admin 和 patient rooms。
- 如果已经是 `HUMAN_TAKEOVER`，重复调用幂等成功。
- 在同一事务里标记 `ADVISOR_HANDOFF` complete。

如果 handoff 成功但 websocket broadcast 失败，endpoint 仍然返回成功，因为持久化状态是权威。已打开 client 在下次 query invalidation、poll 或 restore 时恢复。

## 聊天区域重建

前端应根据以下信息重建可见 mechanical chat 区域：

- fixed intro copy
- `MechanicalChatState.events`
- 当前 action statuses
- 真实的 formal CRM messages（例如用户上传资料）

规则：

- 如果 `introShown` 为 true，渲染固定 intro message。
- 每个 selected event 后渲染该 turn 的 `preMessage`。
- 渲染对应 action message。匹配的 `COMPLETED` event 必须具有相同 `turnId` 和 `selectedEventId`。
- 如果 selected event 有匹配 completed event，显示 action message completed state，渲染该 turn 的 `postMessage`，并继续 replay。
- 如果 selected event 没有匹配 completed event，显示该 selected action message 的 retry controls，并停止。action selected 但 incomplete 时，compact action bar 隐藏。
- replay 完成所有 completed turns 后，再根据当前 action statuses 在 composer 上方渲染当前 compact action bar。
- 不把装饰性的固定 messages 持久化成 CRM messages。只持久化业务数据/events。

可重复动作配对规则：

- 每次点击 `MEDICAL_RECORDS` 或 `QUESTIONNAIRE` 都创建新的 selected event 和 `turnId`。
- 每次上传 batch 或 questionnaire submit/edit completion 都创建一条 completed event，并绑定到该 selected event。
- 已完成的历史 turns 继续在历史中显示为 completed action messages；compact action bar 仍可包含重复 label（`补充上传材料` 或 `修改病情表`），因为该 action 当前 status 又回到 available。

## 前端渲染说明

mechanical conversation renderer 应靠近 `PatientEntryWindow`，因为它持有 phase、active session、session detail、questionnaire modal 和 material block 渲染。

实现时应拆小 helper，避免把所有条件都塞进一个巨大 component：

- 从 `MechanicalChatState` 推导可用 actions。
- 从 action state 构建 option labels。
- 在 composer 上方渲染 compact action bar。
- 渲染 action messages。
- 在 action selected/completed 时通知 CRM v2。

现有 `PatientChatComposer` 在这个 mechanical flow 下不应调用 `patientChatbotV3Api.sendMessage()`。测试需要明确断言使用菜单流程时不会调用 v3 send API。

## 错误处理

- 如果 mechanical state 加载失败但 patient session 有效，在聊天区显示可恢复 retry state。
- 如果 handoff 失败，保留 `联系顾问`，并显示固定错误消息。
- 如果 upload init 或 message save 失败，保留 `上传医疗资料` 或 `补充上传材料`。
- 如果 questionnaire submit 失败，保留 `填写病情表` 或 `修改病情表`。
- 如果 stale client 尝试执行已完成的一次性 action，CRM v2 应返回当前 state，前端 re-render，不创建重复副作用。
- 如果 action selection 成功但 UI action 失败，该 action 仍停留在 selected history，当前 action message 显示 retry controls。重试 completion 使用新的 completion idempotency key，并绑定 business result。
- selected-but-incomplete action turn 存在时，compact action bar 隐藏。
- 如果业务 completion 成功但 mechanical completion response 丢失，下次 session refresh 必须从底层业务记录推导或返回完成状态：
  - 存在 attachment message -> `MEDICAL_RECORDS.hasCompletedBefore = true`，刷新 `uploadedCount`，当前 status `available`
  - 存在 QC response -> `QUESTIONNAIRE.hasCompletedBefore = true`，当前 status `available`
  - `assistantMode` 是 `HUMAN_TAKEOVER` -> `ADVISOR_HANDOFF.completed`
- 任何从持久化业务记录进行的 repair，都必须同时追加或返回一条 synthetic matching `COMPLETED` event，绑定原始 `selectedEventId` 和 `turnId`，这样时间线重建可以正常继续。前端不做单独 repair bypass，只按 selected/completed event pairs replay。
- 如果 process modal selection 成功但浏览器在确认前关闭，用户可以重试打开同一 action message。只有用户在 modal 内点击确认控件后才记录 completion。

## 测试计划

### China 前端

- basic form 成功后渲染固定 intro，并在 composer 上方渲染第一条 compact action bar。
- 点击任意 action 后，compact action bar 在当前 action 进行中时隐藏。
- 每个被选择的 action 都按顺序渲染 `preMessage`、`actionMessage`、成功后的 `postMessage`。
- 可重复动作再次进入时使用不同的 `preMessage` 和 `postMessage`，但尽量复用同一个 action UI。
- `了解就医流程` 渲染 pre message，并打开/复用 process modal trigger；用户在 modal 中确认后，渲染 post message，并从 compact action bar 中消失。
- `上传医疗资料` 根据首次或再次进入渲染不同 pre copy，并显示/复用资料上传 UI；成功上传 1 个文件后渲染对应 post message，变为 `补充上传材料`，并继续保留。
- `填写病情表` 根据首次或再次进入渲染不同 pre copy，并打开 questionnaire modal；提交后渲染对应 post message，变为 `修改病情表`。
- 重新打开 `修改病情表` 时加载已有答案并允许编辑。
- `联系顾问` 调用 handoff API；成功后从 compact action bar 中消失。
- refresh/session restore 能从 CRM payload 重建已完成/可用 action state。
- refresh/session restore 如果存在 selected-but-incomplete action，应重建可 retry 的 action message，并隐藏 compact action bar。
- mechanical flow 不调用 `patientChatbotV3Api.sendMessage`。

### CRM v2

- patient handoff endpoint 验证 ownership。
- patient handoff endpoint 拒绝非 care-team session。
- patient handoff endpoint 原子切换 `AI_ACTIVE -> HUMAN_TAKEOVER`。
- patient handoff endpoint 在已经 `HUMAN_TAKEOVER` 时幂等。
- patient handoff endpoint 广播或暴露更新后的 state。
- mechanical mode 允许 formal document upload/message 持久化，但不触发 AI。
- questionnaire response submit 更新同一 case 的已有 response。
- patient session bootstrap/restore/detail 包含足够的 mechanical state，用于重建聊天流程。

## 实现决策

- mechanical chat state 持久化在 CRM v2，scope 是 case + care-team session。
- 使用 `mechanicalChat.enabled` 区分 mechanical-mode session 和普通 AI-active session。
- 新增 patient-safe action select/complete endpoints：`/api/patient/sessions/:sessionId/mechanical-chat/actions/*`。
- 使用有序 mechanical events 来在刷新后重建历史 action messages 和 compact action bar 状态。
- formal attachment message 持久化时完成/刷新 `MEDICAL_RECORDS`。
- questionnaire submit 完成 `QUESTIONNAIRE`，或在 restore 时从已保存 QC response 修复状态。
- patient handoff 在同一事务中完成 `ADVISOR_HANDOFF` 和 `HUMAN_TAKEOVER`。
- 装饰性的固定 assistant messages 由前端渲染；业务事件通过 CRM data 和 mechanical events 持久化。
