# Consultations API 性能分析

> 文件路径: `medical-crm/app/api/hospital/consultations/route.ts`

---

## 1. 涉及的数据库表结构

### 1.1 `consultations` 表 (主表)

```sql
CREATE TABLE consultations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id               UUID NOT NULL,           -- 关联的案例
  hospital_id           UUID NOT NULL,           -- 所属医院
  patient_id            UUID NOT NULL,           -- 患者
  doctor_id             UUID,                    -- 医生（可选）
  status                consultation_status DEFAULT 'SCHEDULED',
  scheduled_at          TIMESTAMP NOT NULL,      -- 预约时间
  started_at            TIMESTAMP,               -- 实际开始时间
  ended_at              TIMESTAMP,               -- 实际结束时间
  duration_minutes      INT DEFAULT 30,          -- 计划时长（分钟）
  actual_duration       INT,                     -- 实际时长（秒）
  consultation_link     VARCHAR(500),            -- 问诊链接
  ai_translation        BOOLEAN DEFAULT false,   -- 是否启用AI翻译
  patient_language      VARCHAR(10) DEFAULT 'en',-- 患者语言
  notes                 TEXT,                    -- 备注
  -- 视频相关 (大字段，列表页不需要)
  video_storage_key     VARCHAR(500),
  video_size            BIGINT,
  video_duration        INT,
  video_thumbnail       VARCHAR(500),
  video_uploaded_at     TIMESTAMP,
  -- AI总结 (JSONB 大字段，列表页不需要)
  ai_summary            JSONB,                   -- AI总结内容
  ai_summary_created_at TIMESTAMP,
  ai_summary_status     ai_summary_status DEFAULT 'PENDING',
  created_at            TIMESTAMP DEFAULT now(),
  updated_at            TIMESTAMP DEFAULT now()
);

-- 当前索引 (单列索引，不够用！)
CREATE INDEX idx_consultations_case_id ON consultations(case_id);
CREATE INDEX idx_consultations_hospital_id ON consultations(hospital_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);

-- 枚举
CREATE TYPE consultation_status AS ENUM (
  'SCHEDULED',    -- 已安排
  'IN_PROGRESS',  -- 进行中
  'COMPLETED',    -- 已完成
  'CANCELLED',    -- 已取消
  'NO_SHOW'       -- 未出席
);

CREATE TYPE ai_summary_status AS ENUM (
  'PENDING',      -- 待生成
  'PROCESSING',   -- 生成中
  'COMPLETED',    -- 已完成
  'FAILED'        -- 生成失败
);
```

### 1.2 `cases` 表 (关联表)

```sql
CREATE TABLE cases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number          VARCHAR(50) UNIQUE NOT NULL,  -- 案例编号 (如 CASE-2024-001)
  patient_id           UUID NOT NULL,                -- 关联患者
  assigned_hospital_id UUID,                         -- 分配的医院
  patient_name         VARCHAR(100) NOT NULL,        -- 患者姓名
  patient_country      VARCHAR(100),                 -- 患者国籍
  patient_language     VARCHAR(10) DEFAULT 'en',     -- 患者语言
  primary_diagnosis    TEXT,                         -- 主诊断
  diagnosis_code       VARCHAR(50),                  -- 诊断代码
  symptoms             JSONB,                        -- 症状
  medical_history      TEXT,                         -- 病史
  ai_summary_zh        TEXT,                         -- AI中文总结
  ai_summary_en        TEXT,                         -- AI英文总结
  risk_level           risk_level,                   -- 风险等级
  status               case_status DEFAULT 'ACTIVE',
  stage                case_stage DEFAULT 'PENDING_ASSIGNMENT',
  assigned_at          TIMESTAMP,
  created_at           TIMESTAMP DEFAULT now(),
  updated_at           TIMESTAMP DEFAULT now()
);

-- 索引
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_patient_id ON cases(patient_id);
CREATE INDEX idx_cases_assigned_hospital_id ON cases(assigned_hospital_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_stage ON cases(stage);
```

### 1.3 `users` 表 (关联表 - 患者信息)

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          user_role DEFAULT 'PATIENT',    -- ADMIN | HOSPITAL | PATIENT
  hospital_id   UUID,                           -- 医院员工关联的医院
  avatar_url    VARCHAR(500),
  status        VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP,
  patient_code  VARCHAR(20) UNIQUE,             -- 患者编号 (如 CN-L01)
  country       VARCHAR(100),                   -- 国籍
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_hospital_id ON users(hospital_id);
```

### 1.4 表关系图

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   consultations  │       │      cases       │       │      users       │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id               │       │ id               │       │ id               │
│ case_id ─────────┼──────►│ case_number      │       │ email            │
│ hospital_id      │       │ patient_id ──────┼──────►│ name             │
│ patient_id       │       │ patient_name     │       │ patient_code     │
│ status           │       │ patient_country  │       │ country          │
│ scheduled_at     │       │ patient_language │       │ role             │
│ ai_translation   │       │ primary_diagnosis│       └──────────────────┘
│ ...              │       │ ...              │
└──────────────────┘       └──────────────────┘
```

### 1.5 ⚠️ 表设计问题：consultations 表太"胖"

**当前问题：**
- `video_*` 字段：视频元数据，列表页不需要
- `ai_summary` JSONB：可能很大，列表页不需要
- `notes` TEXT：备注文本，列表页不需要

**长期优化建议（P3）：拆表**
```sql
-- 主表保持轻量
CREATE TABLE consultations (
  id, case_id, hospital_id, patient_id, status, scheduled_at,
  duration_minutes, ai_translation, patient_language, consultation_link,
  created_at, updated_at
);

-- 视频信息拆出去
CREATE TABLE consultation_assets (
  consultation_id UUID PRIMARY KEY REFERENCES consultations(id),
  video_storage_key, video_size, video_duration, video_thumbnail, video_uploaded_at
);

-- AI 总结拆出去
CREATE TABLE consultation_summaries (
  consultation_id UUID PRIMARY KEY REFERENCES consultations(id),
  ai_summary JSONB, ai_summary_status, ai_summary_created_at, notes
);
```

---

## 2. GET 请求 - 当前查询分析

### 2.1 查询流程总览

```
┌─────────────────────────────────────────────────────────────────┐
│              GET /api/hospital/consultations                     │
│              参数: ?page=1&limit=20&status=scheduled             │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       │
┌───────────────┐       ┌───────────────┐               │
│   Query 1     │       │   Query 2     │               │
│ findMany()    │       │ count()       │               │
│ 获取列表       │       │ 获取总数      │               │
└───────────────┘       └───────────────┘               │
        │                       │                       │
        └───────────┬───────────┘                       │
                    ▼                                   │
            ┌───────────────┐                           │
            │   Query 3     │                           │
            │ case.findMany │ ◄─ 等待 Query 1 完成       │
            │ 二次查询 Case  │                           │
            └───────────────┘                           │
                    │                                   │
        ┌───────────┼───────────┬───────────┐           │
        ▼           ▼           ▼           ▼           │
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ │
│ Query 4   │ │ Query 5   │ │ Query 6   │ │ Query 7   │ │
│ SCHEDULED │ │ COMPLETED │ │ TODAY     │ │ TRANSLATE │ │
│ count     │ │ count     │ │ count     │ │ count     │ │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ │
        │           │           │           │           │
        └───────────┴───────────┴───────────┘           │
                                │                       │
                                ▼                       │
                    ┌───────────────────────┐           │
                    │     返回 JSON 响应     │◄──────────┘
                    └───────────────────────┘
```

---

### 2.2 Query 1: 获取问诊列表

**代码位置:** 第 36-42 行

**Prisma 代码:**
```typescript
const consultations = await prisma.consultation.findMany({
  where,                           // 可选: { status: 'SCHEDULED' }
  orderBy: { scheduledAt: 'desc' },
  skip: (page - 1) * limit,        // 🔴 OFFSET 分页，越往后越慢！
  take: limit,                     // 分页大小: 20
})
```

**生成的 SQL:**
```sql
SELECT
  "consultations"."id",
  "consultations"."case_id",
  "consultations"."hospital_id",
  -- ... 所有字段，包括 video_*, ai_summary 等大字段！
FROM "consultations"
WHERE "consultations"."status" = 'SCHEDULED'
ORDER BY "consultations"."scheduled_at" DESC
LIMIT 20
OFFSET 0;   -- 🔴 page=100 时变成 OFFSET 1980，需要先扫描 1980 行！
```

**问题:**
1. 🔴 **OFFSET 分页**：page 越大越慢，O(offset + limit)
2. 🔴 **SELECT ***：拉取所有字段，包括大字段
3. 🔴 **无复合索引**：ORDER BY 可能触发排序

---

### 2.3 Query 2: 获取总数（分页）

**代码位置:** 第 43 行

**Prisma 代码:**
```typescript
const total = await prisma.consultation.count({ where })
```

**生成的 SQL:**
```sql
SELECT COUNT(*)
FROM "consultations"
WHERE "consultations"."status" = 'SCHEDULED';
```

**问题:**
- 🟡 在大表上 `COUNT(*)` 不便宜
- 🟡 如果 UI 不需要精确 total，可以用 `hasMore` 模式

---

### 2.4 Query 3: 二次查询 Case 信息

**代码位置:** 第 46-52 行

**Prisma 代码:**
```typescript
const caseIds = [...new Set(consultations.map((c) => c.caseId))]

const cases = await prisma.case.findMany({
  where: { id: { in: caseIds } },
  include: { patient: true },   // 🔴 又拆成 2 个 SQL
})
```

**Prisma 拆分为 2 个 SQL:**

```sql
-- SQL 3a
SELECT * FROM "cases" WHERE "cases"."id" IN ('uuid-1', 'uuid-2', ...);

-- SQL 3b (Prisma include 产生)
SELECT * FROM "users" WHERE "users"."id" IN ('patient-uuid-1', ...);
```

**问题:**
- 🔴 二次查询，应该用 include 合并到 Query 1
- 🔴 `include` 不是 JOIN，Prisma 会拆成多个 SQL

---

### 2.5 Query 4-7: 统计查询

**代码位置:** 第 81-93 行

**Prisma 代码:**
```typescript
const [scheduledCount, completedCount, todayCount, needsTranslationCount] = await Promise.all([
  prisma.consultation.count({ where: { status: 'SCHEDULED' } }),
  prisma.consultation.count({ where: { status: 'COMPLETED' } }),
  prisma.consultation.count({ where: { scheduledAt: {...}, status: {...} } }),
  prisma.consultation.count({ where: { aiTranslation: true, status: 'SCHEDULED' } }),
])
```

**生成 4 条 SQL:**
```sql
SELECT COUNT(*) FROM "consultations" WHERE status = 'SCHEDULED';
SELECT COUNT(*) FROM "consultations" WHERE status = 'COMPLETED';
SELECT COUNT(*) FROM "consultations" WHERE scheduled_at >= $1 AND scheduled_at < $2 AND status IN (...);
SELECT COUNT(*) FROM "consultations" WHERE ai_translation = true AND status = 'SCHEDULED';
```

**问题:**
- 🔴 4 次网络往返
- 🔴 4 次表扫描
- 🟡 没有 hospitalId 过滤（安全问题）

---

## 3. 问题汇总

| # | 问题 | 位置 | 严重性 | 影响 |
|---|------|------|--------|------|
| 1 | OFFSET 分页，page 越大越慢 | 第 37-42 行 | 🔴 严重 | 翻页性能 O(offset) |
| 2 | SELECT * 拉取所有字段（包括大字段） | 第 37-42 行 | 🔴 严重 | IO/网络/反序列化 |
| 3 | 无复合索引，ORDER BY 可能排序 | 数据库 | 🔴 严重 | 查询走全表扫描 |
| 4 | 二次查询 Case 信息 | 第 47-52 行 | 🔴 严重 | +2 次查询 |
| 5 | Prisma include 拆成多个 SQL | 第 47-52 行 | 🟡 中等 | 不是真 JOIN |
| 6 | 4 个独立统计查询 | 第 81-93 行 | 🔴 严重 | +3 次查询 |
| 7 | COUNT(*) 在大表上不便宜 | 第 43 行 | 🟡 中等 | 可用 hasMore 替代 |
| 8 | 缺少 hospitalId 过滤 | 第 22-34 行 | 🔴 安全 | 数据泄露 |
| 9 | 表太"胖"（视频/JSONB 大字段） | 表设计 | 🟡 架构 | 长期优化 |

---

## 4. 优化方案

### 4.1 🔴 P0: Cursor 分页替代 Offset 分页

**问题:**
```typescript
// ❌ OFFSET 分页：page=100 时需要先扫描 1980 行
skip: (page - 1) * limit  // OFFSET 1980
```

**优化:**
```typescript
// ✅ Cursor 分页：复杂度恒定 O(limit)
// 用 (scheduled_at, id) 做稳定游标

interface CursorParams {
  cursorScheduledAt?: string  // ISO 时间
  cursorId?: string           // UUID
  limit?: number
}

const consultations = await prisma.consultation.findMany({
  where: {
    hospitalId,
    ...(status && { status }),
    // Cursor 条件
    ...(cursorScheduledAt && cursorId && {
      OR: [
        { scheduledAt: { lt: new Date(cursorScheduledAt) } },
        {
          scheduledAt: new Date(cursorScheduledAt),
          id: { lt: cursorId },
        },
      ],
    }),
  },
  orderBy: [
    { scheduledAt: 'desc' },
    { id: 'desc' },  // tie-breaker 保证稳定排序
  ],
  take: limit + 1,  // 多取一条判断 hasMore
})

const hasMore = consultations.length > limit
if (hasMore) consultations.pop()

// 返回下一页 cursor
const nextCursor = hasMore ? {
  cursorScheduledAt: consultations[consultations.length - 1].scheduledAt.toISOString(),
  cursorId: consultations[consultations.length - 1].id,
} : null
```

**效果:** 翻页性能恒定，不随 page 增大而变慢

---

### 4.2 🔴 P0: 用 select 替代 include（精确字段）

**问题:**
```typescript
// ❌ 拉取所有字段，包括 video_*, ai_summary 大字段
const consultations = await prisma.consultation.findMany({ where, ... })
```

**优化:**
```typescript
// ✅ 只 select 列表页需要的字段
const consultations = await prisma.consultation.findMany({
  where,
  select: {
    // consultation 只要这些字段
    id: true,
    status: true,
    scheduledAt: true,
    durationMinutes: true,
    aiTranslation: true,
    aiSummaryStatus: true,
    consultationLink: true,
    patientLanguage: true,
    notes: true,  // 如果列表不展示，也可以去掉
    // 关联 case（不是 include，是 select）
    cases: {
      select: {
        caseNumber: true,
        patientName: true,
        patient: {
          select: {
            patientCode: true,
          },
        },
      },
    },
  },
  orderBy: [
    { scheduledAt: 'desc' },
    { id: 'desc' },
  ],
  take: limit + 1,
})
```

**效果:**
- 减少 IO（不读大字段）
- 减少网络传输
- Prisma 反序列化更快
- `select` 比 `include` 更容易生成 JOIN

---

### 4.3 🔴 P0: 添加复合索引

**问题:**
```sql
-- 当前只有单列索引
CREATE INDEX idx_consultations_hospital_id ON consultations(hospital_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);

-- 但典型查询是：
WHERE hospital_id = ? AND status = ? ORDER BY scheduled_at DESC
-- PostgreSQL 不能高效合并多个单列索引
```

**优化 - 必加索引:**
```sql
-- 覆盖 "过滤 + 排序" 的复合索引
CREATE INDEX IF NOT EXISTS idx_consultations_hospital_status_scheduled
ON consultations(hospital_id, status, scheduled_at DESC, id DESC);
```

**优化 - 可选索引（查全部状态时）:**
```sql
-- 如果 status 不是必填参数
CREATE INDEX IF NOT EXISTS idx_consultations_hospital_scheduled
ON consultations(hospital_id, scheduled_at DESC, id DESC);
```

**效果:** 查询走索引，避免排序和全表扫描

---

### 4.4 🔴 P1: 合并统计查询为 1 条 SQL

**问题:**
```typescript
// ❌ 4 个独立查询
const [a, b, c, d] = await Promise.all([
  prisma.consultation.count({ where: { status: 'SCHEDULED' } }),
  prisma.consultation.count({ where: { status: 'COMPLETED' } }),
  prisma.consultation.count({ where: { scheduledAt... } }),
  prisma.consultation.count({ where: { aiTranslation... } }),
])
```

**优化:**
```typescript
// ✅ 1 条 SQL 完成所有统计
const stats = await prisma.$queryRaw<[{
  scheduled: bigint
  completed: bigint
  today: bigint
  needs_translation: bigint
}]>`
  SELECT
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
    COUNT(*) FILTER (WHERE scheduled_at >= ${today}::timestamp
                     AND scheduled_at < ${tomorrow}::timestamp
                     AND status IN ('SCHEDULED', 'IN_PROGRESS')) as today,
    COUNT(*) FILTER (WHERE ai_translation = true
                     AND status = 'SCHEDULED') as needs_translation
  FROM consultations
  WHERE hospital_id = ${hospitalId}::uuid   -- 🔒 安全：按医院过滤
`

const { scheduled, completed, today, needs_translation } = stats[0]
```

**效果:** 4 次查询 → 1 次查询

---

### 4.5 🟡 P1: hasMore 替代精确 count

**问题:**
```typescript
// ❌ 每次都要 COUNT(*)，在大表上不便宜
const total = await prisma.consultation.count({ where })
```

**优化:**
```typescript
// ✅ 取 limit + 1 条，判断有没有下一页
const consultations = await prisma.consultation.findMany({
  where,
  take: limit + 1,  // 多取一条
})

const hasMore = consultations.length > limit
if (hasMore) consultations.pop()  // 移除多取的那条

// 返回
return {
  items: consultations,
  hasMore,              // true/false
  nextCursor: hasMore ? { ... } : null,
  // 不再返回 total
}
```

**如果 UI 必须显示 total:**
```typescript
// 对 (hospitalId, status) 这种 key 做缓存
const cacheKey = `consultation_count:${hospitalId}:${status || 'all'}`
let total = await redis.get(cacheKey)
if (!total) {
  total = await prisma.consultation.count({ where })
  await redis.setex(cacheKey, 60, total)  // 缓存 60 秒
}
```

---

### 4.6 🟡 P2: Partial Index（特定条件加速）

**对于"需要翻译"统计:**
```sql
-- Query 7 的条件是：ai_translation = true AND status = 'SCHEDULED'
-- 这是一个低选择性条件，可以用 Partial Index

CREATE INDEX IF NOT EXISTS idx_consultations_translation_scheduled
ON consultations(hospital_id)
WHERE ai_translation = true AND status = 'SCHEDULED';
```

**对于"今日问诊"统计:**
```sql
-- 这个需要按 hospital_id + scheduled_at range + status 查
CREATE INDEX IF NOT EXISTS idx_consultations_hospital_scheduled_status
ON consultations(hospital_id, scheduled_at, status);
```

---

### 4.7 🟡 P3: 大字段拆表

**当前问题:** consultations 表太"胖"

```sql
-- 当前表有这些大字段：
video_storage_key, video_size, video_duration, video_thumbnail, video_uploaded_at
ai_summary (JSONB), ai_summary_status, ai_summary_created_at
notes (TEXT)
```

**优化:** 拆成 3 个表

```sql
-- 1. 主表（轻量，列表页用）
CREATE TABLE consultations (
  id, case_id, hospital_id, patient_id, doctor_id,
  status, scheduled_at, started_at, ended_at, duration_minutes,
  consultation_link, ai_translation, patient_language,
  created_at, updated_at
);

-- 2. 视频资产表
CREATE TABLE consultation_assets (
  consultation_id UUID PRIMARY KEY REFERENCES consultations(id),
  video_storage_key VARCHAR(500),
  video_size BIGINT,
  video_duration INT,
  video_thumbnail VARCHAR(500),
  video_uploaded_at TIMESTAMP
);

-- 3. AI 总结表
CREATE TABLE consultation_summaries (
  consultation_id UUID PRIMARY KEY REFERENCES consultations(id),
  ai_summary JSONB,
  ai_summary_status ai_summary_status DEFAULT 'PENDING',
  ai_summary_created_at TIMESTAMP,
  notes TEXT
);
```

**效果:** 主表永远轻，列表查询永远快

---

## 5. 优化后的完整代码

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ConsultationStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const cursorScheduledAt = searchParams.get('cursorScheduledAt')
    const cursorId = searchParams.get('cursorId')

    // ✅ 获取当前用户的 hospitalId
    const user = await getCurrentUser(req)
    const hospitalId = user?.hospitalId

    if (!hospitalId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No hospital access' } },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 构建查询条件
    const where: Prisma.ConsultationWhereInput = {
      hospitalId,
      ...(status && { status: status.toUpperCase() as ConsultationStatus }),
      // ✅ Cursor 分页条件
      ...(cursorScheduledAt && cursorId && {
        OR: [
          { scheduledAt: { lt: new Date(cursorScheduledAt) } },
          {
            scheduledAt: new Date(cursorScheduledAt),
            id: { lt: cursorId },
          },
        ],
      }),
    }

    // ✅ 优化: 2 个并行查询
    const [consultations, stats] = await Promise.all([
      // Query 1: 主查询 + select 精确字段 + Cursor 分页
      prisma.consultation.findMany({
        where,
        select: {
          id: true,
          caseId: true,
          status: true,
          scheduledAt: true,
          durationMinutes: true,
          aiTranslation: true,
          aiSummaryStatus: true,
          consultationLink: true,
          patientLanguage: true,
          notes: true,
          // ✅ 用 select 而不是 include
          cases: {
            select: {
              caseNumber: true,
              patientName: true,
              patient: {
                select: { patientCode: true },
              },
            },
          },
        },
        orderBy: [
          { scheduledAt: 'desc' },
          { id: 'desc' },
        ],
        take: limit + 1,  // ✅ 多取一条判断 hasMore
      }),

      // Query 2: 聚合统计（1 条 SQL）
      prisma.$queryRaw<[{
        scheduled: bigint
        completed: bigint
        today: bigint
        needs_translation: bigint
      }]>`
        SELECT
          COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
          COUNT(*) FILTER (WHERE scheduled_at >= ${today}::timestamp
                           AND scheduled_at < ${tomorrow}::timestamp
                           AND status IN ('SCHEDULED', 'IN_PROGRESS')) as today,
          COUNT(*) FILTER (WHERE ai_translation = true
                           AND status = 'SCHEDULED') as needs_translation
        FROM consultations
        WHERE hospital_id = ${hospitalId}::uuid
      `,
    ])

    // ✅ 判断是否有下一页
    const hasMore = consultations.length > limit
    if (hasMore) consultations.pop()

    // ✅ 计算下一页 cursor
    const nextCursor = hasMore && consultations.length > 0
      ? {
          cursorScheduledAt: consultations[consultations.length - 1].scheduledAt.toISOString(),
          cursorId: consultations[consultations.length - 1].id,
        }
      : null

    // 格式化返回数据
    const items = consultations.map((c) => ({
      id: c.id,
      caseId: c.caseId,
      caseNumber: c.cases?.caseNumber || '',
      patientName: c.cases?.patientName || '',
      patientCode: c.cases?.patient?.patientCode || '',
      patientLanguage: c.patientLanguage,
      scheduledAt: c.scheduledAt.toISOString(),
      duration: c.durationMinutes,
      status: c.status.toLowerCase(),
      consultationLink: c.consultationLink || '',
      aiTranslation: c.aiTranslation,
      notes: c.notes || '',
      aiSummaryStatus: c.aiSummaryStatus.toLowerCase(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        items,
        hasMore,           // ✅ 替代 total
        nextCursor,        // ✅ Cursor 分页
        stats: {
          scheduled: Number(stats[0].scheduled),
          completed: Number(stats[0].completed),
          today: Number(stats[0].today),
          needsTranslation: Number(stats[0].needs_translation),
        },
      },
    })
  } catch (error) {
    console.error('❌ 获取问诊列表失败:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch consultations' } },
      { status: 500 }
    )
  }
}
```

---

## 6. 必加索引 SQL

```sql
-- ✅ P0: 覆盖 "过滤 + 排序" 的复合索引（必加）
CREATE INDEX IF NOT EXISTS idx_consultations_hospital_status_scheduled
ON consultations(hospital_id, status, scheduled_at DESC, id DESC);

-- ✅ P0: 查全部状态时用的索引（必加）
CREATE INDEX IF NOT EXISTS idx_consultations_hospital_scheduled
ON consultations(hospital_id, scheduled_at DESC, id DESC);

-- 🟡 P2: "需要翻译" Partial Index（可选）
CREATE INDEX IF NOT EXISTS idx_consultations_translation_scheduled
ON consultations(hospital_id)
WHERE ai_translation = true AND status = 'SCHEDULED';

-- 🟡 P2: "今日问诊" 复合索引（可选）
CREATE INDEX IF NOT EXISTS idx_consultations_hospital_scheduled_status
ON consultations(hospital_id, scheduled_at, status);
```

---

## 7. 优化效果对比

| 指标 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 数据库查询次数 | 8 次 | 2 次 | **-75%** |
| 翻页性能 | O(offset + limit) | O(limit) | **恒定** |
| 数据传输量 | 全字段（含大字段） | 精确字段 | **-60%+** |
| 索引命中 | 可能全表扫描 | 复合索引 | **Index Scan** |
| 安全性 | ❌ 无过滤 | ✅ hospitalId | **提升** |

---

## 8. 实施清单

### P0 - 立即做
- [ ] Cursor 分页替代 Offset 分页
- [ ] 用 `select` 替代 `include`（精确字段）
- [ ] 添加复合索引 `(hospital_id, status, scheduled_at DESC, id DESC)`
- [ ] 添加 hospitalId 过滤

### P1 - 本周
- [ ] 合并 4 个统计查询为 1 条 SQL
- [ ] hasMore 替代精确 count（或 count 缓存）

### P2 - 下周
- [ ] Partial Index（需要翻译）
- [ ] 今日问诊复合索引
- [ ] 用 EXPLAIN ANALYZE 验证索引命中

### P3 - 长期
- [ ] 大字段拆表（consultation_assets, consultation_summaries）
