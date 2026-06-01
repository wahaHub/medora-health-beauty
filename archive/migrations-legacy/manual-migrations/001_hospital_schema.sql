-- =====================================================
-- Medora Health & Beauty - Hospital Schema
-- 医院页面数据库架构
-- =====================================================
-- Version: 4.0
-- Date: 2026-02-05
-- =====================================================
--
-- 设计原则:
--   - 最大程度复用已有表 (procedures, surgeons, procedure_cases)
--   - 跟 surgeons 表一致: photos/payment_methods/highlights 用 JSONB
--   - reviews 和 video_testimonials 是全局通用表，不局限于医院
--   - surgeons / procedure_cases 直接加 hospital_id
--
-- 修改已有表:
--   - surgeons         → 加 hospital_id
--   - procedure_cases  → 加 hospital_id
--
-- 新增表:
--   1.  hospitals                    - 医院基础信息 (photos/payment_methods/highlights JSONB)
--   2.  hospital_translations        - 医院多语言内容 (含 highlights 翻译)
--   3.  hospital_procedures          - 关联表: 医院 ↔ procedures + 定价
--   4.  reviews                      - 通用评价表 (网站/医院共用)
--   5.  video_testimonials           - 通用视频见证表 (网站/医院共用)
--   6.  hospital_rating_breakdown    - 评分分类明细
--   7.  hospital_location            - 位置/联系方式
--   8.  hospital_nearby_attractions  - 周边地标
--
-- =====================================================


-- =====================================================
-- 1. Hospitals (Base data)
-- 医院表 — photos/payment_methods/highlights 全部 JSONB
-- =====================================================

CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  year_established INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  hero_image TEXT,
  total_patients INTEGER DEFAULT 0,
  recommend_rate INTEGER DEFAULT 0,               -- 0-100
  photos JSONB DEFAULT '[]'::jsonb,               -- ["url1", "url2", ...]
  payment_methods JSONB DEFAULT '[]'::jsonb,      -- ["Visa", "Mastercard", ...]
  highlights JSONB DEFAULT '[]'::jsonb,           -- [{"icon":"award","text":"JCI Accredited"},...]
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN hospitals.photos IS 'JSONB array of photo URLs: ["url1","url2",...]';
COMMENT ON COLUMN hospitals.payment_methods IS 'JSONB array: ["Visa","Mastercard","Wire Transfer",...]';
COMMENT ON COLUMN hospitals.highlights IS 'JSONB array of {icon,text}: [{"icon":"award","text":"JCI Accredited since 2012"},...]';

CREATE INDEX IF NOT EXISTS idx_hospitals_slug ON hospitals(slug);
CREATE INDEX IF NOT EXISTS idx_hospitals_active ON hospitals(is_active);


-- =====================================================
-- 2. Hospital Translations (Multi-language)
-- 医院翻译 — 含 highlights 的翻译版
-- =====================================================

CREATE TABLE IF NOT EXISTS hospital_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  tagline TEXT,
  description TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,           -- 翻译版: [{"icon":"award","text":"JCI认证自2012年"},...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_hospital_translations_hospital ON hospital_translations(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_translations_language ON hospital_translations(language_code);


-- =====================================================
-- 3. Hospital Procedures (Junction + pricing)
-- 医院手术项目 — 每家医院对同一手术有不同价格
-- =====================================================

CREATE TABLE IF NOT EXISTS hospital_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  price_range VARCHAR(100),                       -- "$2,800 – $5,500"
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, procedure_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_procedures_hospital ON hospital_procedures(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_procedures_procedure ON hospital_procedures(procedure_id);


-- =====================================================
-- 4. Reviews (通用评价表)
-- 全局评价 — hospital_id 可选
--   NULL = 给网站的评价
--   有值 = 给某医院的评价
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,  -- NULL = 网站评价
  author_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_date DATE,
  procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  review_text TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_hospital ON reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_procedure ON reviews(procedure_id);
CREATE INDEX IF NOT EXISTS idx_reviews_language ON reviews(language_code);


-- =====================================================
-- 5. Video Testimonials (通用视频见证表)
-- 全局视频 — hospital_id 可选
--   NULL = 网站通用视频
--   有值 = 某医院的视频
-- =====================================================

CREATE TABLE IF NOT EXISTS video_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,  -- NULL = 网站视频
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  title VARCHAR(255) NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  duration VARCHAR(20),
  procedure_id UUID REFERENCES procedures(id) ON DELETE SET NULL,
  country VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_testimonials_hospital ON video_testimonials(hospital_id);
CREATE INDEX IF NOT EXISTS idx_video_testimonials_procedure ON video_testimonials(procedure_id);


-- =====================================================
-- 6. Hospital Rating Breakdown
-- 医院评分分类明细
-- =====================================================

CREATE TABLE IF NOT EXISTS hospital_rating_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  label VARCHAR(100) NOT NULL,
  score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 5),
  sort_order INTEGER DEFAULT 0,
  UNIQUE(hospital_id, language_code, label)
);

CREATE INDEX IF NOT EXISTS idx_hospital_rating_breakdown_hospital ON hospital_rating_breakdown(hospital_id);


-- =====================================================
-- 7. Hospital Location (1:1)
-- 医院位置/联系方式
-- =====================================================

CREATE TABLE IF NOT EXISTS hospital_location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE UNIQUE,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  hours VARCHAR(255),
  map_embed TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospital_location_hospital ON hospital_location(hospital_id);


-- =====================================================
-- 8. Hospital Nearby Attractions
-- 医院周边地标
-- =====================================================

CREATE TABLE IF NOT EXISTS hospital_nearby_attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  name VARCHAR(255) NOT NULL,
  distance VARCHAR(100),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hospital_nearby_attractions_hospital ON hospital_nearby_attractions(hospital_id);


-- =====================================================
-- ALTER: surgeons 加 hospital_id
-- =====================================================

ALTER TABLE surgeons
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_surgeons_hospital ON surgeons(hospital_id);


-- =====================================================
-- ALTER: procedure_cases 加 hospital_id
-- =====================================================

ALTER TABLE procedure_cases
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_procedure_cases_hospital ON procedure_cases(hospital_id);


-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_rating_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_nearby_attractions ENABLE ROW LEVEL SECURITY;

-- Public Read
CREATE POLICY "Allow public read access on hospitals" ON hospitals FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on hospital_translations" ON hospital_translations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on hospital_procedures" ON hospital_procedures FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on reviews" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on video_testimonials" ON video_testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on hospital_rating_breakdown" ON hospital_rating_breakdown FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on hospital_location" ON hospital_location FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on hospital_nearby_attractions" ON hospital_nearby_attractions FOR SELECT TO public USING (true);

-- Auth Write: hospitals
CREATE POLICY "Allow anon insert on hospitals" ON hospitals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on hospitals" ON hospitals FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on hospitals" ON hospitals FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on hospitals" ON hospitals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on hospitals" ON hospitals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on hospitals" ON hospitals FOR DELETE TO authenticated USING (true);

-- Auth Write: hospital_translations
CREATE POLICY "Allow anon insert on hospital_translations" ON hospital_translations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on hospital_translations" ON hospital_translations FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on hospital_translations" ON hospital_translations FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on hospital_translations" ON hospital_translations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on hospital_translations" ON hospital_translations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on hospital_translations" ON hospital_translations FOR DELETE TO authenticated USING (true);

-- Auth Write: hospital_procedures
CREATE POLICY "Allow anon insert on hospital_procedures" ON hospital_procedures FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on hospital_procedures" ON hospital_procedures FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on hospital_procedures" ON hospital_procedures FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on hospital_procedures" ON hospital_procedures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on hospital_procedures" ON hospital_procedures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on hospital_procedures" ON hospital_procedures FOR DELETE TO authenticated USING (true);

-- Auth Write: reviews
CREATE POLICY "Allow anon insert on reviews" ON reviews FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on reviews" ON reviews FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on reviews" ON reviews FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on reviews" ON reviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on reviews" ON reviews FOR DELETE TO authenticated USING (true);

-- Auth Write: video_testimonials
CREATE POLICY "Allow anon insert on video_testimonials" ON video_testimonials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on video_testimonials" ON video_testimonials FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on video_testimonials" ON video_testimonials FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on video_testimonials" ON video_testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on video_testimonials" ON video_testimonials FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on video_testimonials" ON video_testimonials FOR DELETE TO authenticated USING (true);

-- Auth Write: hospital_rating_breakdown
CREATE POLICY "Allow anon insert on hospital_rating_breakdown" ON hospital_rating_breakdown FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on hospital_rating_breakdown" ON hospital_rating_breakdown FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on hospital_rating_breakdown" ON hospital_rating_breakdown FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on hospital_rating_breakdown" ON hospital_rating_breakdown FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on hospital_rating_breakdown" ON hospital_rating_breakdown FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on hospital_rating_breakdown" ON hospital_rating_breakdown FOR DELETE TO authenticated USING (true);

-- Auth Write: hospital_location
CREATE POLICY "Allow anon insert on hospital_location" ON hospital_location FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on hospital_location" ON hospital_location FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on hospital_location" ON hospital_location FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on hospital_location" ON hospital_location FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on hospital_location" ON hospital_location FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on hospital_location" ON hospital_location FOR DELETE TO authenticated USING (true);

-- Auth Write: hospital_nearby_attractions
CREATE POLICY "Allow anon insert on hospital_nearby_attractions" ON hospital_nearby_attractions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on hospital_nearby_attractions" ON hospital_nearby_attractions FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on hospital_nearby_attractions" ON hospital_nearby_attractions FOR DELETE TO anon USING (true);
CREATE POLICY "Allow authenticated insert on hospital_nearby_attractions" ON hospital_nearby_attractions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on hospital_nearby_attractions" ON hospital_nearby_attractions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on hospital_nearby_attractions" ON hospital_nearby_attractions FOR DELETE TO authenticated USING (true);


-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_translations_updated_at
  BEFORE UPDATE ON hospital_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_location_updated_at
  BEFORE UPDATE ON hospital_location
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- Query Examples
-- =====================================================

-- 查医院基础信息 (photos/highlights/payment_methods 都在主表):
/*
SELECT h.*, ht.tagline, ht.description, ht.highlights as highlights_translated
FROM hospitals h
LEFT JOIN hospital_translations ht ON h.id = ht.hospital_id AND ht.language_code = 'en'
WHERE h.slug = 'bangkok-aesthetic-center';
*/

-- 查医院手术定价:
/*
SELECT p.procedure_name, p.slug, p.category,
       hp.price_range, hp.price_min, hp.price_max, hp.is_popular
FROM hospital_procedures hp
JOIN procedures p ON hp.procedure_id = p.id
WHERE hp.hospital_id = (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center')
ORDER BY hp.sort_order;
*/

-- 查医院医生:
/*
SELECT surgeon_id, name, title, experience_years, specialties, images
FROM surgeons
WHERE hospital_id = (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center');
*/

-- 查医院案例:
/*
SELECT pc.case_number, pc.patient_age, pc.patient_gender,
       p.procedure_name, s.name as surgeon_name
FROM procedure_cases pc
JOIN procedures p ON pc.procedure_id = p.id
LEFT JOIN surgeons s ON pc.surgeon_id = s.id
WHERE pc.hospital_id = (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center');
*/

-- 查医院评价 (通用 reviews 表按 hospital_id 过滤):
/*
SELECT r.*, p.procedure_name
FROM reviews r
LEFT JOIN procedures p ON r.procedure_id = p.id
WHERE r.hospital_id = (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center')
ORDER BY r.review_date DESC;
*/

-- 查网站通用评价 (hospital_id IS NULL):
/*
SELECT * FROM reviews WHERE hospital_id IS NULL ORDER BY review_date DESC;
*/

-- 查医院视频 (通用 video_testimonials 表按 hospital_id 过滤):
/*
SELECT vt.*, p.procedure_name
FROM video_testimonials vt
LEFT JOIN procedures p ON vt.procedure_id = p.id
WHERE vt.hospital_id = (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center')
ORDER BY vt.sort_order;
*/
