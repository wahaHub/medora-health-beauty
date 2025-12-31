-- =====================================================
-- Cases (Before/After Photos) Schema
-- Multi-language Support
-- =====================================================

-- 1. Cases Table (Main case information)
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., "1001510"
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  surgeon_name VARCHAR(255), -- e.g., "Dr. Heather Lee"
  surgery_date DATE,
  patient_age INTEGER,
  patient_gender VARCHAR(20), -- 'male', 'female', 'other'
  patient_location VARCHAR(255), -- e.g., "Rochester, NY"
  is_featured BOOLEAN DEFAULT false, -- Featured cases appear first
  display_order INTEGER DEFAULT 0, -- Order for displaying cases
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_procedure ON cases(procedure_id);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_featured ON cases(is_featured);
CREATE INDEX idx_cases_display_order ON cases(display_order);

-- 2. Case Translations (Multi-language descriptions)
CREATE TABLE IF NOT EXISTS case_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  description TEXT, -- Case description
  patient_goals TEXT, -- What the patient wanted to achieve
  outcome_summary TEXT, -- Summary of the outcome
  UNIQUE(case_id, language_code)
);

CREATE INDEX idx_case_translations_case ON case_translations(case_id);
CREATE INDEX idx_case_translations_language ON case_translations(language_code);

-- 3. Case Photos (Before/After images)
CREATE TABLE IF NOT EXISTS case_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  photo_type VARCHAR(20) NOT NULL, -- 'before', 'after'
  view_angle VARCHAR(50), -- 'front', 'side', 'profile', '45-degree', etc.
  image_url TEXT NOT NULL, -- URL to the image
  thumbnail_url TEXT, -- URL to thumbnail
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_photos_case ON case_photos(case_id);
CREATE INDEX idx_case_photos_type ON case_photos(photo_type);

-- 4. Additional Procedures (if multiple procedures performed together)
CREATE TABLE IF NOT EXISTS case_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Primary procedure for this case
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, procedure_id)
);

CREATE INDEX idx_case_procedures_case ON case_procedures(case_id);
CREATE INDEX idx_case_procedures_procedure ON case_procedures(procedure_id);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_procedures ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on cases" 
  ON cases FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on case_translations" 
  ON case_translations FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on case_photos" 
  ON case_photos FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access on case_procedures" 
  ON case_procedures FOR SELECT 
  TO public 
  USING (true);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE TRIGGER update_cases_updated_at 
  BEFORE UPDATE ON cases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data for Testing (Optional)
-- =====================================================

-- Example: Insert a sample case for "Brow Lift"
-- First, get the procedure_id:
-- SELECT id FROM procedures WHERE slug = 'brow-lift-forehead-lift';

-- Insert sample case (replace 'procedure-uuid-here' with actual UUID)
/*
INSERT INTO cases (
  case_number,
  procedure_id,
  surgeon_name,
  surgery_date,
  patient_age,
  patient_gender,
  patient_location,
  is_featured,
  display_order
) VALUES (
  '1001510',
  'procedure-uuid-here',
  'Dr. Heather Lee',
  '2023-06-15',
  42,
  'female',
  'Rochester, NY',
  true,
  1
);

-- Get case_id:
-- SELECT id FROM cases WHERE case_number = '1001510';

-- Insert case description
INSERT INTO case_translations (
  case_id,
  language_code,
  description,
  patient_goals,
  outcome_summary
) VALUES (
  'case-uuid-here',
  'en',
  'This patient desired a refreshed, more youthful appearance around the eyes and forehead.',
  'Reduce forehead lines and lift sagging eyebrows',
  'Excellent results with natural-looking brow elevation and smoother forehead'
);

-- Insert before/after photos
INSERT INTO case_photos (case_id, photo_type, view_angle, image_url, display_order)
VALUES 
  ('case-uuid-here', 'before', 'front', 'https://example.com/before-front.jpg', 1),
  ('case-uuid-here', 'after', 'front', 'https://example.com/after-front.jpg', 2),
  ('case-uuid-here', 'before', 'side', 'https://example.com/before-side.jpg', 3),
  ('case-uuid-here', 'after', 'side', 'https://example.com/after-side.jpg', 4);
*/

