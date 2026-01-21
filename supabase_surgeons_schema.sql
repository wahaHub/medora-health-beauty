-- =====================================================
-- Medora Health & Beauty - Surgeons Schema (Simplified)
-- Single table with JSONB fields for complex data
-- =====================================================

-- Surgeons Table (All surgeon information in one table)
CREATE TABLE IF NOT EXISTS surgeons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgeon_id VARCHAR(255) NOT NULL UNIQUE, -- e.g., "min-zhang"
  name VARCHAR(255) NOT NULL, -- e.g., "Dr. Min Zhang"
  title VARCHAR(255) NOT NULL, -- e.g., "Board-Certified Plastic Surgeon"
  experience_years INTEGER NOT NULL,
  image_url TEXT, -- URL to surgeon's photo in R2 storage
  image_prompt TEXT, -- AI image generation prompt

  -- Complex fields stored as JSONB
  specialties JSONB DEFAULT '[]'::jsonb, -- ["Deep Plane Facelift", "Rhinoplasty", ...]
  languages JSONB DEFAULT '[]'::jsonb, -- ["English", "Mandarin Chinese", ...]
  education JSONB DEFAULT '[]'::jsonb, -- ["MD - Harvard Medical School", ...]
  certifications JSONB DEFAULT '[]'::jsonb, -- ["American Board of Plastic Surgery", ...]
  procedures_count JSONB DEFAULT '{}'::jsonb, -- {"facelifts": 600, "rhinoplasty": 500, ...}
  bio JSONB DEFAULT '{}'::jsonb, -- {"intro": "...", "expertise": "...", "philosophy": "...", "achievements": [...]}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_surgeons_surgeon_id ON surgeons(surgeon_id);
CREATE INDEX idx_surgeons_name ON surgeons(name);
CREATE INDEX idx_surgeons_specialties ON surgeons USING GIN (specialties);

-- =====================================================
-- No RLS - Table is fully public
-- =====================================================
-- RLS is not enabled since this table is fully public for read access
-- All data is meant to be publicly accessible

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE TRIGGER update_surgeons_updated_at
  BEFORE UPDATE ON surgeons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Query Examples
-- =====================================================

-- Get all surgeon information for a single surgeon:
/*
SELECT * FROM surgeons WHERE surgeon_id = 'min-zhang';
*/

-- Search surgeons by specialty:
/*
SELECT * FROM surgeons
WHERE specialties @> '["Rhinoplasty"]'::jsonb;
*/

-- Get all surgeons with experience > 15 years:
/*
SELECT surgeon_id, name, experience_years
FROM surgeons
WHERE experience_years > 15
ORDER BY experience_years DESC;
*/


ALTER TABLE surgeons
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN surgeons.images IS 'JSONB object containing surgeon photos: hero (main profile photo), certification (certificates/awards), with_patients (photos with patients)';
