# Hospital 表扩展设计方案

## 一、现有表结构分析

当前 `china-medical-journeys` 项目中的 hospital 表结构：

### hospitals 主表（已有字段）
- `id`, `slug`, `city`, `district`, `province`, `address`
- `established_year`, `bed_count`, `annual_outpatient_visits`, `staff_count`
- `official_website`, `wiki_link`, `data_source`, `credibility`

### hospital_i18n 国际化表（已有字段）
- `name`, `display_name`, `hospital_type`, `tier`, `ownership_type`
- `short_description`, `full_description`
- `departments_info` (JSONB), `facilities_info` (JSONB)
- SEO 字段

---

## 二、需要新增的表和字段

根据页面需求，我将表设计分为以下几个部分：

### 1. 扩展 hospitals 主表

```sql
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS
  -- Hero 首屏相关
  hero_image_url TEXT,                    -- 医院主图/门面图
  hero_gallery JSONB,                      -- 图片画廊 [{url, alt, type: 'facade'|'interior'|'department'}]

  -- 快速信息卡相关
  annual_international_patients INTEGER,   -- 年国际患者数量
  supported_languages TEXT[],              -- 支持语言 ['zh', 'en', 'ja', 'ko']
  payment_methods TEXT[],                  -- 支付方式 ['cash', 'card', 'insurance', 'alipay', 'wechat']

  -- 位置
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 管理字段
  is_active BOOLEAN DEFAULT true,
  keycloak_user_id TEXT,                   -- 关联的 Keycloak 用户 ID

  -- 审核状态
  status TEXT DEFAULT 'pending',           -- 'pending', 'approved', 'rejected'
  approved_at TIMESTAMPTZ,
  approved_by TEXT;
```

### 2. 扩展 hospital_i18n 表

```sql
ALTER TABLE hospital_i18n ADD COLUMN IF NOT EXISTS
  -- Hero 首屏
  value_proposition TEXT,                  -- 一句话价值主张（国际患者视角）
  core_specialty_tags TEXT[],              -- 核心专科标签 (3-6个)

  -- 医院概览
  why_choose_us JSONB,                     -- 为什么选择这家医院 [{title, description, icon}]
  suitable_for JSONB,                      -- 适合哪些患者 [{patient_type, description}]

  -- 国际患者服务描述
  international_services_desc TEXT,        -- 国际服务总体描述

  -- 价格相关
  pricing_disclaimer TEXT,                 -- 价格免责声明
  pricing_updated_at TIMESTAMPTZ;          -- 价格更新时间
```

### 3. 新增：hospital_specialty_centers 专科中心表

```sql
CREATE TABLE hospital_specialty_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,

  -- 基本信息
  slug TEXT NOT NULL,                      -- 专科中心slug
  sort_order INTEGER DEFAULT 0,            -- 排序顺序
  is_featured BOOLEAN DEFAULT false,       -- 是否为特色专科

  -- 图片
  icon_url TEXT,
  cover_image_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, slug)
);

CREATE TABLE hospital_specialty_centers_i18n (
  specialty_center_id UUID REFERENCES hospital_specialty_centers(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 专科中心名称
  description TEXT,                        -- 描述

  -- 核心能力
  core_capabilities JSONB,                 -- [{name, description}]

  -- 代表技术
  representative_technologies JSONB,       -- [{name, description, success_rate}]

  -- 团队协作方式
  team_collaboration TEXT,                 -- MDT协作描述

  -- 成就/荣誉
  achievements TEXT[],

  PRIMARY KEY (specialty_center_id, locale)
);
```

### 4. 新增：hospital_procedures 可治疗项目表

```sql
CREATE TABLE hospital_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  specialty_center_id UUID REFERENCES hospital_specialty_centers(id) ON DELETE SET NULL,

  -- 基本信息
  slug TEXT NOT NULL,
  category TEXT NOT NULL,                  -- 'diagnosis', 'treatment', 'surgery', 'rehabilitation'

  -- 治疗属性
  duration_days_min INTEGER,               -- 周期最小天数
  duration_days_max INTEGER,               -- 周期最大天数
  recovery_days_min INTEGER,               -- 恢复最小天数
  recovery_days_max INTEGER,               -- 恢复最大天数
  requires_hospitalization BOOLEAN,        -- 是否需要住院
  hospitalization_days_min INTEGER,
  hospitalization_days_max INTEGER,

  -- 价格
  price_min DECIMAL(10,2),                 -- 最低价格
  price_max DECIMAL(10,2),                 -- 最高价格
  price_currency TEXT DEFAULT 'CNY',
  price_includes JSONB,                    -- 价格包含项 [{item, included: true/false}]

  -- 状态
  is_popular BOOLEAN DEFAULT false,        -- 是否热门
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, slug)
);

CREATE TABLE hospital_procedures_i18n (
  procedure_id UUID REFERENCES hospital_procedures(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 项目名称
  description TEXT,                        -- 项目说明
  suitable_for TEXT,                       -- 适应人群
  contraindications TEXT,                  -- 禁忌症
  preparation_steps TEXT[],                -- 准备步骤
  aftercare_instructions TEXT[],           -- 术后护理说明

  PRIMARY KEY (procedure_id, locale)
);
```

### 5. 新增：hospital_doctors 医生团队表

```sql
CREATE TABLE hospital_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  specialty_center_id UUID REFERENCES hospital_specialty_centers(id) ON DELETE SET NULL,

  -- 基本信息
  slug TEXT NOT NULL,
  avatar_url TEXT,

  -- 职业信息
  years_of_experience INTEGER,
  consultation_fee_min DECIMAL(10,2),
  consultation_fee_max DECIMAL(10,2),
  consultation_fee_currency TEXT DEFAULT 'CNY',

  -- 可预约状态
  is_accepting_patients BOOLEAN DEFAULT true,
  accepts_international_patients BOOLEAN DEFAULT false,
  supported_languages TEXT[],              -- 医生支持的语言

  -- 排序和状态
  is_featured BOOLEAN DEFAULT false,       -- 是否为重点推荐医生
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, slug)
);

CREATE TABLE hospital_doctors_i18n (
  doctor_id UUID REFERENCES hospital_doctors(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 医生姓名
  title TEXT,                              -- 职称，如 "主任医师"
  position TEXT,                           -- 职位，如 "科室主任"

  -- 专业领域
  specialties TEXT[],                      -- 专业领域
  expertise TEXT[],                        -- 擅长领域

  -- 简介
  short_bio TEXT,                          -- 简短介绍
  full_bio TEXT,                           -- 完整介绍

  -- 教育背景
  education JSONB,                         -- [{degree, institution, year}]

  -- 荣誉和成就
  achievements TEXT[],
  publications TEXT[],                     -- 发表论文/著作

  PRIMARY KEY (doctor_id, locale)
);
```

### 6. 新增：hospital_packages 套餐表

```sql
CREATE TABLE hospital_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES hospital_procedures(id) ON DELETE SET NULL,

  -- 基本信息
  slug TEXT NOT NULL,
  package_type TEXT NOT NULL,              -- 'basic', 'standard', 'premium', 'vip'

  -- 价格
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),            -- 原价（用于显示折扣）
  price_currency TEXT DEFAULT 'CNY',

  -- 有效期
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,

  -- 状态
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, slug)
);

CREATE TABLE hospital_packages_i18n (
  package_id UUID REFERENCES hospital_packages(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 套餐名称
  description TEXT,                        -- 套餐描述

  -- 包含/不包含项
  included_items JSONB,                    -- [{item, description}]
  excluded_items JSONB,                    -- [{item, description}]

  -- 附加说明
  notes TEXT[],

  PRIMARY KEY (package_id, locale)
);
```

### 7. 新增：hospital_international_services 国际患者服务表

```sql
CREATE TABLE hospital_international_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,

  -- 服务类型
  service_type TEXT NOT NULL,              -- 见下方枚举

  -- 价格（如适用）
  is_free BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  price_currency TEXT DEFAULT 'CNY',

  -- 状态
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, service_type)
);

-- service_type 枚举值：
-- 'medical_record_translation'    -- 病历翻译
-- 'appointment_coordination'      -- 预约协调
-- 'airport_pickup'               -- 接机服务
-- 'accommodation'                -- 住宿安排
-- 'visa_support'                 -- 签证支持
-- 'interpreter'                  -- 陪诊/翻译
-- 'post_treatment_followup'      -- 术后随访
-- 'insurance_assistance'         -- 保险协助
-- 'payment_processing'           -- 支付处理
-- 'telemedicine'                 -- 远程问诊

CREATE TABLE hospital_international_services_i18n (
  service_id UUID REFERENCES hospital_international_services(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 服务名称
  description TEXT,                        -- 服务描述
  details TEXT,                            -- 详细说明

  PRIMARY KEY (service_id, locale)
);
```

### 8. 新增：hospital_equipment 设备清单表

```sql
CREATE TABLE hospital_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  specialty_center_id UUID REFERENCES hospital_specialty_centers(id) ON DELETE SET NULL,

  -- 分类
  category TEXT NOT NULL,                  -- 'imaging', 'surgical', 'diagnostic', 'therapeutic', 'icu', 'lab'

  -- 设备信息
  manufacturer TEXT,
  model TEXT,
  year_acquired INTEGER,

  -- 状态
  status TEXT DEFAULT 'available',         -- 'available', 'maintenance', 'unavailable'
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE hospital_equipment_i18n (
  equipment_id UUID REFERENCES hospital_equipment(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 设备名称
  description TEXT,                        -- 描述
  patient_value TEXT,                      -- 对患者的价值说明

  -- 能力说明
  capabilities TEXT[],

  PRIMARY KEY (equipment_id, locale)
);
```

### 9. 新增：hospital_clinical_capabilities 临床能力表

```sql
CREATE TABLE hospital_clinical_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,

  -- 能力类型
  capability_type TEXT NOT NULL,           -- 'icu', 'emergency', 'mdt', 'imaging', 'lab', 'complex_case'

  -- 级别/等级
  level TEXT,                              -- 'basic', 'advanced', 'specialized'

  -- 状态
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, capability_type)
);

CREATE TABLE hospital_clinical_capabilities_i18n (
  capability_id UUID REFERENCES hospital_clinical_capabilities(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,

  name TEXT NOT NULL,                      -- 能力名称
  description TEXT,                        -- 描述
  details TEXT,                            -- 详细说明

  -- 特色/亮点
  highlights TEXT[],

  PRIMARY KEY (capability_id, locale)
);
```

---

## 三、实现方案

### 阶段一：数据库迁移 (1)

1. **创建迁移文件**
   - 在 `china-medical-journeys` 项目中创建 SQL 迁移脚本
   - 路径: `database/migrations/YYYYMMDD_extend_hospital_tables.sql`

2. **执行迁移**
   - 在 Supabase 中执行迁移
   - 更新 TypeScript 类型定义

### 阶段二：Keycloak 集成 (2)

1. **在 medical-crm 创建医院时**：
   ```typescript
   // 创建 Keycloak 用户
   const keycloakUser = await keycloakAdmin.createUser({
     username: hospitalSlug,
     email: adminEmail,
     enabled: true,
     credentials: [{ type: 'password', value: tempPassword, temporary: true }]
   });

   // 分配 regular_hospital role
   await keycloakAdmin.assignRole(keycloakUser.id, 'regular_hospital');
   ```

2. **在 china-medical-journeys 插入医院数据**：
   ```typescript
   // API 调用插入医院
   const hospital = await hospitalApi.createHospital({
     ...hospitalData,
     keycloak_user_id: keycloakUser.id,
     status: 'pending' // 需要审核
   });
   ```

### 阶段三：API 开发 (3)

需要在 `china-medical-journeys` 中开发以下 API：

| API | 方法 | 描述 |
|-----|------|------|
| `/api/hospitals` | POST | 创建医院 |
| `/api/hospitals/:id` | PUT | 更新医院信息 |
| `/api/hospitals/:id/specialty-centers` | CRUD | 专科中心管理 |
| `/api/hospitals/:id/procedures` | CRUD | 可治疗项目管理 |
| `/api/hospitals/:id/doctors` | CRUD | 医生团队管理 |
| `/api/hospitals/:id/packages` | CRUD | 套餐管理 |
| `/api/hospitals/:id/international-services` | CRUD | 国际服务管理 |
| `/api/hospitals/:id/equipment` | CRUD | 设备管理 |
| `/api/hospitals/:id/clinical-capabilities` | CRUD | 临床能力管理 |

### 阶段四：前端页面开发 (4)

1. **医院后台管理页面** (医院用户登录后)
   - 基本信息编辑
   - 专科中心管理
   - 医生团队管理
   - 项目/套餐管理
   - 国际服务配置

2. **医院公开展示页面** (面向患者)
   - Hero 首屏
   - 快速信息卡
   - 医院概览
   - 专科中心列表
   - 可治疗项目
   - 医生团队
   - 价格参考
   - 国际服务
   - 设施设备

---

## 四、数据流程图

```
┌─────────────────┐
│  medical-crm    │
│  (管理后台)      │
└────────┬────────┘
         │ 1. 创建医院
         ▼
┌─────────────────┐
│   Keycloak      │
│ (用户认证服务)   │
│ role: regular_  │
│ hospital        │
└────────┬────────┘
         │ 2. 返回 user_id
         ▼
┌─────────────────┐
│ china-medical-  │
│ journeys API    │
│ (插入医院数据)   │
└────────┬────────┘
         │ 3. 存储到 Supabase
         ▼
┌─────────────────┐
│   Supabase      │
│  PostgreSQL     │
│  (hospitals +   │
│   related       │
│   tables)       │
└────────┬────────┘
         │ 4. 医院用户登录
         ▼
┌─────────────────┐
│ china-medical-  │
│ journeys 前端   │
│ (医院管理后台)   │
└─────────────────┘
```

---

## 五、ER 图（简化版）

```
hospitals (1) ───< hospital_i18n (n)
    │
    ├───< hospital_specialty_centers (n) ───< hospital_specialty_centers_i18n (n)
    │         │
    │         └───< hospital_procedures (n) ───< hospital_procedures_i18n (n)
    │         │
    │         └───< hospital_doctors (n) ───< hospital_doctors_i18n (n)
    │         │
    │         └───< hospital_equipment (n) ───< hospital_equipment_i18n (n)
    │
    ├───< hospital_packages (n) ───< hospital_packages_i18n (n)
    │
    ├───< hospital_international_services (n) ───< hospital_international_services_i18n (n)
    │
    └───< hospital_clinical_capabilities (n) ───< hospital_clinical_capabilities_i18n (n)
```

---

## 六、优先级建议

| 优先级 | 模块 | 说明 |
|--------|------|------|
| P0 | hospitals 表扩展 + Keycloak 集成 | 基础架构 |
| P0 | hospital_specialty_centers | 核心展示内容 |
| P0 | hospital_procedures | 患者最关心的信息 |
| P1 | hospital_doctors | 重要转化因素 |
| P1 | hospital_packages | 价格透明度 |
| P1 | hospital_international_services | 国际患者核心需求 |
| P2 | hospital_equipment | 增强信任度 |
| P2 | hospital_clinical_capabilities | 专业性展示 |

---

## 七、下一步行动

1. **确认方案** - 请确认这个表设计是否符合需求
2. **创建迁移脚本** - 生成 SQL 迁移文件
3. **更新 TypeScript 类型** - 同步类型定义
4. **开发 Keycloak 集成** - 在 medical-crm 中实现创建用户逻辑
5. **开发 API** - 在 china-medical-journeys 中开发 CRUD API
6. **开发前端** - 医院后台管理页面和公开展示页面
