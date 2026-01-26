-- =====================================================
-- Medora Health & Beauty - Complete Database Schema
-- 完整数据库架构 - 包含所有表和关系
-- =====================================================
-- Version: 2.0 (Unified Migration)
-- Date: 2026-01-26
-- =====================================================
--
-- This file consolidates all migrations into a single schema:
-- - supabase_schema.sql (procedures tables)
-- - supabase_cases_schema.sql (procedure_cases table)
-- - supabase_surgeons_schema.sql (surgeons table)
-- - supabase_fix_rls.sql (RLS policies)
-- - scripts/add_surgeons_images_column.sql (images column)
-- - 001_add_surgeon_id_to_cases.sql (surgeon_id FK)
--
-- =====================================================

-- =====================================================
-- 0. Helper Functions
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. Procedures Table (Language-independent base data)
-- 手术类型表（与语言无关的基础数据）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_name VARCHAR(255) NOT NULL UNIQUE,  -- English name
  slug VARCHAR(255) NOT NULL UNIQUE,            -- URL-friendly slug
  category VARCHAR(50) NOT NULL,                -- 'face', 'body', 'non-surgical'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedures_slug ON procedures(slug);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category);

-- =====================================================
-- 2. Procedure Translations Table (Multi-language content)
-- 手术翻译表（多语言内容）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',  -- 'en', 'zh', 'es', etc.
  overview TEXT,
  anesthesia TEXT,
  procedure_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(procedure_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_procedure_translations_procedure ON procedure_translations(procedure_id);
CREATE INDEX IF NOT EXISTS idx_procedure_translations_language ON procedure_translations(language_code);

-- =====================================================
-- 3. Procedure Recovery Information (Multi-language)
-- 手术恢复信息表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  recovery_time VARCHAR(255),
  ready_to_go_out VARCHAR(255),
  resume_exercise VARCHAR(255),
  final_results VARCHAR(255),
  UNIQUE(procedure_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_procedure_recovery_procedure ON procedure_recovery(procedure_id);

-- =====================================================
-- 4. Procedure Benefits (Multi-language, multiple per procedure)
-- 手术优势表（多语言，每个手术可有多条）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  benefit_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedure_benefits_procedure ON procedure_benefits(procedure_id);
CREATE INDEX IF NOT EXISTS idx_procedure_benefits_language ON procedure_benefits(language_code);

-- =====================================================
-- 5. Procedure Candidacy Criteria (Multi-language)
-- 手术适应症标准表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_candidacy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  candidacy_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedure_candidacy_procedure ON procedure_candidacy(procedure_id);

-- =====================================================
-- 6. Procedure Techniques (Multi-language)
-- 手术技术表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  technique_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedure_techniques_procedure ON procedure_techniques(procedure_id);

-- =====================================================
-- 7. Procedure Recovery Timeline (Multi-language)
-- 手术恢复时间线表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_recovery_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  timepoint VARCHAR(255) NOT NULL,
  guidance TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedure_recovery_timeline_procedure ON procedure_recovery_timeline(procedure_id);

-- =====================================================
-- 8. Procedure Recovery Tips (Multi-language)
-- 手术恢复提示表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_recovery_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  tip_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedure_recovery_tips_procedure ON procedure_recovery_tips(procedure_id);

-- =====================================================
-- 9. Complementary Procedures (Multi-language)
-- 配套手术表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS complementary_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  complementary_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complementary_procedures_procedure ON complementary_procedures(procedure_id);

-- =====================================================
-- 10. Procedure Risks and Considerations (Multi-language)
-- 手术风险与注意事项表（多语言）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  risk_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedure_risks_procedure ON procedure_risks(procedure_id);

-- =====================================================
-- 11. Surgeons Table (All surgeon information)
-- 医生表（所有医生信息）
-- =====================================================

CREATE TABLE IF NOT EXISTS surgeons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgeon_id VARCHAR(255) NOT NULL UNIQUE,      -- e.g., "min-zhang" (URL-friendly)
  name VARCHAR(255) NOT NULL,                   -- e.g., "Dr. Min Zhang"
  title VARCHAR(255) NOT NULL,                  -- e.g., "Board-Certified Plastic Surgeon"
  experience_years INTEGER NOT NULL,
  image_url TEXT,                               -- Legacy: URL to surgeon's main photo
  image_prompt TEXT,                            -- AI image generation prompt

  -- Complex fields stored as JSONB
  specialties JSONB DEFAULT '[]'::jsonb,        -- ["Deep Plane Facelift", "Rhinoplasty", ...]
  languages JSONB DEFAULT '[]'::jsonb,          -- ["English", "Mandarin Chinese", ...]
  education JSONB DEFAULT '[]'::jsonb,          -- ["MD - Harvard Medical School", ...]
  certifications JSONB DEFAULT '[]'::jsonb,     -- ["American Board of Plastic Surgery", ...]
  procedures_count JSONB DEFAULT '{}'::jsonb,   -- {"facelifts": 600, "rhinoplasty": 500, ...}
  bio JSONB DEFAULT '{}'::jsonb,                -- {"intro": "...", "expertise": "...", "philosophy": "...", "achievements": [...]}
  images JSONB DEFAULT '{}'::jsonb,             -- {"hero": "url", "office": "url", "certification": "url", ...}
  translations JSONB DEFAULT '{}'::jsonb,       -- Multi-language translations for surgeon data

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for JSONB fields
COMMENT ON COLUMN surgeons.images IS 'JSONB object containing surgeon photos: hero (main profile photo), office, certification (certificates/awards), with_patients';
COMMENT ON COLUMN surgeons.translations IS 'JSONB object containing translations: {lang_code: {title, specialties, languages, education, certifications, bio: {intro, expertise, philosophy, achievements}}}';

-- Indexes for surgeons
CREATE INDEX IF NOT EXISTS idx_surgeons_surgeon_id ON surgeons(surgeon_id);
CREATE INDEX IF NOT EXISTS idx_surgeons_name ON surgeons(name);
CREATE INDEX IF NOT EXISTS idx_surgeons_specialties ON surgeons USING GIN (specialties);

-- =====================================================
-- 12. Procedure Cases Table (Before/After cases)
-- 手术案例表（术前术后对比）
-- =====================================================

CREATE TABLE IF NOT EXISTS procedure_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  case_number VARCHAR(10) NOT NULL,               -- 6-digit unique case number
  description TEXT,                               -- Case description (editable)
  provider_name VARCHAR(255),                     -- Legacy: e.g., "Dr. Heather Lee"
  patient_age VARCHAR(10),                        -- e.g., "35"
  patient_gender VARCHAR(20),                     -- e.g., "Female"
  image_count INTEGER DEFAULT 2,                  -- Number of images for this case
  sort_order INTEGER DEFAULT 0,                   -- For ordering cases

  -- Foreign key to surgeons table for bidirectional queries
  -- 外键关联到 surgeons 表，支持双向查询
  surgeon_id UUID REFERENCES surgeons(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(procedure_id, case_number)
);

-- Indexes for procedure_cases
CREATE INDEX IF NOT EXISTS idx_procedure_cases_procedure ON procedure_cases(procedure_id);
CREATE INDEX IF NOT EXISTS idx_procedure_cases_case_number ON procedure_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_procedure_cases_surgeon_id ON procedure_cases(surgeon_id);
CREATE INDEX IF NOT EXISTS idx_procedure_cases_surgeon_procedure ON procedure_cases(surgeon_id, procedure_id);

-- =====================================================
-- Enable Row Level Security (RLS)
-- 启用行级安全策略
-- =====================================================

ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_candidacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_recovery_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_recovery_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE complementary_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_cases ENABLE ROW LEVEL SECURITY;
-- Note: surgeons table does NOT have RLS - it's fully public

-- =====================================================
-- RLS Policies - Procedures Tables (Public Read)
-- RLS 策略 - 手术相关表（公开读取）
-- =====================================================

-- Allow public read access to all procedure-related tables
CREATE POLICY "Allow public read access on procedures"
  ON procedures FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_translations"
  ON procedure_translations FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_recovery"
  ON procedure_recovery FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_benefits"
  ON procedure_benefits FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_candidacy"
  ON procedure_candidacy FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_techniques"
  ON procedure_techniques FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_recovery_timeline"
  ON procedure_recovery_timeline FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_recovery_tips"
  ON procedure_recovery_tips FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on complementary_procedures"
  ON complementary_procedures FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on procedure_risks"
  ON procedure_risks FOR SELECT TO public USING (true);

-- =====================================================
-- RLS Policies - Procedure Cases (Public Read, Auth Write)
-- RLS 策略 - 手术案例表（公开读取，认证写入）
-- =====================================================

-- Allow public read access
CREATE POLICY "Allow public read access on procedure_cases"
  ON procedure_cases FOR SELECT TO public USING (true);

-- Allow anon role (API with anon key) to insert/update/delete
CREATE POLICY "Allow anon insert on procedure_cases"
  ON procedure_cases FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update on procedure_cases"
  ON procedure_cases FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete on procedure_cases"
  ON procedure_cases FOR DELETE TO anon USING (true);

-- Also allow authenticated users
CREATE POLICY "Allow authenticated insert on procedure_cases"
  ON procedure_cases FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on procedure_cases"
  ON procedure_cases FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on procedure_cases"
  ON procedure_cases FOR DELETE TO authenticated USING (true);

-- =====================================================
-- Triggers for updated_at
-- 自动更新 updated_at 的触发器
-- =====================================================

CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_translations_updated_at
  BEFORE UPDATE ON procedure_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surgeons_updated_at
  BEFORE UPDATE ON surgeons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_cases_updated_at
  BEFORE UPDATE ON procedure_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Useful Query Examples
-- 常用查询示例
-- =====================================================

-- Find surgeon for a case (通过 case 找医生):
/*
SELECT
  pc.*,
  s.name as surgeon_name,
  s.surgeon_id,
  s.title,
  s.image_url,
  s.images,
  s.specialties
FROM procedure_cases pc
LEFT JOIN surgeons s ON pc.surgeon_id = s.id
WHERE pc.case_number = '138866';
*/

-- Find all cases for a surgeon (通过医生找所有 cases):
/*
SELECT
  pc.*,
  p.procedure_name,
  p.slug as procedure_slug
FROM procedure_cases pc
JOIN procedures p ON pc.procedure_id = p.id
WHERE pc.surgeon_id = (
  SELECT id FROM surgeons WHERE surgeon_id = 'jun-yang'
)
ORDER BY pc.created_at DESC;
*/

-- Count cases per surgeon (统计每个医生的案例数):
/*
SELECT
  s.surgeon_id,
  s.name,
  COUNT(pc.id) as case_count
FROM surgeons s
LEFT JOIN procedure_cases pc ON s.id = pc.surgeon_id
GROUP BY s.id, s.surgeon_id, s.name
ORDER BY case_count DESC;
*/

-- Get procedure with all translations:
/*
SELECT
  p.*,
  pt.language_code,
  pt.overview,
  pt.procedure_description
FROM procedures p
LEFT JOIN procedure_translations pt ON p.id = pt.procedure_id
WHERE p.slug = 'rhinoplasty';
*/

-- Search surgeons by specialty:
/*
SELECT * FROM surgeons
WHERE specialties @> '["Rhinoplasty"]'::jsonb;
*/

-- =====================================================
-- APPENDIX: Case-Surgeon Mappings (332 cases)
-- 附录：案例-医生映射数据（已执行，仅供参考）
-- =====================================================
-- This data was populated from CASE_ALLOCATION_PLAN.md
-- To re-run, uncomment the following section and execute
--
-- Helper function:
/*
CREATE OR REPLACE FUNCTION get_surgeon_id_by_name(surgeon_name TEXT)
RETURNS UUID AS $$
DECLARE result_id UUID;
BEGIN
  SELECT id INTO result_id FROM surgeons WHERE name = surgeon_name LIMIT 1;
  RETURN result_id;
END;
$$ LANGUAGE plpgsql;
*/
--
-- Case mappings (332 total):
-- Format: UPDATE procedure_cases SET surgeon_id = get_surgeon_id_by_name('Surgeon Name') WHERE case_number = 'XXXXXX';
--
-- See CASE_ALLOCATION_PLAN.md for the complete mapping list.
-- The mapping covers 50 surgeons across all procedure categories:
--   - Face procedures (Brow Lift, Facelift, Rhinoplasty, etc.)
--   - Body procedures (Liposuction, Tummy Tuck, BBL, etc.)
--   - Breast procedures (Augmentation, Lift, Reduction, etc.)
--   - Non-surgical (BOTOX, Fillers, Laser treatments, etc.)
--
-- After populating surgeon_id, also sync provider_name:
/*
UPDATE procedure_cases pc
SET provider_name = s.name
FROM surgeons s
WHERE pc.surgeon_id = s.id AND pc.surgeon_id IS NOT NULL;
*/
