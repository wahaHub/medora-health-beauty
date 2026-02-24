# Cases 页面数据库分析报告

## 概述

本报告分析两个 Cases 相关页面的数据库查询情况：
1. **列表页**: `http://localhost:3002/hospital/cases`
2. **详情页**: `http://localhost:3002/hospital/cases/660e8400-e29b-41d4-a716-446655440002`

---

## 附录 A: 数据库表结构

### A.1 cases 表
```sql
CREATE TABLE cases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number          VARCHAR(50) UNIQUE NOT NULL,
  patient_id           UUID NOT NULL REFERENCES users(id),
  assigned_hospital_id UUID REFERENCES hospitals(id),
  patient_name         VARCHAR(100) NOT NULL,
  patient_country      VARCHAR(100),
  patient_language     VARCHAR(10) DEFAULT 'en',
  primary_diagnosis    TEXT,
  diagnosis_code       VARCHAR(50),
  symptoms             JSONB,
  medical_history      TEXT,
  ai_summary_zh        TEXT,
  ai_summary_en        TEXT,
  risk_level           VARCHAR(20),  -- 'LOW' | 'MEDIUM' | 'HIGH'
  status               VARCHAR(20) DEFAULT 'ACTIVE',  -- 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
  stage                VARCHAR(50) DEFAULT 'PENDING_ASSIGNMENT',  -- 枚举：见下方
  assigned_at          TIMESTAMP(6),
  created_at           TIMESTAMP(6) DEFAULT NOW(),
  updated_at           TIMESTAMP(6) DEFAULT NOW()
);

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_patient_id ON cases(patient_id);
CREATE INDEX idx_cases_assigned_hospital_id ON cases(assigned_hospital_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_stage ON cases(stage);
```

**CaseStage 枚举值：**
- `PENDING_ASSIGNMENT` - 待分配
- `TRANSFERRED_TO_HOSPITAL` - 已转交医院
- `HOSPITAL_CONTACTED` - 医院已联系
- `CONSULTATION_SCHEDULED` - 问诊已安排
- `IN_TREATMENT` - 治疗中
- `TREATMENT_COMPLETED` - 治疗已完成

---

### A.2 users 表
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(20) DEFAULT 'PATIENT',  -- 'ADMIN' | 'HOSPITAL' | 'PATIENT'
  hospital_id   UUID REFERENCES hospitals(id),
  avatar_url    VARCHAR(500),
  status        VARCHAR(20) DEFAULT 'active',
  patient_code  VARCHAR(20) UNIQUE,  -- 患者编号，如 CN-L01
  country       VARCHAR(100),
  last_login_at TIMESTAMP(6),
  created_at    TIMESTAMP(6) DEFAULT NOW(),
  updated_at    TIMESTAMP(6) DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_hospital_id ON users(hospital_id);
```

---

### A.3 documents 表
```sql
CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES users(id),
  file_name      VARCHAR(255) NOT NULL,
  file_size      INTEGER NOT NULL,
  mime_type      VARCHAR(100) NOT NULL,
  storage_key    VARCHAR(500) UNIQUE NOT NULL,  -- Supabase Storage 路径
  sha256         VARCHAR(64),
  document_type  VARCHAR(50) NOT NULL,  -- 'LAB' | 'IMAGING' | 'DIAGNOSIS' | 'INVITATION' | 'OTHER' 等
  sensitivity    VARCHAR(20) DEFAULT 'PHI_HIGH',
  language       VARCHAR(10) DEFAULT 'en',
  is_translated  BOOLEAN DEFAULT false,
  source_doc_id  UUID REFERENCES documents(id),  -- 翻译文档的原文档 ID
  version        INTEGER DEFAULT 1,
  status         VARCHAR(20) DEFAULT 'ACTIVE',  -- 'PENDING' | 'ACTIVE' | 'DELETED'
  created_at     TIMESTAMP(6) DEFAULT NOW(),
  updated_at     TIMESTAMP(6) DEFAULT NOW()
);

CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_uploaded_by_id ON documents(uploaded_by_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);
```

---

### A.4 conversations 表
```sql
CREATE TABLE conversations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id              UUID REFERENCES cases(id),
  category             VARCHAR(50) NOT NULL,  -- 'ADMIN_HOSPITAL' | 'HOSPITAL_PATIENT' 等
  title                VARCHAR(200),
  hospital_id          UUID,
  created_at           TIMESTAMP(6) DEFAULT NOW(),
  updated_at           TIMESTAMP(6) DEFAULT NOW(),
  last_message_id      UUID REFERENCES messages(id),
  last_message_at      TIMESTAMPTZ(6),
  last_message_preview TEXT,
  last_sender_id       UUID REFERENCES users(id)
);

CREATE INDEX idx_conversations_case_id ON conversations(case_id);
CREATE INDEX idx_conversations_category ON conversations(category);
CREATE INDEX idx_conversations_hospital_category_time ON conversations(hospital_id, category, last_message_at DESC);
```

**ConversationCategory 枚举值：**
- `ADMIN_HOSPITAL` - 管理员与医院的对话
- `HOSPITAL_PATIENT` - 医院与患者的对话
- `ADMIN_PATIENT` - 管理员与患者的对话

---

### A.5 messages 表
```sql
CREATE TABLE messages (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id    UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id          UUID NOT NULL REFERENCES users(id),
  content            TEXT NOT NULL,
  original_language  VARCHAR(10) DEFAULT 'en',
  translated_content TEXT,
  message_type       VARCHAR(20) DEFAULT 'TEXT',  -- 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  moderation_status  VARCHAR(20) DEFAULT 'ALLOWED',  -- 'ALLOWED' | 'BLOCKED' | 'REVIEW'
  attachments        JSONB,  -- [{ url, name, type }]
  created_at         TIMESTAMP(6) DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at DESC);
```

---

### A.6 case_progress 表
```sql
CREATE TABLE case_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title          VARCHAR(200) NOT NULL,
  description    TEXT,
  progress_type  VARCHAR(50) NOT NULL,  -- 'STATUS_CHANGE' | 'VIDEO_CONSULTATION' | 'APPOINTMENT' 等
  video_summary  JSONB,  -- 存储额外信息，如诊断附件的 documentKey, documentName 等
  recorded_at    TIMESTAMP(6) DEFAULT NOW(),
  recorded_by_id UUID
);

CREATE INDEX idx_case_progress_case_id ON case_progress(case_id);
CREATE INDEX idx_case_progress_type ON case_progress(progress_type);
```

**ProgressType 枚举值：**
- `STATUS_CHANGE` - 状态变更（用于存储诊断记录）
- `DOCUMENT_UPLOAD` - 文档上传
- `VIDEO_CONSULTATION` - 视频问诊
- `MESSAGE` - 消息记录
- `APPOINTMENT` - 电话跟进

**video_summary JSONB 字段示例（诊断记录）：**
```json
{
  "type": "preliminary",
  "icdCode": "C50.9",
  "severity": "moderate",
  "treatmentRecommendation": "手术 + 化疗",
  "suggestedTests": "活检、CT扫描",
  "costEstimate": "¥150,000 - ¥200,000",
  "treatmentDuration": "6-8个月",
  "documentKey": "cases/xxx/diagnosis/123_report.pdf",
  "documentName": "病理报告.pdf",
  "documentId": "uuid-of-document-record"
}
```

---

## 1. 列表页面 - `/hospital/cases`

### 1.1 页面文件
- **前端**: [medical-crm/app/hospital/cases/page.tsx](medical-crm/app/hospital/cases/page.tsx)
- **API**: [medical-crm/app/api/hospital/cases/route.ts](medical-crm/app/api/hospital/cases/route.ts)
- **Hook**: `useCases()` - [medical-crm/lib/api/hospital/hooks.ts:83-117](medical-crm/lib/api/hospital/hooks.ts#L83-L117)

### 1.2 使用的数据库表

| 表名 | 用途 | 查询方式 | 数据量 |
|-----|------|---------|--------|
| `cases` | 主查询 - 获取案例列表 | `findMany` with `include` | 20条/页 (可配置) |
| `users` (作为 patient) | 关联查询 - 患者信息 | Prisma include | N 条 (N = cases 数量) |
| `documents` | 关联查询 - 文档数量统计 | Prisma include with filter | 每个 case 的文档数 |

### 1.3 API 查询流程

#### Prisma 代码
```typescript
// GET /api/hospital/cases?page=1&limit=20

// 第 1 步：COUNT 查询
const total = await prisma.case.count({ where })

// 第 2 步：主查询
const cases = await prisma.case.findMany({
  where,
  include: {
    patient: true,
    documents: {
      where: { status: 'ACTIVE' },
      select: { id: true },
    },
  },
  orderBy: { updatedAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
})
```

#### 实际执行的 SQL 查询

**Query 1: COUNT 查询 - 获取总数**
```sql
SELECT COUNT(*)
FROM cases
WHERE 1=1
  -- AND assigned_hospital_id = $1  (如果有 hospitalId 过滤)
  -- AND stage = $2  (如果有 status 过滤)
  -- AND (patient_name ILIKE $3 OR case_number ILIKE $3)  (如果有 search)
```

**Query 2: 主查询 - 案例列表**
```sql
SELECT
  cases.id,
  cases.case_number,
  cases.patient_id,
  cases.patient_name,
  cases.patient_country,
  cases.patient_language,
  cases.primary_diagnosis,
  cases.diagnosis_code,
  cases.stage,
  cases.status,
  cases.assigned_at,
  cases.created_at,
  cases.updated_at
FROM cases
WHERE 1=1
  -- 相同的过滤条件
ORDER BY cases.updated_at DESC
LIMIT 20 OFFSET 0
```

**Query 3: 关联查询 - 患者信息 (Prisma N+1)**
```sql
-- Prisma 会将 include 拆分成独立查询
SELECT
  users.id,
  users.email,
  users.name,
  users.role,
  users.patient_code,
  users.country,
  users.avatar_url,
  users.status,
  users.created_at,
  users.updated_at
FROM users
WHERE users.id IN ($1, $2, $3, ..., $20)  -- 20 个 patient_id
```

**Query 4: 关联查询 - 文档列表 (Prisma N+1)**
```sql
SELECT documents.id
FROM documents
WHERE documents.case_id IN ($1, $2, $3, ..., $20)  -- 20 个 case_id
  AND documents.status = 'ACTIVE'
```

**总查询次数**: **4 次**

**查询特征**:
- Prisma 的 `include` 不使用 JOIN，而是拆分成多个 SELECT 查询
- 使用 `WHERE id IN (...)` 批量获取关联数据（避免了传统的 N+1，变成了 1+N）
- documents 只查询 id 字段（`select: { id: true }`），减少数据传输量

### 1.4 存在的问题

#### ✅ 问题 1: 已优化 - 移除了不必要的 conversations.messages include
**位置**: [route.ts:72-81](medical-crm/app/api/hospital/cases/route.ts#L72-L81)

**原问题**:
之前代码加载了所有对话的消息用于计算"未读消息数"，但计算逻辑是错误的（只是数 messages.length）

**已修复**:
```typescript
// 已移除不必要的 conversations.messages include
const cases = await prisma.case.findMany({
  where,
  include: {
    patient: true,
    documents: {
      where: { status: 'ACTIVE' },
      select: { id: true },
    },
    // ✅ 不再 include conversations.messages
  },
})
```

**优化效果**: 减少了 2-3 次数据库查询

#### ⚠️ 问题 2: 搜索没有防抖
**位置**: [page.tsx:227](medical-crm/app/hospital/cases/page.tsx#L227)

**问题**:
用户输入搜索时，每输入一个字符都会触发组件重新渲染和过滤，虽然是客户端过滤（不触发 API），但没有防抖

**建议优化**:
```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const [searchQuery, setSearchQuery] = useState("")
const debouncedSearch = useDebouncedValue(searchQuery, 300)

// 使用 debouncedSearch 进行过滤
const filteredCases = cases.filter(c => {
  if (debouncedSearch) {
    const query = debouncedSearch.toLowerCase()
    // ... 过滤逻辑
  }
})
```

#### ⚠️ 问题 3: 没有缓存机制
**位置**: [hooks.ts:83-117](medical-crm/lib/api/hospital/hooks.ts#L83-L117)

**问题**:
- 每次组件挂载都会重新请求数据
- 切换页面后返回会重新加载
- 没有使用 SWR 或 React Query

**建议优化**:
```typescript
// 使用 SWR
import useSWR from 'swr'

export function useCases(params?: UseCasesParams) {
  const { data, error, isLoading, mutate } = useSWR(
    ['cases', params],
    () => hospitalApi.GET('/cases', { params: { query: params } }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )
  return { data: data?.data, isLoading, error, refetch: mutate }
}
```

#### ⚠️ 问题 4: 统计数据在客户端计算
**位置**: [page.tsx:176-179](medical-crm/app/hospital/cases/page.tsx#L176-L179)

**问题**:
所有统计数据（新转交、进行中、已完成）都在客户端通过 filter 计算

**当前做法**:
```typescript
const newCases = cases.filter(c => c.status === "transferred_to_hospital").length
const inProgressCases = cases.filter(c => [...].includes(c.status)).length
```

**影响**:
- 需要加载所有案例数据到客户端
- 如果案例数量很多，性能会下降

**优化方向**:
- 在 API 中返回统计数据
- 或者添加专门的统计 API endpoint

---

## 2. 详情页面 - `/hospital/cases/{caseId}`

### 2.1 页面文件
- **前端**: [medical-crm/app/hospital/cases/[id]/page.tsx](medical-crm/app/hospital/cases/[id]/page.tsx)
- **API 路由**:
  1. 详情 API: [medical-crm/app/api/hospital/cases/[caseId]/route.ts](medical-crm/app/api/hospital/cases/[caseId]/route.ts)
  2. 消息 API: [medical-crm/app/api/hospital/cases/[caseId]/messages/route.ts](medical-crm/app/api/hospital/cases/[caseId]/messages/route.ts)
  3. 文档 API: [medical-crm/app/api/hospital/cases/[caseId]/documents/route.ts](medical-crm/app/api/hospital/cases/[caseId]/documents/route.ts)
- **Hooks**:
  1. `useCaseDetail(caseId)` - [hooks.ts:120-147](medical-crm/lib/api/hospital/hooks.ts#L120-L147)
  2. `useCaseMessages(caseId)` - [hooks.ts:180-200](medical-crm/lib/api/hospital/hooks.ts#L180-L200)
  3. `useCaseDocuments(caseId)` - [hooks.ts:150-177](medical-crm/lib/api/hospital/hooks.ts#L150-L177)

### 2.2 使用的数据库表汇总

| 表名 | 被哪些 API 查询 | 查询次数 | 用途 |
|-----|---------------|---------|------|
| `cases` | Detail API | 1次 | 主查询案例详情 |
| `users` (patient) | Detail API, Messages API | 2-3次 | 患者信息、消息发送者 |
| `documents` | Detail API, Documents API | 2次 | 案例文档、诊断附件 |
| `conversations` | Detail API, Messages API, Documents API | 3次 | 对话信息 |
| `messages` | Detail API, Messages API, Documents API | 3次 | 消息列表、消息附件 |
| `case_progress` | Detail API, Documents API | 2次 | 进度记录、诊断附件 fallback |

**估计总查询次数**: 约 **15-20 次**（3个并行 API 请求）

---

### 2.3 API 1: GET /cases/{caseId} - 案例详情

#### 查询的表
1. ✅ `cases` - 主查询
2. ✅ `users` (patient) - 患者信息
3. ⚠️ `documents` - 文档列表 (与 Documents API 重复)
4. ⚠️ `conversations` - 对话列表 (与 Messages API 重复)
5. ⚠️ `messages` - 所有消息 (与 Messages API 重复)
6. ✅ `case_progress` - 进度记录

#### 查询流程

**Prisma 代码**:
```typescript
// GET /api/hospital/cases/{caseId}

const caseData = await prisma.case.findUnique({
  where: { id: caseId },
  include: {
    patient: true,
    documents: {
      where: { status: 'ACTIVE' },
    },
    conversations: {
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    },
    progress: {
      orderBy: { recordedAt: 'desc' },
    },
  },
})
```

**实际执行的 SQL 查询**:

**Query 1: 主查询 - 案例详情**
```sql
SELECT
  cases.id,
  cases.case_number,
  cases.patient_id,
  cases.patient_name,
  cases.patient_country,
  cases.patient_language,
  cases.primary_diagnosis,
  cases.diagnosis_code,
  cases.symptoms,
  cases.medical_history,
  cases.ai_summary_zh,
  cases.ai_summary_en,
  cases.stage,
  cases.status,
  cases.assigned_at,
  cases.created_at,
  cases.updated_at
FROM cases
WHERE cases.id = $1  -- caseId
```

**Query 2: 关联查询 - 患者信息**
```sql
SELECT
  users.id,
  users.email,
  users.name,
  users.role,
  users.patient_code,
  users.country,
  users.avatar_url,
  users.status,
  users.created_at,
  users.updated_at
FROM users
WHERE users.id = $1  -- patient_id from case
```

**Query 3: 关联查询 - 文档列表**
```sql
SELECT
  documents.id,
  documents.case_id,
  documents.file_name,
  documents.file_size,
  documents.mime_type,
  documents.storage_key,
  documents.document_type,
  documents.status,
  documents.created_at,
  documents.updated_at
FROM documents
WHERE documents.case_id = $1  -- caseId
  AND documents.status = 'ACTIVE'
```

**Query 4: 关联查询 - 对话列表**
```sql
SELECT
  conversations.id,
  conversations.case_id,
  conversations.category,
  conversations.title,
  conversations.hospital_id,
  conversations.created_at,
  conversations.updated_at
FROM conversations
WHERE conversations.case_id = $1  -- caseId
```

**Query 5: 关联查询 - 所有消息 (⚠️ 潜在性能问题)**
```sql
SELECT
  messages.id,
  messages.conversation_id,
  messages.sender_id,
  messages.content,
  messages.original_language,
  messages.translated_content,
  messages.message_type,
  messages.attachments,
  messages.created_at
FROM messages
WHERE messages.conversation_id IN ($1, $2, $3, ...)  -- 所有对话的 ID
ORDER BY messages.created_at DESC
```
**⚠️ 问题**: 如果一个 case 有多个对话，每个对话有 100+ 条消息，这个查询会返回大量数据

**Query 6: 关联查询 - 进度记录**
```sql
SELECT
  case_progress.id,
  case_progress.case_id,
  case_progress.title,
  case_progress.description,
  case_progress.progress_type,
  case_progress.video_summary,  -- JSONB 字段
  case_progress.recorded_at,
  case_progress.recorded_by_id
FROM case_progress
WHERE case_progress.case_id = $1  -- caseId
ORDER BY case_progress.recorded_at DESC
```

**额外处理: Supabase Storage 签名 URL 生成**
```typescript
// 在代码中，为每个诊断附件生成签名 URL
for (const progress of caseData.progress) {
  if (progress.progressType === 'STATUS_CHANGE' && documentKey) {
    // 调用 Supabase Storage API
    await supabase.storage
      .from('medical-documents')
      .createSignedUrl(documentKey, 3600)
  }
}
```
**影响**: 如果有 N 个诊断记录，会发起 N 次 Supabase API 调用

**总查询次数**: **6 次** (数据库) + **N 次** (Supabase Storage API)

**性能瓶颈**:
1. Query 5 加载了所有对话的所有消息（与 Messages API 重复）
2. Query 3 加载了所有文档（与 Documents API 重复）
3. 多次 Supabase Storage API 调用（无法批量）

---

### 2.4 API 2: GET /cases/{caseId}/messages - 消息列表

#### 查询的表
1. ✅ `conversations` - 查找案例的对话
2. ✅ `messages` - 消息列表 (分页)
3. ✅ `users` (sender) - 消息发送者信息
4. ✅ COUNT 查询 - 消息总数

#### 查询流程

**Prisma 代码**:
```typescript
// GET /api/hospital/cases/{caseId}/messages?page=1&limit=50

// 第 1 步：查找对话
const conversation = await prisma.conversation.findFirst({
  where: { caseId },
  orderBy: { createdAt: 'asc' },
  include: {
    messages: {
      include: {
        sender: true,
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    },
  },
})

// 第 2 步：获取总消息数
const totalMessages = await prisma.message.count({
  where: { conversationId: conversation.id },
})
```

**实际执行的 SQL 查询**:

**Query 1: 查找案例的对话**
```sql
SELECT
  conversations.id,
  conversations.case_id,
  conversations.category,
  conversations.title,
  conversations.hospital_id,
  conversations.created_at,
  conversations.updated_at
FROM conversations
WHERE conversations.case_id = $1  -- caseId
ORDER BY conversations.created_at ASC
LIMIT 1
```
**说明**: 一个 case 理论上只应该有一个 conversation，但为了防止数据异常，使用 `findFirst` 取最早创建的

**Query 2: 查询消息列表 (分页)**
```sql
SELECT
  messages.id,
  messages.conversation_id,
  messages.sender_id,
  messages.content,
  messages.original_language,
  messages.translated_content,
  messages.message_type,
  messages.moderation_status,
  messages.attachments,
  messages.created_at
FROM messages
WHERE messages.conversation_id = $1  -- conversation.id from Query 1
ORDER BY messages.created_at ASC
LIMIT 50 OFFSET 0  -- 第 1 页
```

**Query 3: 关联查询 - 发送者信息 (Prisma N+1)**
```sql
SELECT
  users.id,
  users.email,
  users.name,
  users.role,
  users.avatar_url,
  users.status
FROM users
WHERE users.id IN ($1, $2, $3, ...)  -- 消息发送者的 ID (去重后)
```
**说明**: 如果 50 条消息来自 3 个不同的发送者，这个查询会获取 3 个 user 记录

**Query 4: COUNT 查询 - 总消息数**
```sql
SELECT COUNT(*)
FROM messages
WHERE messages.conversation_id = $1  -- conversation.id
```

**总查询次数**: **4 次**

**查询特征**:
- 使用分页减少数据传输量（每次最多 50 条消息）
- 发送者信息使用 `WHERE id IN (...)` 批量查询（避免 N+1）
- COUNT 查询用于计算总页数

---

### 2.5 API 3: GET /cases/{caseId}/documents - 医疗档案汇总

#### 查询的表
1. ✅ `documents` - 文档表
2. ✅ `case_progress` - 诊断附件 fallback (针对旧数据)
3. ✅ `conversations` - 获取对话 ID
4. ✅ `messages` - 查询消息附件

#### 查询流程

**Prisma 代码**:
```typescript
// GET /api/hospital/cases/{caseId}/documents

// Source 1: 查询 documents 表
const dbDocs = await prisma.document.findMany({
  where: { caseId, status: { not: 'DELETED' } },
  orderBy: { createdAt: 'desc' },
})

// Source 2: 查询 case_progress (诊断附件 fallback)
const diagnosisProgress = await prisma.caseProgress.findMany({
  where: { caseId, progressType: 'STATUS_CHANGE' },
  orderBy: { recordedAt: 'desc' },
})

// Source 3: 查询对话 ID
const conversations = await prisma.conversation.findMany({
  where: { caseId },
  select: { id: true },
})

// Source 4: 查询消息附件
const messages = await prisma.message.findMany({
  where: {
    conversationId: { in: conversationIds },
    messageType: 'FILE',
  },
  orderBy: { createdAt: 'desc' },
})
```

**实际执行的 SQL 查询**:

**Query 1: 查询 documents 表**
```sql
SELECT
  documents.id,
  documents.case_id,
  documents.uploaded_by_id,
  documents.file_name,
  documents.file_size,
  documents.mime_type,
  documents.storage_key,
  documents.document_type,
  documents.status,
  documents.created_at,
  documents.updated_at
FROM documents
WHERE documents.case_id = $1  -- caseId
  AND documents.status != 'DELETED'
ORDER BY documents.created_at DESC
```
**说明**: 获取所有 ACTIVE 和 PENDING 状态的文档

**Query 2: 查询诊断进度记录 (fallback for old data)**
```sql
SELECT
  case_progress.id,
  case_progress.case_id,
  case_progress.title,
  case_progress.description,
  case_progress.progress_type,
  case_progress.video_summary,  -- JSONB 字段，包含 documentKey
  case_progress.recorded_at,
  case_progress.recorded_by_id
FROM case_progress
WHERE case_progress.case_id = $1  -- caseId
  AND case_progress.progress_type = 'STATUS_CHANGE'
ORDER BY case_progress.recorded_at DESC
```
**说明**:
- 针对旧数据的兼容处理
- 旧诊断记录的附件可能只存在于 `video_summary.documentKey`，没有对应的 documents 记录
- 代码会过滤掉已在 documents 表中的记录，避免重复

**Query 3: 查询对话 ID**
```sql
SELECT conversations.id
FROM conversations
WHERE conversations.case_id = $1  -- caseId
```

**Query 4: 查询消息附件**
```sql
SELECT
  messages.id,
  messages.conversation_id,
  messages.sender_id,
  messages.content,
  messages.message_type,
  messages.attachments,  -- JSONB: [{ url, name, type }]
  messages.created_at
FROM messages
WHERE messages.conversation_id IN ($1, $2, ...)  -- 对话 ID 列表
  AND messages.message_type = 'FILE'
ORDER BY messages.created_at DESC
```
**说明**:
- `attachments` 是 JSONB 字段，存储附件数组
- 每个附件包含 `{ url, name, type }`
- `url` 是 Supabase Storage 路径（不是完整 URL）

**额外处理: 批量生成签名 URL**
```typescript
// 为所有文档生成签名 URL (包括 3 个来源)
const allDocuments = [
  ...dbDocs,           // documents 表的文档
  ...diagnosisProgress,  // case_progress 中的诊断附件
  ...messageAttachments  // messages 中的附件
]

// 为每个文档调用 Supabase Storage API
for (const doc of allDocuments) {
  const { data } = await supabase.storage
    .from('medical-documents')
    .createSignedUrl(doc.storageKey, 3600)  // 1 小时有效期
  doc.downloadUrl = data?.signedUrl
}
```

**总查询次数**: **4 次** (数据库) + **M 次** (Supabase Storage API)
- M = documents 数量 + 旧诊断附件数量 + 消息附件数量

**查询特征**:
- 聚合了 3 个不同来源的文档
- 需要去重（避免 documents 和 case_progress 中的重复记录）
- 每个文档都需要单独调用 Supabase API 生成签名 URL（无法批量）

**性能考虑**:
- 如果一个 case 有 20 个文档，会发起 20 次 Supabase API 调用
- Supabase 签名 URL 生成速度较快（~50-100ms/个），但累积起来也会影响总响应时间

---

## 3. 存在的问题汇总

### 🔴 严重问题

#### 问题 1: 详情页面同时调用 3 个 API，数据大量重复获取

**位置**: [page.tsx:48-57](medical-crm/app/hospital/cases/[id]/page.tsx#L48-L57)

**问题现象**:
打开详情页时，前端同时调用：
1. `useCaseDetail(caseId)` → GET `/cases/{caseId}`
2. `useCaseMessages(caseId)` → GET `/cases/{caseId}/messages`
3. `useCaseDocuments(caseId)` → GET `/cases/{caseId}/documents`

**数据重复情况**:
| 表 | Detail API | Messages API | Documents API | 重复次数 |
|----|-----------|-------------|---------------|---------|
| `conversations` | ✅ | ✅ | ✅ | **3次** |
| `messages` | ✅ | ✅ | ✅ (FILE类型) | **3次** |
| `documents` | ✅ | - | ✅ | **2次** |
| `case_progress` | ✅ | - | ✅ | **2次** |

**性能影响**:
根据性能分析报告，详情页加载耗时 **8-10 秒**，触发 **30-40 次数据库查询**

**优化方案**:

**方案 A (推荐): 创建聚合 API**
```typescript
// 新建 GET /api/hospital/cases/{caseId}/full
// 一次性返回所有数据，避免重复查询

const caseData = await prisma.case.findUnique({
  where: { id: caseId },
  include: {
    patient: true,
    documents: { where: { status: 'ACTIVE' } },
    conversations: {
      include: {
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    },
    progress: { orderBy: { recordedAt: 'desc' } },
  }
})

// 返回格式化后的完整数据
return {
  detail: { ... },
  messages: { items: [...], pagination: {...} },
  documents: [...],
}
```

**方案 B: Detail API 返回所有数据，其他 API 变为可选**
- Detail API 继续返回所有数据（保持现状）
- Messages 和 Documents API 只在需要刷新时调用
- 前端优先使用 Detail API 的数据

**预期效果**:
- 减少 **60-70%** 的数据库查询
- 页面加载时间从 8-10秒 降至 **2-3秒**

---

#### 问题 2: Detail API 加载了大量不必要数据

**位置**: [route.ts:32-50](medical-crm/app/api/hospital/cases/[caseId]/route.ts#L32-L50)

**问题**:
Detail API 的 include 层级太深，加载了：
- ✅ 所有对话 (`conversations`)
- ⚠️ 所有对话的所有消息 (`conversations.messages`)
- ⚠️ 所有文档 (`documents`)
- ✅ 所有进度记录 (`progress`)

**当前代码**:
```typescript
const caseData = await prisma.case.findUnique({
  where: { id: caseId },
  include: {
    patient: true,
    documents: {
      where: { status: 'ACTIVE' },
    },
    conversations: {
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    },
    progress: {
      orderBy: { recordedAt: 'desc' },
    },
  },
})
```

**问题分析**:
1. 如果采用**问题 1 的方案 A**，这个 include 是合理的
2. 如果保持现状（3 个独立 API），应该减少 include，避免重复

**优化方案**:

**如果保持 3 个独立 API**:
```typescript
// Detail API 只返回基本信息和摘要
const caseData = await prisma.case.findUnique({
  where: { id: caseId },
  include: {
    patient: true,
    progress: { orderBy: { recordedAt: 'desc' } },
    _count: {
      select: {
        documents: true,
        conversations: true
      }
    }
    // 不 include documents, conversations, messages
  },
})
```

---

### ⚠️ 中等问题

#### 问题 3: 缺乏客户端缓存

**位置**: 所有 hooks ([hooks.ts](medical-crm/lib/api/hospital/hooks.ts))

**问题**:
- 每次组件挂载都重新请求
- 切换 Tab 或刷新页面会重复加载相同数据
- 没有 stale-while-revalidate 机制

**优化方案**:
参考问题 1.4.3 的 SWR 方案

---

#### 问题 4: Documents API 聚合了 3 个数据源，查询较多

**位置**: [documents/route.ts](medical-crm/app/api/hospital/cases/[caseId]/documents/route.ts)

**问题**:
为了聚合医疗文档，查询了：
1. `documents` 表
2. `case_progress` 表 (诊断附件 fallback)
3. `conversations` + `messages` 表 (消息附件)

**查询次数**: 4-5 次

**优化方向**:
- 如果采用聚合 API (问题 1 方案 A)，可以共享查询结果
- 当前架构下较难优化，因为确实需要聚合多个来源

---

#### 问题 5: 未实现已读/未读消息状态

**位置**:
- [route.ts:73](medical-crm/app/api/hospital/cases/[caseId]/route.ts#L73) (Detail API)
- [route.ts:104](medical-crm/app/api/hospital/cases/route.ts#L104) (List API)

**问题**:
代码中多处 TODO 标记需要实现已读状态

**当前状态**:
```typescript
const unreadMessages = totalMessages // TODO: 实现已读状态
// 或
const unreadMessages = 0 // 暂时返回 0
```

**建议方案**:
1. 创建 `message_read_status` 表
   ```sql
   CREATE TABLE message_read_status (
     id UUID PRIMARY KEY,
     message_id UUID REFERENCES messages(id),
     user_id UUID REFERENCES users(id),
     read_at TIMESTAMP,
     UNIQUE(message_id, user_id)
   );
   ```

2. 或在 messages 表添加 `read_by` JSON 字段
   ```typescript
   read_by: {
     "user-id-1": "2024-01-01T10:00:00Z",
     "user-id-2": "2024-01-01T11:00:00Z"
   }
   ```

---

### 🟡 次要问题

#### 问题 6: Detail API 中为诊断附件生成签名 URL 的逻辑在循环中

**位置**: [route.ts:110-150](medical-crm/app/api/hospital/cases/[caseId]/route.ts#L110-L150)

**问题**:
使用 `Promise.all` + `map` 为每个诊断附件生成 Supabase 签名 URL

**当前代码**:
```typescript
diagnoses: await (async () => {
  const supabase = createServerSupabaseClient()
  return Promise.all(
    caseData.progress
      .filter((p) => p.progressType === 'STATUS_CHANGE')
      .map(async (p) => {
        // 为每个诊断生成签名 URL
        const { data: urlData } = await supabase.storage
          .from(MEDICAL_DOCUMENTS_BUCKET)
          .createSignedUrl(documentKey, 3600)
        // ...
      })
  )
})()
```

**影响**:
如果有 10 个诊断记录，会发起 10 次 Supabase Storage API 调用

**优化方向**:
Supabase 目前不支持批量生成签名 URL，当前做法已是最优

---

#### 问题 7: 患者年龄和性别使用硬编码

**位置**:
- [route.ts:89-90](medical-crm/app/api/hospital/cases/[caseId]/route.ts#L89-L90) (Detail API)
- [route.ts:113-114](medical-crm/app/api/hospital/cases/route.ts#L113-L114) (List API)

**问题**:
```typescript
age: 35, // TODO: 从用户资料获取
gender: 'male' as const, // TODO: 从用户资料获取
```

**建议**: 在 users 表中添加 `age` 和 `gender` 字段

---

## 4. 优化优先级建议

| 优先级 | 问题 | 预期提升 | 实施难度 |
|-------|------|---------|---------|
| **P0** | 问题 1: 合并详情页 3 个 API | 减少 60-70% 查询，8秒 → 2-3秒 | 中 |
| **P0** | 问题 2: 减少 Detail API 的 include 层级 | 减少 30-40% 查询 | 低 |
| **P1** | 问题 3: 引入 SWR/React Query 缓存 | 减少 50% 重复请求 | 中 |
| **P1** | 问题 5: 实现已读/未读消息状态 | 功能完整性 | 中-高 |
| **P2** | 列表页问题 2: 搜索添加防抖 | 改善用户体验 | 低 |
| **P2** | 问题 7: 修复硬编码的患者信息 | 数据准确性 | 低 |

---

## 5. 快速修复清单 (立即可做)

### ✅ 第一步: 创建聚合 API (解决问题 1)

**文件**: `medical-crm/app/api/hospital/cases/[caseId]/full/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient, MEDICAL_DOCUMENTS_BUCKET } from '@/lib/supabaseServer'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params

  // 一次性获取所有数据
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      patient: true,
      documents: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
      conversations: {
        include: {
          messages: {
            include: { sender: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      progress: {
        orderBy: { recordedAt: 'desc' },
      },
    },
  })

  if (!caseData) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND' } },
      { status: 404 }
    )
  }

  // ... 处理数据，生成签名 URL 等

  return NextResponse.json({
    success: true,
    data: {
      detail: { /* 案例详情 */ },
      messages: {
        items: [ /* 消息列表 */ ],
        pagination: { /* 分页信息 */ }
      },
      documents: [ /* 文档列表 */ ],
    },
  })
}
```

**预期效果**:
- 查询次数从 **15-20 次** 降至 **6-8 次**
- 页面加载时间从 **8-10 秒** 降至 **2-3 秒**

---

### ✅ 第二步: 添加搜索防抖 (列表页问题 2)

**文件**: 创建 `medical-crm/hooks/use-debounced-value.ts`

```typescript
import { useState, useEffect } from 'react'

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**修改**: [page.tsx:148](medical-crm/app/hospital/cases/page.tsx#L148)

```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export default function HospitalCasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  // 使用 debouncedSearch 代替 searchQuery
  const filteredCases = cases.filter(c => {
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      // ...
    }
  })
}
```

---

## 6. 总结

### 当前状态
- **列表页**: 查询 4 次，加载时间约 2 秒 (可接受)
- **详情页**: 查询 15-20 次，加载时间 8-10 秒 **(严重问题)**

### 核心问题
1. 🔴 详情页同时调用 3 个 API，数据重复获取 (conversations, messages, documents, case_progress 都被查询多次)
2. 🔴 Detail API include 层级过深，加载不必要数据
3. ⚠️ 缺乏客户端缓存，重复请求频繁

### 优化建议
**优先修复详情页的 3 个 API 合并问题**，可立即获得 **60-70% 的性能提升**。

其他优化可以循序渐进地实施。

---

## 附录 B: SQL 查询总览

### B.1 列表页查询汇总

| 查询序号 | 类型 | 查询的表 | 用途 | 估计耗时 |
|---------|------|---------|------|---------|
| 1 | COUNT | `cases` | 获取总案例数 | ~10-20ms |
| 2 | SELECT | `cases` | 主查询案例列表 (20条) | ~20-30ms |
| 3 | SELECT | `users` | 批量查询患者信息 (20个) | ~10-15ms |
| 4 | SELECT | `documents` | 批量查询文档 ID (用于计数) | ~15-20ms |

**总耗时估计**: ~55-85ms

**优化效果**: 已移除 conversations.messages include，减少了原本的 2-3 次查询

---

### B.2 详情页查询汇总

#### Detail API (`GET /cases/{caseId}`)

| 查询序号 | 类型 | 查询的表 | 返回数据量 | 估计耗时 |
|---------|------|---------|-----------|---------|
| 1 | SELECT | `cases` | 1 行 | ~5ms |
| 2 | SELECT | `users` | 1 行 | ~5ms |
| 3 | SELECT | `documents` | N 行 | ~10-20ms |
| 4 | SELECT | `conversations` | 1-3 行 | ~5ms |
| 5 | SELECT | `messages` | 10-200 行 ⚠️ | ~50-200ms |
| 6 | SELECT | `case_progress` | 5-20 行 | ~10-15ms |
| 7+ | Supabase API | Storage | N 个签名URL | ~50ms × N |

**总耗时估计**: ~85-245ms (数据库) + ~50ms × N (Storage)

**⚠️ 性能瓶颈**: Query 5 会加载所有消息，如果对话有 200+ 条消息，耗时会显著增加

---

#### Messages API (`GET /cases/{caseId}/messages`)

| 查询序号 | 类型 | 查询的表 | 返回数据量 | 估计耗时 |
|---------|------|---------|-----------|---------|
| 1 | SELECT | `conversations` | 1 行 | ~5ms |
| 2 | SELECT | `messages` (分页) | 50 行 | ~20-30ms |
| 3 | SELECT | `users` | 2-5 行 | ~5ms |
| 4 | COUNT | `messages` | 1 个数字 | ~10ms |

**总耗时估计**: ~40-50ms

---

#### Documents API (`GET /cases/{caseId}/documents`)

| 查询序号 | 类型 | 查询的表 | 返回数据量 | 估计耗时 |
|---------|------|---------|-----------|---------|
| 1 | SELECT | `documents` | N 行 | ~10-20ms |
| 2 | SELECT | `case_progress` | M 行 | ~10-15ms |
| 3 | SELECT | `conversations` | 1-3 行 | ~5ms |
| 4 | SELECT | `messages` (FILE 类型) | K 行 | ~10-15ms |
| 5+ | Supabase API | Storage | (N+M+K) 个签名URL | ~50ms × (N+M+K) |

**总耗时估计**: ~35-55ms (数据库) + ~50ms × (N+M+K) (Storage)

---

### B.3 数据重复查询分析

#### 详情页打开时的查询重复情况

| 表名 | Detail API | Messages API | Documents API | 总查询次数 |
|-----|-----------|-------------|---------------|----------|
| `cases` | ✅ 1次 | - | - | **1次** |
| `users` (patient) | ✅ 1次 | - | - | **1次** |
| `users` (sender) | - | ✅ 1次 | - | **1次** |
| `documents` | ✅ N行 | - | ✅ N行 | **2次** ⚠️ |
| `conversations` | ✅ 全部 | ✅ 1个 | ✅ ID列表 | **3次** 🔴 |
| `messages` | ✅ 全部消息 | ✅ 50条(分页) | ✅ FILE类型 | **3次** 🔴 |
| `case_progress` | ✅ 全部 | - | ✅ STATUS_CHANGE | **2次** ⚠️ |

**重复查询统计**:
- 🔴 **严重重复** (3次): `conversations`, `messages`
- ⚠️ **中度重复** (2次): `documents`, `case_progress`
- ✅ **无重复** (1次): `cases`, `users`

**优化潜力**:
如果合并为单一 API，可以从 **3 × (4-6次查询)** = **12-18次查询** 降至 **6-8次查询**

---

### B.4 数据流向图

```
前端页面: /hospital/cases/{id}
  │
  ├─ Hook: useCaseDetail(caseId)
  │    └─ GET /api/hospital/cases/{caseId}
  │         │
  │         ├─ Query 1: SELECT cases WHERE id = caseId
  │         ├─ Query 2: SELECT users WHERE id = patient_id
  │         ├─ Query 3: SELECT documents WHERE case_id = caseId  ⚠️ 与 Documents API 重复
  │         ├─ Query 4: SELECT conversations WHERE case_id = caseId  🔴 与 Messages/Documents API 重复
  │         ├─ Query 5: SELECT messages WHERE conversation_id IN (...)  🔴 与 Messages API 重复
  │         ├─ Query 6: SELECT case_progress WHERE case_id = caseId  ⚠️ 与 Documents API 重复
  │         └─ Supabase: 生成 N 个诊断附件的签名 URL
  │
  ├─ Hook: useCaseMessages(caseId)
  │    └─ GET /api/hospital/cases/{caseId}/messages
  │         │
  │         ├─ Query 1: SELECT conversations WHERE case_id = caseId  🔴 重复
  │         ├─ Query 2: SELECT messages LIMIT 50  🔴 重复
  │         ├─ Query 3: SELECT users WHERE id IN (sender_ids)
  │         └─ Query 4: COUNT messages
  │
  └─ Hook: useCaseDocuments(caseId)
       └─ GET /api/hospital/cases/{caseId}/documents
            │
            ├─ Query 1: SELECT documents WHERE case_id = caseId  ⚠️ 重复
            ├─ Query 2: SELECT case_progress WHERE case_id = caseId  ⚠️ 重复
            ├─ Query 3: SELECT conversations WHERE case_id = caseId  🔴 重复
            ├─ Query 4: SELECT messages WHERE message_type = 'FILE'  🔴 重复
            └─ Supabase: 生成 M 个文档的签名 URL

总计:
  - 数据库查询: ~15-20 次 (其中 60% 是重复查询)
  - Supabase API: ~(N + M) 次 签名 URL 生成
  - 总耗时: ~8-10 秒 (首次加载)
```

---

### B.5 优化后的查询流向 (推荐方案)

```
前端页面: /hospital/cases/{id}
  │
  └─ Hook: useCaseFullDetail(caseId)  [新建聚合 hook]
       └─ GET /api/hospital/cases/{caseId}/full  [新建聚合 API]
            │
            ├─ Query 1: SELECT cases WHERE id = caseId
            ├─ Query 2: SELECT users (patient) WHERE id = patient_id
            ├─ Query 3: SELECT documents WHERE case_id = caseId
            ├─ Query 4: SELECT conversations WHERE case_id = caseId
            ├─ Query 5: SELECT messages (分页) WHERE conversation_id IN (...)
            ├─ Query 6: SELECT users (senders) WHERE id IN (...)
            ├─ Query 7: SELECT case_progress WHERE case_id = caseId
            └─ Supabase: 批量生成签名 URL (复用查询结果)

总计:
  - 数据库查询: ~7 次 (减少 55%)
  - Supabase API: ~(N + M) 次 (无变化，Supabase 不支持批量)
  - 总耗时: ~2-3 秒 (减少 70%)

优化效果:
  ✅ 消除了所有重复查询
  ✅ 数据库查询从 15-20次 降至 7次
  ✅ 页面加载时间从 8-10秒 降至 2-3秒
```
