-- =====================================================
-- Medora Health & Beauty - Database Schema
-- Multi-language Support for Procedures
-- =====================================================

-- 1. Procedures Table (Language-independent data)
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL, -- 'face', 'body', 'non-surgical'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedures_slug ON procedures(slug);
CREATE INDEX idx_procedures_category ON procedures(category);

-- 2. Procedure Translations Table (Multi-language content)
CREATE TABLE IF NOT EXISTS procedure_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en', -- 'en', 'zh', 'es', etc.
  overview TEXT,
  anesthesia TEXT,
  procedure_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(procedure_id, language_code)
);

CREATE INDEX idx_procedure_translations_procedure ON procedure_translations(procedure_id);
CREATE INDEX idx_procedure_translations_language ON procedure_translations(language_code);

-- 3. Recovery Information (Multi-language)
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

CREATE INDEX idx_procedure_recovery_procedure ON procedure_recovery(procedure_id);

-- 4. Benefits (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS procedure_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  benefit_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedure_benefits_procedure ON procedure_benefits(procedure_id);
CREATE INDEX idx_procedure_benefits_language ON procedure_benefits(language_code);

-- 5. Candidacy Criteria (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS procedure_candidacy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  candidacy_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedure_candidacy_procedure ON procedure_candidacy(procedure_id);

-- 6. Techniques (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS procedure_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  technique_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedure_techniques_procedure ON procedure_techniques(procedure_id);

-- 7. Recovery Timeline (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS procedure_recovery_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  timepoint VARCHAR(255) NOT NULL,
  guidance TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedure_recovery_timeline_procedure ON procedure_recovery_timeline(procedure_id);

-- 8. Recovery Tips (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS procedure_recovery_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  tip_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedure_recovery_tips_procedure ON procedure_recovery_tips(procedure_id);

-- 9. Complementary Procedures (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS complementary_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  complementary_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_complementary_procedures_procedure ON complementary_procedures(procedure_id);

-- 10. Risks and Considerations (Multi-language, multiple per procedure)
CREATE TABLE IF NOT EXISTS procedure_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  risk_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedure_risks_procedure ON procedure_risks(procedure_id);

-- =====================================================
-- Enable Row Level Security (RLS)
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

-- Allow public read access (you can modify this based on your needs)
CREATE POLICY "Allow public read access on procedures" 
  ON procedures FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_translations" 
  ON procedure_translations FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_recovery" 
  ON procedure_recovery FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_benefits" 
  ON procedure_benefits FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_candidacy" 
  ON procedure_candidacy FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_techniques" 
  ON procedure_techniques FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_recovery_timeline" 
  ON procedure_recovery_timeline FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_recovery_tips" 
  ON procedure_recovery_tips FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on complementary_procedures" 
  ON complementary_procedures FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on procedure_risks" 
  ON procedure_risks FOR SELECT 
  TO public 
  USING (true);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_procedures_updated_at 
  BEFORE UPDATE ON procedures 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedure_translations_updated_at 
  BEFORE UPDATE ON procedure_translations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

