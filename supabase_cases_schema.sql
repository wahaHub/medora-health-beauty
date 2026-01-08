-- =====================================================
-- Procedure Cases Table
-- Stores before/after case information for procedures
-- =====================================================

-- Procedure Cases Table
CREATE TABLE IF NOT EXISTS procedure_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  case_number VARCHAR(10) NOT NULL,  -- 6-digit unique case number
  description TEXT,                   -- Case description (editable)
  provider_name VARCHAR(255),         -- e.g., "Dr. Heather Lee"
  patient_age VARCHAR(10),            -- e.g., "35"
  patient_gender VARCHAR(20),         -- e.g., "Female"
  image_count INTEGER DEFAULT 2,      -- Number of images for this case
  sort_order INTEGER DEFAULT 0,       -- For ordering cases
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(procedure_id, case_number)
);

CREATE INDEX idx_procedure_cases_procedure ON procedure_cases(procedure_id);
CREATE INDEX idx_procedure_cases_case_number ON procedure_cases(case_number);

-- Enable Row Level Security
ALTER TABLE procedure_cases ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on procedure_cases"
  ON procedure_cases FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update/delete (for admin)
CREATE POLICY "Allow authenticated insert on procedure_cases"
  ON procedure_cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on procedure_cases"
  ON procedure_cases FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete on procedure_cases"
  ON procedure_cases FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_procedure_cases_updated_at
  BEFORE UPDATE ON procedure_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Example: Insert a sample case
-- =====================================================
-- INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, patient_age, patient_gender)
-- SELECT id, '100151', 'Temples Lift performed with excellent results. Patient experienced minimal downtime.', 'Dr. Heather Lee', '45', 'Female'
-- FROM procedures WHERE slug = 'temples-lift-temporofrontal-lift';
