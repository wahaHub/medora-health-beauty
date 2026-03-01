# Hospital 表设计方案 V3（最终版）

基于 medorabeauty.com 现有的 CRM 选项定义，使用 **选项数组** 而非布尔值。

---

## 一、选项枚举定义（参考 CRM）

### LANGUAGE_OPTIONS（支持语言）
```
'en'  - English
'zh'  - Chinese
'kr'  - Korean
'jp'  - Japanese
'ar'  - Arabic
'th'  - Thai
'es'  - Spanish
'ru'  - Russian
'fr'  - French
'de'  - German
```

### AIRPORT_SERVICE_OPTIONS（机场服务）
```
'complimentary_transfer' - Complimentary Airport Transfer（免费机场接送）
'paid_transfer'          - Paid Airport Pickup（付费机场接送）
'airport_assistance'     - Airport Assistance（机场协助服务）
'visa_on_arrival'        - Visa on Arrival Assistance（落地签协助）
```

### FOLLOWUP_OPTIONS（随访服务）
```
'lifetime'       - Lifetime Follow-up Care（终身随访）
'1_year'         - 1 Year Follow-up（1年随访）
'6_months'       - 6 Months Follow-up（6个月随访）
'telemedicine'   - Remote Telemedicine（远程医疗）
'local_partner'  - Local Partner Clinic Referral（当地合作诊所转介）
```

### AMENITY_OPTIONS（便利设施）
```
'private_suite'        - Private Recovery Suites（私人康复套房）
'wifi'                 - Free Wi-Fi（免费WiFi）
'concierge'            - Medical Tourism Concierge（医疗旅游管家）
'insurance_coord'      - International Insurance Coordination（国际保险协调）
'visa_assistance'      - Visa Assistance（签证协助）
'interpreter'          - Interpreter Services（翻译服务）
'halal_food'           - Halal Food Available（清真餐食）
'vegetarian'           - Vegetarian Options（素食选项）
'family_accommodation' - Family Accommodation（家属住宿）
'pharmacy'             - 24/7 Pharmacy（24小时药房）
```

### PAYMENT_METHOD_OPTIONS（支付方式）
```
'cash'                  - Cash（现金）
'credit_card'           - Credit Card（信用卡）
'debit_card'            - Debit Card（借记卡）
'wechat_pay'            - WeChat Pay（微信支付）
'alipay'                - Alipay（支付宝）
'bank_transfer'         - Bank Transfer（银行转账）
'international_transfer'- International Wire Transfer（国际电汇）
'paypal'                - PayPal
'apple_pay'             - Apple Pay
'google_pay'            - Google Pay
'unionpay'              - UnionPay（银联）
'insurance_direct'      - Insurance Direct Billing（保险直付）
```

---

## 二、hospitals 主表

```sql
-- ============================================
-- hospitals 表结构
-- ============================================

CREATE TABLE hospitals (
  -- ========== 主键 ==========
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  -- ========== 位置 ==========
  city TEXT NOT NULL,
  district TEXT,
  province TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- ========== 基本信息 ==========
  established_year INTEGER,                 -- 成立年份
  bed_count INTEGER,                        -- 床位数
  patients_served_annually INTEGER,         -- 年服务患者数
  international_patients_annually INTEGER,  -- 年国际患者数
  staff_count INTEGER,                      -- 员工数

  -- ========== 图片 ==========
  hero_image_url TEXT,                      -- 主图/门面图
  gallery JSONB,                            -- 图片画廊
  -- 结构: [{ "url": "xxx", "alt": "xxx", "type": "facade|interior|department|equipment|room" }]

  -- ========== Facility Features（选项数组） ==========
  supported_languages TEXT[],               -- 支持语言（多选）
  airport_services TEXT[],                  -- 机场服务（多选）
  followup_care TEXT[],                     -- 随访服务（多选）
  amenities TEXT[],                         -- 便利设施（多选）
  payment_methods TEXT[],                   -- 支付方式（多选）

  -- ========== 临床能力（选项数组） ==========
  clinical_capabilities TEXT[],             -- 临床能力（多选）
  -- 可选值: 'icu', 'emergency', 'mdt', 'imaging_center', 'lab', 'complex_case'

  -- ========== 设备 ==========
  equipment JSONB,                          -- 主要设备列表
  -- 结构: [{ "name": "达芬奇机器人", "image_url": "https://xxx/davinci.jpg", "description": "微创手术更精准" }]

  -- ========== 资质认证 ==========
  certifications JSONB,                     -- 认证证书
  -- 结构: [{ "name": "JCI", "nameEn": "JCI", "year": 2020, "isActive": true }]

  -- ========== 管理字段 ==========
  is_active BOOLEAN DEFAULT true,
  keycloak_user_id TEXT,                    -- 关联 Keycloak 用户
  admin_email TEXT,                         -- 医院管理员邮箱
  status TEXT DEFAULT 'pending',            -- 'pending', 'approved', 'rejected'

  -- ========== 时间戳 ==========
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 三、hospital_i18n 国际化表

```sql
-- ============================================
-- hospital_i18n 表结构
-- ============================================

CREATE TABLE hospital_i18n (
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,                     -- 'zh', 'en', 'ja', 'ko' 等

  -- ========== 基本信息 ==========
  name TEXT NOT NULL,                       -- 医院名称
  display_name TEXT,                        -- 显示名称
  hospital_type TEXT,                       -- 医院类型（综合医院、专科医院等）
  tier TEXT,                                -- 等级（三甲、三乙等）
  ownership_type TEXT,                      -- 所有制（公立、私立等）

  -- ========== Hero 区域 ==========
  value_proposition TEXT,                   -- 一句话价值主张
  -- 示例: "华东地区领先的肿瘤治疗中心，为国际患者提供一站式医疗服务"

  -- ========== 概览 ==========
  overview TEXT,                            -- 医院概览（支持 Markdown）
  short_description TEXT,                   -- 简短描述
  full_description TEXT,                    -- 完整描述

  -- ========== 核心专科（3-6个） ==========
  core_specialties JSONB,                   -- 核心专科
  -- 结构: [
  --   {
  --     "name": "肿瘤科",
  --     "slug": "oncology",
  --     "image_url": "https://xxx/oncology.jpg",
  --     "description": "华东地区肿瘤诊疗领军科室",
  --     "technologies": ["TOMO", "质子治疗", "CAR-T"]
  --   }
  -- ]

  -- ========== 临床能力说明 ==========
  clinical_capabilities_description JSONB,  -- 临床能力详细描述
  -- 结构: {
  --   "icu": "配备 30 张 ICU 床位，24小时监护，支持 ECMO",
  --   "emergency": "24小时急诊，绿色通道",
  --   "mdt": "每周三次 MDT 会诊",
  --   "imaging_center": "拥有 3T MRI、256 排 CT、PET-CT",
  --   "lab": "全自动化实验室，2小时出报告",
  --   "complex_case": "年处理疑难复杂病例超过 500 例"
  -- }

  -- ========== SEO ==========
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,

  PRIMARY KEY (hospital_id, locale)
);
```

---

## 四、完整字段汇总

### hospitals 表

| 分类 | 字段 | 类型 | 说明 |
|------|------|------|------|
| **主键** | id | UUID | 主键 |
| **主键** | slug | TEXT | URL标识 |
| **位置** | city, district, province, address | TEXT | 地址 |
| **位置** | latitude, longitude | DECIMAL | 经纬度 |
| **基本** | established_year | INTEGER | 成立年份 |
| **基本** | bed_count | INTEGER | 床位数 |
| **基本** | patients_served_annually | INTEGER | 年服务患者数 |
| **基本** | international_patients_annually | INTEGER | 年国际患者数 |
| **图片** | hero_image_url | TEXT | 主图 |
| **图片** | gallery | JSONB | 图片画廊 |
| **服务** | supported_languages | TEXT[] | 支持语言 |
| **服务** | airport_services | TEXT[] | 机场服务 |
| **服务** | followup_care | TEXT[] | 随访服务 |
| **服务** | amenities | TEXT[] | 便利设施 |
| **服务** | payment_methods | TEXT[] | 支付方式 |
| **能力** | clinical_capabilities | TEXT[] | 临床能力 |
| **设备** | equipment | JSONB | 设备列表（含图片） |
| **资质** | certifications | JSONB | 认证证书 |
| **管理** | is_active | BOOLEAN | 是否启用 |
| **管理** | keycloak_user_id | TEXT | Keycloak用户ID |
| **管理** | admin_email | TEXT | 管理员邮箱 |
| **管理** | status | TEXT | 审核状态 |

### hospital_i18n 表

| 分类 | 字段 | 类型 | 说明 |
|------|------|------|------|
| **主键** | hospital_id | UUID | 外键 |
| **主键** | locale | TEXT | 语言代码 |
| **基本** | name, display_name | TEXT | 医院名称 |
| **基本** | hospital_type, tier, ownership_type | TEXT | 类型/等级 |
| **Hero** | value_proposition | TEXT | 价值主张 |
| **概览** | overview, short_description, full_description | TEXT | 描述 |
| **专科** | core_specialties | JSONB | 核心专科（含图片） |
| **能力** | clinical_capabilities_description | JSONB | 临床能力说明 |
| **SEO** | seo_title, seo_description, seo_keywords | TEXT | SEO字段 |

---

## 五、页面字段映射

| 页面区域 | 字段来源 |
|----------|----------|
| **Hero** | |
| - 医院名称 | `hospital_i18n.name` |
| - 所在地 | `hospitals.city` + `hospitals.address` |
| - 医院类型 | `hospital_i18n.hospital_type` / `tier` |
| - 成立年份 | `hospitals.established_year` |
| - 价值主张 | `hospital_i18n.value_proposition` |
| - 主图 | `hospitals.hero_image_url` |
| - 专科标签 | `hospital_i18n.core_specialties[].name` |
| **Facility Features** | |
| - Private Beds | `hospitals.bed_count` |
| - Patients Served | `hospitals.patients_served_annually` |
| - Multilingual Staff | `hospitals.supported_languages` → 显示语言列表 |
| - Airport Services | `hospitals.airport_services` → 显示服务列表 |
| - Follow-up Care | `hospitals.followup_care` → 显示选项列表 |
| - Amenities | `hospitals.amenities` → 显示设施列表 |
| - Payment Methods | `hospitals.payment_methods` → 显示支付方式 |
| **医院概览** | `hospital_i18n.overview` |
| **核心专科** | |
| - 专科列表 | `hospital_i18n.core_specialties` |
| - 专科图片 | `core_specialties[].image_url` |
| - 代表技术 | `core_specialties[].technologies` |
| **设施设备** | |
| - 设备列表 | `hospitals.equipment`（含 name, image_url, description） |
| **临床能力** | |
| - 能力标识 | `hospitals.clinical_capabilities` |
| - 能力描述 | `hospital_i18n.clinical_capabilities_description` |
| **资质认证** | `hospitals.certifications` |

---

## 六、TypeScript 类型定义

```typescript
// types/hospital.ts

// ========== 选项类型 ==========
export type LanguageCode = 'en' | 'zh' | 'kr' | 'jp' | 'ar' | 'th' | 'es' | 'ru' | 'fr' | 'de';

export type AirportService = 'complimentary_transfer' | 'paid_transfer' | 'airport_assistance' | 'visa_on_arrival';

export type FollowupCare = 'lifetime' | '1_year' | '6_months' | 'telemedicine' | 'local_partner';

export type Amenity = 'private_suite' | 'wifi' | 'concierge' | 'insurance_coord' | 'visa_assistance' |
                      'interpreter' | 'halal_food' | 'vegetarian' | 'family_accommodation' | 'pharmacy';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'wechat_pay' | 'alipay' |
                            'bank_transfer' | 'international_transfer' | 'paypal' | 'apple_pay' |
                            'google_pay' | 'unionpay' | 'insurance_direct';

export type ClinicalCapability = 'icu' | 'emergency' | 'mdt' | 'imaging_center' | 'lab' | 'complex_case';

// ========== 主表类型 ==========
export interface Hospital {
  id: string;
  slug: string;

  // 位置
  city: string;
  district?: string;
  province?: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  // 基本信息
  established_year?: number;
  bed_count?: number;
  patients_served_annually?: number;
  international_patients_annually?: number;
  staff_count?: number;

  // 图片
  hero_image_url?: string;
  gallery?: GalleryImage[];

  // 服务选项（数组）
  supported_languages?: LanguageCode[];
  airport_services?: AirportService[];
  followup_care?: FollowupCare[];
  amenities?: Amenity[];
  payment_methods?: PaymentMethod[];

  // 临床能力
  clinical_capabilities?: ClinicalCapability[];

  // 设备
  equipment?: Equipment[];

  // 资质
  certifications?: Certification[];

  // 管理
  is_active?: boolean;
  keycloak_user_id?: string;
  admin_email?: string;
  status?: 'pending' | 'approved' | 'rejected';

  // 时间戳
  created_at: string;
  updated_at: string;
}

// ========== 国际化表类型 ==========
export interface HospitalI18n {
  hospital_id: string;
  locale: string;

  // 基础
  name: string;
  display_name?: string;
  hospital_type?: string;
  tier?: string;
  ownership_type?: string;

  // Hero
  value_proposition?: string;

  // 概览
  overview?: string;
  short_description?: string;
  full_description?: string;

  // 专科
  core_specialties?: CoreSpecialty[];

  // 能力说明
  clinical_capabilities_description?: ClinicalCapabilitiesDescription;

  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

// ========== 子类型 ==========
export interface GalleryImage {
  url: string;
  alt: string;
  type: 'facade' | 'interior' | 'department' | 'equipment' | 'room';
}

export interface Equipment {
  name: string;
  image_url?: string;
  description?: string;
}

export interface Certification {
  name: string;
  nameEn?: string;
  year?: number;
  isActive: boolean;
}

export interface CoreSpecialty {
  name: string;
  slug: string;
  image_url?: string;
  description: string;
  technologies: string[];
}

export interface ClinicalCapabilitiesDescription {
  icu?: string;
  emergency?: string;
  mdt?: string;
  imaging_center?: string;
  lab?: string;
  complex_case?: string;
}
```

---

## 七、与现有 CRM 数据的映射

现有 CRM 的 `crm_metadata` 字段直接对应：

| CRM 字段 | → | 新字段 |
|----------|---|--------|
| `multilingualStaff` | → | `supported_languages` |
| `airportServices` | → | `airport_services` |
| `followUpCare` | → | `followup_care` |
| `amenities` | → | `amenities` |
| `paymentMethods` | → | `payment_methods` |
| `certifications` | → | `certifications` |
| `bedCount` | → | `bed_count` |
| `patientCapacity` | → | `patients_served_annually` |

**兼容性**: 新表结构与现有 medorabeauty.com 的数据结构完全兼容。

---

## 八、下一步

确认此方案后：
1. 生成 SQL 迁移脚本（在 china-medical-journeys 项目中）
2. 更新 TypeScript 类型定义
3. 实现创建医院的 API 流程
