# Conversations API 查询分析

## 1. 涉及的表结构

### 1.1 conversations 表
```prisma
model Conversation {
  id         String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId     String?              @map("case_id") @db.Uuid
  category   ConversationCategory
  title      String?              @db.VarChar(200)
  hospitalId String?              @map("hospital_id") @db.Uuid
  createdAt  DateTime             @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt  DateTime             @updatedAt @map("updated_at") @db.Timestamp(6)
  case       Case?                @relation(fields: [caseId], references: [id])
  messages   Message[]

  @@index([caseId])
  @@index([category])
  @@map("conversations")
}
```

**字段说明：**
- `id`: UUID 主键
- `caseId`: 关联的案例 ID (可为空)
- `category`: 对话类型枚举 (ADMIN_HOSPITAL / HOSPITAL_PATIENT)
- `title`: 对话标题
- `hospitalId`: 关联的医院 ID
- `createdAt`, `updatedAt`: 时间戳

**关系：**
- `case`: 多对一关联 cases 表
- `messages`: 一对多关联 messages 表

---

### 1.2 cases 表
```prisma
model Case {
  id                 String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseNumber         String         @unique @map("case_number") @db.VarChar(50)
  patientId          String         @map("patient_id") @db.Uuid
  assignedHospitalId String?        @map("assigned_hospital_id") @db.Uuid
  patientName        String         @map("patient_name") @db.VarChar(100)
  patientCountry     String?        @map("patient_country") @db.VarChar(100)
  patientLanguage    String         @default("en") @map("patient_language") @db.VarChar(10)
  primaryDiagnosis   String?        @map("primary_diagnosis")
  diagnosisCode      String?        @map("diagnosis_code") @db.VarChar(50)
  symptoms           Json?
  medicalHistory     String?        @map("medical_history")
  aiSummaryZh        String?        @map("ai_summary_zh")
  aiSummaryEn        String?        @map("ai_summary_en")
  riskLevel          RiskLevel?     @map("risk_level")
  status             CaseStatus     @default(ACTIVE)
  stage              CaseStage      @default(PENDING_ASSIGNMENT)
  assignedAt         DateTime?      @map("assigned_at") @db.Timestamp(6)
  createdAt          DateTime       @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt          DateTime       @updatedAt @map("updated_at") @db.Timestamp(6)
  progress           CaseProgress[]
  assignedHospital   Hospital?      @relation(fields: [assignedHospitalId], references: [id])
  patient            User           @relation("PatientCases", fields: [patientId], references: [id])
  conversations      Conversation[]
  documents          Document[]

  @@index([caseNumber])
  @@index([patientId])
  @@index([assignedHospitalId])
  @@index([status])
  @@index([stage])
  @@map("cases")
}
```

**字段说明：**
- `id`: UUID 主键
- `caseNumber`: 案例编号（唯一）
- `patientId`: 患者 ID（关联 users 表）
- `assignedHospitalId`: 分配的医院 ID
- `patientName`: 患者姓名
- `patientCountry`: 患者国籍
- `status`: 案例状态
- `stage`: 案例阶段

**关系：**
- `patient`: 多对一关联 users 表（作为患者）
- `assignedHospital`: 多对一关联 hospitals 表
- `conversations`: 一对多关联 conversations 表

---

### 1.3 users 表
```prisma
model User {
  id                String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String     @unique @db.VarChar(255)
  name              String     @db.VarChar(100)
  role              UserRole   @default(PATIENT)
  hospitalId        String?    @map("hospital_id") @db.Uuid
  avatarUrl         String?    @map("avatar_url") @db.VarChar(500)
  status            String     @default("active") @db.VarChar(20)
  patientCode       String?    @unique @map("patient_code") @db.VarChar(20)
  country           String?    @db.VarChar(100)
  lastLoginAt       DateTime?  @map("last_login_at") @db.Timestamp(6)
  createdAt         DateTime   @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt         DateTime   @updatedAt @map("updated_at") @db.Timestamp(6)
  auditLogs         AuditLog[]
  casesAsPatient    Case[]     @relation("PatientCases")
  uploadedDocuments Document[] @relation("UploadedDocuments")
  messages          Message[]
  hospital          Hospital?  @relation(fields: [hospitalId], references: [id])

  @@index([email])
  @@index([role])
  @@index([hospitalId])
  @@map("users")
}
```

**字段说明：**
- `id`: UUID 主键
- `email`: 邮箱（唯一）
- `name`: 用户姓名
- `role`: 用户角色枚举
- `hospitalId`: 关联的医院 ID
- `patientCode`: 患者编号（唯一）

**关系：**
- `casesAsPatient`: 一对多关联 cases 表（作为患者的案例）
- `messages`: 一对多关联 messages 表（发送的消息）

---

### 1.4 messages 表
```prisma
model Message {
  id                String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversationId    String           @map("conversation_id") @db.Uuid
  senderId          String           @map("sender_id") @db.Uuid
  content           String
  originalLanguage  String           @default("en") @map("original_language") @db.VarChar(10)
  translatedContent String?          @map("translated_content")
  messageType       MessageType      @default(TEXT) @map("message_type")
  moderationStatus  ModerationStatus @default(ALLOWED) @map("moderation_status")
  attachments       Json?
  createdAt         DateTime         @default(now()) @map("created_at") @db.Timestamp(6)
  conversation      Conversation     @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender            User             @relation(fields: [senderId], references: [id])

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
  @@map("messages")
}
```

**字段说明：**
- `id`: UUID 主键
- `conversationId`: 所属对话 ID
- `senderId`: 发送者 ID（关联 users 表）
- `content`: 消息内容
- `createdAt`: 创建时间

**关系：**
- `conversation`: 多对一关联 conversations 表
- `sender`: 多对一关联 users 表

---

## 2. 当前 API 实现

### 2.1 API 路径
```
GET /api/hospital/conversations
```

### 2.2 查询参数
- `category`: 可选，过滤对话类型（'admin' | 'patient'）
- `search`: 可选，搜索关键词

### 2.3 当前 Prisma 查询代码

**文件位置：** `medical-crm/app/api/hospital/conversations/route.ts`

```typescript
// 步骤 1: 获取当前用户的 hospitalId
async function getHospitalIdFromUser(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { hospitalId: true },
  })
  return user?.hospitalId || null
}

// 步骤 2: 主查询逻辑
export async function GET(req: NextRequest) {
  // 获取登录用户
  const auth = await getCurrentUser()
  let hospitalId: string | null = null

  if (auth.success && auth.user.email) {
    hospitalId = await getHospitalIdFromUser(auth.user.email)
  }

  // 构建 where 条件
  let where: Prisma.ConversationWhereInput = {}

  // 按类别过滤
  if (category === 'admin') {
    where.category = ConversationCategory.ADMIN_HOSPITAL
    if (hospitalId) {
      where.hospitalId = hospitalId
    }
  } else if (category === 'patient') {
    where.category = ConversationCategory.HOSPITAL_PATIENT
    if (hospitalId) {
      where.case = { assignedHospitalId: hospitalId }
    }
  } else {
    // 无类别过滤时，返回 Hospital 能看到的所有对话
    if (hospitalId) {
      where.OR = [
        {
          category: ConversationCategory.ADMIN_HOSPITAL,
          hospitalId: hospitalId,
        },
        {
          category: ConversationCategory.HOSPITAL_PATIENT,
          case: { assignedHospitalId: hospitalId },
        },
      ]
    }
  }

  // 搜索过滤
  if (search) {
    const searchCondition: Prisma.ConversationWhereInput = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { case: { patientName: { contains: search, mode: 'insensitive' } } },
        { case: { caseNumber: { contains: search, mode: 'insensitive' } } },
      ],
    }
    where = {
      AND: [where, searchCondition],
    }
  }

  // 并行执行：主查询 + 两个统计查询
  const [conversations, adminCount, patientCount] = await Promise.all([
    // 主查询：对话列表
    prisma.conversation.findMany({
      where,
      include: {
        case: {
          include: {
            patient: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),

    // 统计查询 1：admin 对话数量
    prisma.conversation.count({
      where: {
        category: ConversationCategory.ADMIN_HOSPITAL,
        ...(hospitalId ? { hospitalId } : {}),
      },
    }),

    // 统计查询 2：patient 对话数量
    prisma.conversation.count({
      where: {
        category: ConversationCategory.HOSPITAL_PATIENT,
        ...(hospitalId ? { case: { assignedHospitalId: hospitalId } } : {}),
      },
    }),
  ])

  // 转换数据格式
  const items = conversations.map((conv) => {
    const lastMessage = conv.messages[0]
    const isAdmin = conv.category === ConversationCategory.ADMIN_HOSPITAL

    return {
      id: conv.id,
      name: isAdmin ? 'Admin Team' : conv.case?.patientName || '患者对话',
      avatar: undefined,
      category: isAdmin ? 'admin' : 'patient',
      caseId: conv.caseId || undefined,
      caseNumber: conv.case?.caseNumber || undefined,
      patientCode: conv.case?.patient?.patientCode || ...,
      lastMessage: lastMessage?.content || '暂无消息',
      lastMessageAt: conv.updatedAt.toISOString(),
      unreadCount: 0,
      isOnline: false,
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      items,
      adminCount,
      patientCount,
      totalUnread: 0,
    },
  })
}
```

---

## 3. 实际执行的 SQL 查询

### 3.1 查询执行顺序

**【顺序执行】**
```sql
-- Query 1: 获取 hospitalId
SELECT users.id, users.hospital_id
FROM users
WHERE email = $1
```

**【并行执行】Promise.all([...])**

**Query 2a - 主查询：conversations**
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
LEFT JOIN cases ON conversations.case_id = cases.id
WHERE (
  (conversations.category = 'ADMIN_HOSPITAL' AND conversations.hospital_id = $1)
  OR
  (conversations.category = 'HOSPITAL_PATIENT' AND cases.assigned_hospital_id = $1)
)
ORDER BY conversations.updated_at DESC
```

**Query 2b - 关联查询：cases**
```sql
SELECT
  cases.id,
  cases.case_number,
  cases.patient_id,
  cases.patient_name,
  cases.patient_country,
  ...
FROM cases
WHERE cases.id IN ($1, $2, $3, ...)
```

**Query 2c - 关联查询：patient (users)**
```sql
SELECT
  users.id,
  users.email,
  users.name,
  users.patient_code,
  ...
FROM users
WHERE users.id IN ($1, $2, $3, ...)
```

**Query 2d - 关联查询：messages**
```sql
SELECT
  messages.id,
  messages.conversation_id,
  messages.sender_id,
  messages.content,
  messages.created_at,
  ...
FROM messages
WHERE messages.conversation_id IN ($1, $2, $3, ...)
ORDER BY messages.created_at DESC
LIMIT 1  -- 每个对话取最新一条
```

**Query 2e - 关联查询：sender (users)**
```sql
SELECT
  users.id,
  users.email,
  users.name,
  ...
FROM users
WHERE users.id IN ($1, $2, $3, ...)
```

**Query 3 - 统计查询：adminCount**
```sql
SELECT COUNT(*)
FROM conversations
WHERE category = 'ADMIN_HOSPITAL'
  AND hospital_id = $1
```

**Query 4 - 统计查询：patientCount**
```sql
SELECT COUNT(*)
FROM conversations
LEFT JOIN cases ON conversations.case_id = cases.id
WHERE category = 'HOSPITAL_PATIENT'
  AND cases.assigned_hospital_id = $1
```

---

## 4. 查询特征总结

### 4.1 查询总数
- **总计：8 个 SQL 查询**
- 1 个顺序查询（hospitalId）
- 7 个并行查询（5 个主查询 N+1 + 2 个 COUNT）

### 4.2 N+1 问题
Prisma 的 `include` 机制会将关联查询拆分成多个独立的 SELECT：
1. 先查 conversations
2. 根据 conversations 的 caseId 批量查 cases (`WHERE id IN (...)`)
3. 根据 cases 的 patientId 批量查 users
4. 根据 conversations 的 id 批量查 messages
5. 根据 messages 的 senderId 批量查 users

这种方式不是传统的 JOIN，而是多次独立查询。

### 4.3 COUNT 查询特征
- adminCount 和 patientCount 不包含 `search` 过滤条件
- 它们返回的是总数，不是当前过滤结果的数量
- 主查询如果有 search，返回的是过滤后的对话列表

### 4.4 数据关系
```
Conversation (对话)
  ├─ case (Case)                    -- 关联案例
  │   └─ patient (User)             -- 案例的患者
  └─ messages (Message[])           -- 对话的消息
      └─ sender (User)              -- 消息的发送者
```

每个对话会加载：
- 案例信息（caseNumber, patientName）
- 患者信息（patientCode）
- 最新一条消息（content）
- 消息发送者（name）
