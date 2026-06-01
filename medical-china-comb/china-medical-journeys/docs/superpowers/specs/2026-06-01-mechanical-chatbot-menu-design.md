# Mechanical Chatbot Menu Design

Date: 2026-06-01

## Context

The China public site currently uses the existing bottom-right `ChatWidget` for guest patient intake. A guest first completes the basic profile form, then the widget moves into the patient messaging flow backed by CRM v2 patient/case/session data.

The desired change is to stop using the AI/v3/v4 free-chat behavior for this guest onboarding flow. The user experience should still feel like a guided chat, but it should be deterministic: fixed assistant messages, compact action-bar buttons, reusable modal/upload blocks, and CRM-backed state. Patient submissions, files, questionnaire responses, and handoff requests must continue to enter CRM v2.

Relevant China frontend areas:

- `src/components/chat/ChatWidget.tsx`
- `src/components/chat/PatientEntryWindow.tsx`
- `src/components/chat/PatientChatComposer.tsx`
- `src/components/chat/PatientQuestionnaireModal.tsx`
- `src/components/chat/PatientMedicalFormModal.tsx`
- `src/services/api/patient-entry.ts`
- `src/services/api/patient-messages.ts`
- `src/services/api/patient-chatbot-v3.ts`

Relevant CRM v2 areas:

- `/Users/haowang/Desktop/claws/medical-crm-v2/apps/api/src/routes/patient-protected.routes.ts`
- `/Users/haowang/Desktop/claws/medical-crm-v2/packages/application/src/use-cases/messages/send-message.use-case.ts`
- `/Users/haowang/Desktop/claws/medical-crm-v2/packages/application/src/use-cases/conversations/resume-conversation-ai.use-case.ts`
- `/Users/haowang/Desktop/claws/medical-crm-v2/packages/application/src/use-cases/question-collector/submit-response.use-case.ts`

## Goal

Keep the existing bottom-right chat widget and basic form, but replace AI free-chat turns with a mechanical menu conversation:

1. Patient opens the existing chat widget.
2. Patient completes the existing basic form.
3. CRM v2 creates/restores the patient, case, and session as it does today.
4. The chat timeline shows a fixed assistant confirmation message.
5. A short compact action bar appears above the chat composer, not as a chat message. The first action bar shows four fixed options:
   - `了解就医流程`
   - `上传医疗资料`
   - `联系顾问`
   - `填写病情表`
6. Selecting an action immediately hides the compact action bar, then starts an action turn made of a pre message, an action message, and a post message.
7. When the action completes, the action message becomes completed/disabled and the post message is appended.
8. The compact action bar refreshes with the remaining or repeatable actions.

The flow should loop until the patient has done the main actions. Repeatable actions remain available with updated labels.

## Non-Goals

- Do not create a separate new chat widget.
- Do not route patient free-text through AI/v3/v4 for this guest menu flow.
- Do not invent new medical guidance or diagnosis copy.
- Do not persist every decorative fixed assistant message as a normal CRM user/admin message unless it carries business meaning.
- Do not force a strict step order.

## Assistant Copy

After the basic form succeeds, show this fixed assistant message:

> 您好，我是 Medora 医疗旅程助手。我们已经收到您的基本信息。接下来您可以先了解赴华就医流程、上传已有医疗资料、填写病情表，或请顾问接手联系您。您提交的内容会进入 Medora CRM，由人工团队跟进查看。

The tone should remain restrained and service-oriented. It should not imply that the bot is diagnosing, triaging, or generating medical advice.

## Menu Action Behavior

### Shared Interaction Model

The menu is rendered as a short compact action bar immediately above the chat composer. It is not rendered as a chat message and should not appear inside the scrollback history.

When a patient clicks one action:

- The compact action bar hides immediately.
- A pre message is appended to explain what will happen next.
- An action message is appended.
- Once the action completes, the action message shows a completed state and can no longer perform the same one-time action.
- A post message is appended to confirm receipt/completion and set expectations.
- The compact action bar refreshes with the available next actions.

Actions are not ordered. The patient may choose any available action from the compact bar.

### Action Turn Message Model

Every selected action turn has three message slots:

1. `preMessage`: explanatory copy shown immediately after the user chooses the action.
2. `actionMessage`: the actual reusable UI block, such as the process/service-rules confirmation box, upload box, handoff action, or questionnaire modal trigger.
3. `postMessage`: receipt/confirmation copy shown only after the action completes successfully.

Repeatable actions may re-enter the same action later. The `actionMessage` can reuse the same component, but `preMessage` and `postMessage` must be selected from copy variants based on whether this is the first turn or a re-entry turn.

Examples:

- First `MEDICAL_RECORDS` turn can say “please upload your medical materials”; later turns can say “you can supplement additional materials.”
- First `QUESTIONNAIRE` turn can say “please complete the medical questionnaire”; later turns can say “you can update your medical questionnaire.”
- One-time actions only need first-turn copy.

Shared prerequisite:

- `MEDICAL_RECORDS`, `ADVISOR_HANDOFF`, and `QUESTIONNAIRE` all require the patient to confirm the service rules first.
- This prerequisite reuses the same process/service-rules message box used by `PROCESS_GUIDE`.
- If the patient selects one of these three actions before confirming the service rules, first show that action's own prerequisite pre message explaining: "please agree to the China medical travel process and service rules first, then we can continue this selected action."
- The action message after that prerequisite pre message should show the process/service-rules confirmation box.
- After the patient confirms inside that box, the selected action continues in the same turn; the compact action bar stays hidden until that selected action is completed or failed.
- If the patient closes the process/service-rules modal without confirming, the selected action does not complete. Append a not-confirmed post message explaining that this action cannot continue yet; then show the compact action bar again and allow the patient to retry.
- Confirming service rules through this prerequisite also completes `PROCESS_GUIDE`, so `了解就医流程` should disappear from the compact action bar afterward.

### 了解就医流程

Pre message:

`好的，我为您打开赴华就医流程说明。`

Action message:

- Reuse the existing process modal trigger/block.
- Completion is recorded only when the patient clicks the confirmation control inside the modal.
- Opening the modal alone does not count as completion.
- If the patient closes the modal without confirming, this action does not complete and the action message shows a not-confirmed/retryable state.
- Once completed, this option is hidden from the compact action bar.

Confirmed post message:

`您已确认赴华就医流程和服务规则。您可以继续上传医疗资料、填写病情表，或联系顾问。`

Not-confirmed/closed-modal post message:

`您还没有确认赴华就医流程和服务规则。您可以稍后再次打开确认；确认后才能继续上传医疗资料、填写病情表或联系顾问。`

### 上传医疗资料

Pre message:

If service rules are not confirmed:

`请您先同意赴华就医流程和服务规则，然后我们才能继续引导您上传医疗资料。`

After service rules are confirmed:

`您可以在以下的 message box 中上传您的医疗资料。我们的团队会在 24 小时之内审核您的资料，并给出最合适的医疗旅游建议和医院推荐。`

Re-entry pre message:

`您可以继续在以下的 message box 中补充上传医疗资料。我们的团队会把新资料一起纳入审核，会在 24 小时之内审核您的资料，并给出最合适的医疗旅游建议和医院推荐。`

Action message:

- Reuse the existing material collection/upload experience where possible.
- The existing `MaterialCollectionBlock` already contains service-rule confirmation, material guidance, and copy that states text/files enter CRM v2.
- If the patient has not accepted the service rules, show the existing process/service-rules message box first.
- After the patient confirms the service rules, show the medical-record upload message box directly in the same selected action turn.
- Completion requires at least one uploaded attachment.
- After the first successful upload, the compact action bar should keep this action available but relabel it to `补充上传材料`.
- Additional uploads remain allowed and continue to enter CRM v2.

Post message:

`我们已收到您上传的医疗资料。Medora 医疗团队会在 24 小时内审核，并给出医疗旅游建议和医院推荐。`

Re-entry post message:

`我们已收到您补充上传的医疗资料，并会和此前资料一起审核，会在 24 小时之内审核您的资料，并给出最合适的医疗旅游建议。`

### 联系顾问

Pre message:

If service rules are not confirmed:

`请您先同意赴华就医流程和服务规则，然后我们才能继续为您转接专业医疗团队。`

After service rules are confirmed:

`已为您把整个 case 转交给我们专业的医疗团队，Medora 医疗团队会在 24 小时内跟进并给出医疗建议，请注意查收您的邮箱。`

Action behavior:

- Requires service-rule confirmation first, using the same prerequisite flow as `MEDICAL_RECORDS`.
- Call a CRM v2 patient handoff endpoint.
- CRM v2 must atomically switch the care-team `ADMIN_PATIENT` session/conversation to `assistantMode = HUMAN_TAKEOVER`.
- The endpoint must be idempotent. If the session is already in human takeover, it returns success without duplicating system notices.
- Once completed, this option is hidden from the compact action bar.

Post message:

`您的 case 已转交给 Medora 医疗团队。请注意查收邮箱，我们会在 24 小时内跟进。`

### 填写病情表

Pre message:

If service rules are not confirmed:

`请您先同意赴华就医流程和服务规则，然后我们才能继续引导您填写病情表。`

After service rules are confirmed:

`好的，请填写病情表，顾问和医生会根据这些信息评估您的情况。`

Re-entry pre message:

`您可以修改已填写的病情表。保存后，Medora 医疗团队会以最新内容为准继续评估。`

Action message:

- Requires service-rule confirmation first, using the same prerequisite flow as `MEDICAL_RECORDS`.
- Append a fixed introduction message with the existing `QUESTIONNAIRE_MODAL_TRIGGER`.
- Clicking it opens the existing `PatientQuestionnaireModal`, which wraps `PatientMedicalFormModal`.
- Submission completes the action.
- After submission, the compact action bar should keep this action available but relabel it to `修改病情表`.
- `修改病情表` opens the same modal, loads existing answers, and allows editing.
- Saving should update/overwrite the existing CRM v2 questionnaire response for the case.

Post message:

`我们已收到您的病情表。Medora 医疗团队会结合您的资料继续评估。`

Re-entry post message:

`您的病情表已更新。Medora 医疗团队会以最新内容继续评估。`

CRM v2 already updates an existing QC response if one exists in `SubmitResponseUseCase`. The China frontend currently sets submitted responses to read-only in `PatientMedicalFormModal`; implementation must change that behavior for this mechanical chat flow.

## State Model Decisions

CRM v2 should be the source of truth for mechanical chat state. The China frontend should render from this state and send action-completion events; it should not rely only on local component state.

The state should be scoped to the CRM case and the care-team patient session. It should be stored in CRM v2, not in China local storage, because refresh/session restore must preserve completed action messages, selected in-progress turns, and compact action bar availability.

Mechanical mode is an explicit CRM flag:

- `mechanicalChat.enabled = true`
- It is set for China guest widget onboarding sessions created through `/onboarding/init`.
- It is not a third `assistantMode`; `assistantMode` remains `AI_ACTIVE | HUMAN_TAKEOVER`.
- In mechanical mode, the China widget must not call chatbot v3/v4 free-chat routes.
- In mechanical mode, CRM v2 can allow formal patient document uploads even if the care-team session is still `AI_ACTIVE`, because the mechanical flow is replacing AI responses for this public widget.

Required shape:

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

Repeatable action status contract:

- `PROCESS_GUIDE` and `ADVISOR_HANDOFF` are one-time actions. After completion their status is `completed` and they are no longer selectable.
- `MEDICAL_RECORDS` and `QUESTIONNAIRE` are repeatable actions. After each completed turn their current status returns to `available`; prior completion is represented by `hasCompletedBefore`, `completedAt`, `uploadedCount`, and completed events.
- While a repeatable action has been selected and its current turn is not complete, its status is `selected`.
- Labels derive from repeatable history:
  - `MEDICAL_RECORDS.hasCompletedBefore = false` -> `上传医疗资料`
  - `MEDICAL_RECORDS.hasCompletedBefore = true` -> `补充上传材料`
  - `QUESTIONNAIRE.hasCompletedBefore = false` -> `填写病情表`
  - `QUESTIONNAIRE.hasCompletedBefore = true` -> `修改病情表`

`events` is what lets the frontend reconstruct historical selected action messages after refresh. The current action statuses decide the compact action bar availability, while the ordered event list decides which action turns were selected and completed.

The state must be exposed in patient session bootstrap, restore, `/me`, and session detail responses used by the China site:

```ts
type PatientSessionProfile = {
  // existing fields
  mechanicalChatState?: MechanicalChatState;
};

type PatientSessionDetail = {
  // existing fields
  mechanicalChatState?: MechanicalChatState;
};
```

Initialization rule:

- `/onboarding/init` initializes `mechanicalChat.enabled = true`, `introShown = true`, empty `events`, and all four actions as `available` for China guest widget sessions.
- If an older mechanical session is restored without `introShown`, the frontend should treat `mechanicalChat.enabled = true` as sufficient to render the intro and first compact action bar. This is a compatibility fallback, not the primary state contract.
- The intro is not a user-dismissable item. It remains part of the reconstructed timeline whenever mechanical mode is enabled.

## Mechanical State API

CRM v2 should expose patient-safe action endpoints. These endpoints are the only way the China frontend changes mechanical state directly.

### Select Action

`POST /api/patient/sessions/:sessionId/mechanical-chat/actions/select`

Request:

```ts
{
  actionKey: MechanicalChatActionKey;
  idempotencyKey: string;
}
```

Behavior:

- Verifies the patient owns the session.
- Verifies `mechanicalChat.enabled = true`.
- Rejects new selections while any previous selected event has no matching completed event. The response should include current `MechanicalChatState` so the frontend can re-render the in-progress action.
- Rejects unavailable one-time actions unless they are already selected/completed by the same idempotency key.
- Appends a `SELECTED` event.
- Generates a new `turnId` for this selected action. The selected event `id` and `turnId` are returned to the frontend.
- Returns updated `MechanicalChatState`.
- Does not perform business side effects such as opening modals, uploading files, submitting questionnaires, or handoff.

### Complete Action

`POST /api/patient/sessions/:sessionId/mechanical-chat/actions/complete`

Request:

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

Behavior:

- Verifies ownership and mechanical mode.
- Verifies `selectedEventId` and `turnId` refer to the currently selected incomplete action.
- Appends a `COMPLETED` event if the action is not already completed for the same business result.
- The completed event stores `selectedEventId` and the same `turnId` as the selected event.
- Marks one-time actions complete.
- For `MEDICAL_RECORDS`, increments/refreshes uploaded count, sets `hasCompletedBefore = true`, updates `completedAt`, and returns current status to `available` with the repeat label `补充上传材料`.
- For `QUESTIONNAIRE`, sets `hasCompletedBefore = true`, updates `completedAt`, and returns current status to `available` with the repeat label `修改病情表`.
- Returns updated `MechanicalChatState`.

`result.uploadedCount` is the refreshed total uploaded attachment count for the session/case, not a batch increment. If omitted for `MEDICAL_RECORDS`, CRM v2 should derive the refreshed total from persisted formal message attachments.

Business endpoints may call this completion logic internally so that business writes and state updates happen in the same transaction where needed.

## Data Flow

### Basic Form

- China continues to call `/onboarding/init`.
- CRM v2 creates/restores patient, case, and widget/formal sessions.
- The frontend then renders the mechanical intro and first compact action bar above the composer.

### Mechanical Messages

Mechanical fixed messages, action messages, and compact action bar state can be generated by the frontend from `MechanicalChatState`.

They do not need to be stored as ordinary CRM conversation messages unless they represent a business event that CRM staff should see.

Business events that should be stored or otherwise visible in CRM:

- Patient uploaded documents.
- Patient submitted/updated the questionnaire.
- Patient requested advisor handoff.

### Uploads

The upload path should use formal CRM session upload/message APIs so the files enter CRM v2:

- `POST /api/patient/sessions/:sessionId/attachments/upload`
- upload to the returned signed URL or proxy fallback
- `POST /api/patient/sessions/:sessionId/messages` with the attachment metadata

Current CRM v2 behavior blocks patient care-team formal messages/uploads when `assistantMode = AI_ACTIVE`. For mechanical mode, document upload must be allowed without requiring the patient to request handoff first, and it must not trigger an AI response.

Backend distinction:

- If `mechanicalChat.enabled = true` for the session, care-team patient attachment upload and formal message save are allowed while `assistantMode = AI_ACTIVE`.
- If `mechanicalChat.enabled !== true`, the current 409 behavior remains unchanged for `AI_ACTIVE` care-team sessions.
- Saving a formal patient message with one or more attachments in mechanical mode should mark/refresh `MEDICAL_RECORDS` completion in the same transaction as the message save.
- If the signed file upload succeeds but the formal message save fails, no CRM message is created and `MEDICAL_RECORDS` is not completed. The frontend should keep the selected files or let the patient retry with the same uploaded asset metadata if available.

### Questionnaire

- Existing `/intake/:caseId/response` remains the patient-safe questionnaire endpoint.
- CRM v2 already updates an existing response when one exists.
- China frontend must allow reopening and editing an already submitted response when launched through `修改病情表`.
- Successful questionnaire submit should mark `QUESTIONNAIRE` complete in the same business flow. If the QC response saves but mechanical state update fails, the next restore/detail response should repair the mechanical status from the existing QC response and expose `QUESTIONNAIRE.hasCompletedBefore = true`.

### Handoff

Add this patient-safe endpoint:

`POST /api/patient/sessions/:sessionId/handoff`

Required behavior:

- Verify the patient owns the session/case.
- Only allow care-team `ADMIN_PATIENT` sessions.
- Atomically switch `assistantMode` to `HUMAN_TAKEOVER`.
- Write one system notice or business event if this call caused the transition.
- Return the updated session/conversation state and mechanical state.
- Broadcast websocket updates to admin and patient rooms.
- Be idempotent if already `HUMAN_TAKEOVER`.
- Mark `ADVISOR_HANDOFF` complete in the same transaction as the assistant-mode transition.

If handoff succeeds but websocket broadcast fails, the endpoint still returns success because the persisted state is authoritative. Open clients recover on the next query invalidation/poll/restore.

## Timeline Reconstruction

The frontend should reconstruct the visible mechanical chat area from:

- fixed intro copy
- `MechanicalChatState.events`
- current action statuses
- existing formal CRM messages for real patient uploads/messages

Rules:

- If `introShown` is true, render the fixed intro message.
- Render the selected turn's `preMessage` after each selected event.
- Render the corresponding action message. A matching `COMPLETED` event is one with the same `turnId` and `selectedEventId`.
- If a selected event has a matching completed event, show the action message completed state, render the selected turn's `postMessage`, and continue replaying.
- If a selected event has no matching completed event, show the selected action message with retry controls and stop. Hide the compact action bar while an action is selected-but-incomplete.
- After replaying all completed turns, render the current compact action bar above the composer from current action statuses.
- Do not persist decorative fixed messages as CRM messages. Persist only business data/events.

Repeatable action pairing:

- Each click on `MEDICAL_RECORDS` or `QUESTIONNAIRE` creates a new selected event and `turnId`.
- Each upload batch or questionnaire submit/edit completion creates one completed event tied to that selected event.
- Prior completed turns remain in history as completed action messages; the compact action bar may still include the repeat label (`补充上传材料` or `修改病情表`) because the action status remains available for future turns.

## Frontend Rendering Notes

The mechanical conversation renderer should live close to `PatientEntryWindow`, because it owns the current phase, active session, session detail, questionnaire modal, and material block rendering.

Implementation should prefer small helpers rather than a large inline conditional block:

- derive available actions from `MechanicalChatState`
- build option labels from action state
- render the compact action bar above the composer
- render action messages
- notify CRM v2 when an action is selected/completed

The existing `PatientChatComposer` should not call `patientChatbotV3Api.sendMessage()` for this mechanical flow. Tests should explicitly assert that the v3 send API is not invoked when using the menu flow.

## Error Handling

- If mechanical state fails to load but the patient session is valid, show a recoverable retry state in the chat body.
- If handoff fails, keep `联系顾问` available and show a fixed error message.
- If upload init or message save fails, keep `上传医疗资料` or `补充上传材料` available.
- If questionnaire submit fails, keep `填写病情表` or `修改病情表` available.
- If a stale client tries a now-completed one-time action, CRM v2 should return the current state and the frontend should re-render, not create duplicate effects.
- If action selection succeeds but the UI action fails, the action remains selected in history and the current action message shows retry controls. Retrying completion uses a new completion idempotency key tied to the business result.
- The compact action bar should be hidden while there is a selected-but-incomplete action turn.
- If business completion succeeds but the mechanical completion response is lost, the next session refresh must infer or return completed state from the underlying business record where possible:
  - attachment message exists -> `MEDICAL_RECORDS.hasCompletedBefore = true`, refreshed `uploadedCount`, current status `available`
  - QC response exists -> `QUESTIONNAIRE.hasCompletedBefore = true`, current status `available`
  - assistantMode is `HUMAN_TAKEOVER` -> `ADVISOR_HANDOFF.completed`
- Any repair from persisted business records must also append or return a synthetic matching `COMPLETED` event for the original selected turn. The synthetic event must use the original `selectedEventId` and `turnId` so timeline reconstruction can continue normally. The frontend should not implement a separate repair bypass; it should always replay selected/completed event pairs.
- If process modal selection succeeds and the browser closes before confirmation, the user can retry opening the same action message. Completion is recorded only when the patient clicks the confirmation control inside the modal.

## Test Plan

### China Frontend

- Basic form success renders the fixed intro and first compact action bar above the composer.
- Clicking any action hides the compact action bar while the action is in progress.
- Each selected action renders `preMessage`, `actionMessage`, and successful `postMessage` in that order.
- Repeatable actions use different `preMessage` and `postMessage` copy on re-entry while reusing the same action UI where possible.
- `了解就医流程` renders its pre message and opens/reuses the process modal trigger; after the patient confirms inside the modal, it renders its post message and disappears from the compact action bar.
- `上传医疗资料` renders first-entry or re-entry pre copy and shows/reuses material upload UI; after one successful upload it renders the matching post message, becomes `补充上传材料`, and remains available.
- `填写病情表` renders first-entry or re-entry pre copy and opens the questionnaire modal; after submit it renders the matching post message and becomes `修改病情表`.
- Reopening `修改病情表` loads existing answers and allows editing.
- `联系顾问` calls the handoff API; after success it disappears from the compact action bar.
- Refresh/session restore reconstructs completed/available action state from CRM payload.
- Refresh/session restore with a selected-but-incomplete action reconstructs the retryable action message and hides the compact action bar.
- Mechanical flow does not call `patientChatbotV3Api.sendMessage`.

### CRM v2

- Patient handoff endpoint verifies ownership.
- Patient handoff endpoint rejects non-care-team sessions.
- Patient handoff endpoint switches `AI_ACTIVE -> HUMAN_TAKEOVER` atomically.
- Patient handoff endpoint is idempotent when already `HUMAN_TAKEOVER`.
- Patient handoff endpoint broadcasts or exposes updated state.
- Mechanical mode allows formal document upload/message persistence while avoiding AI generation.
- Questionnaire response submit updates an existing response for the case.
- Patient session bootstrap/restore/detail includes enough mechanical state to reconstruct the chat flow.

## Implementation Decisions

- Persist mechanical chat state in CRM v2, scoped by case and care-team session.
- Use `mechanicalChat.enabled` to distinguish mechanical-mode sessions from normal AI-active sessions.
- Add explicit patient-safe action select/complete endpoints under `/api/patient/sessions/:sessionId/mechanical-chat/actions/*`.
- Use ordered mechanical events to reconstruct historical action messages and compact action bar state after refresh.
- Let formal attachment message persistence mark `MEDICAL_RECORDS` complete in mechanical mode.
- Let questionnaire submit mark `QUESTIONNAIRE` complete or repair from the saved QC response on restore.
- Let patient handoff mark `ADVISOR_HANDOFF` complete in the same transaction as `HUMAN_TAKEOVER`.
- Decorative fixed assistant messages are frontend-rendered; business events are persisted through CRM data and mechanical events.
