-- =====================================================
-- Complete Setup: Create procedure_cases table with RLS
-- Run this in Supabase SQL Editor
-- =====================================================

-- 0. Create the update_updated_at_column function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create the procedure_cases table
CREATE TABLE IF NOT EXISTS procedure_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  case_number VARCHAR(10) NOT NULL,
  description TEXT,
  provider_name VARCHAR(255),
  patient_age VARCHAR(10),
  patient_gender VARCHAR(20),
  image_count INTEGER DEFAULT 2,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(procedure_id, case_number)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_procedure_cases_procedure ON procedure_cases(procedure_id);
CREATE INDEX IF NOT EXISTS idx_procedure_cases_case_number ON procedure_cases(case_number);

-- 3. Enable Row Level Security
ALTER TABLE procedure_cases ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow authenticated insert on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow authenticated update on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow authenticated delete on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow anon insert on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow anon update on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow anon delete on procedure_cases" ON procedure_cases;
DROP POLICY IF EXISTS "Allow all on procedure_cases" ON procedure_cases;

-- 5. Create RLS Policies

-- Allow public read access
CREATE POLICY "Allow public read access on procedure_cases"
  ON procedure_cases FOR SELECT
  TO public
  USING (true);

-- Allow anon role (API with anon key) to insert/update/delete
CREATE POLICY "Allow anon insert on procedure_cases"
  ON procedure_cases FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update on procedure_cases"
  ON procedure_cases FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anon delete on procedure_cases"
  ON procedure_cases FOR DELETE
  TO anon
  USING (true);

-- Also allow authenticated users
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

-- 6. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_procedure_cases_updated_at ON procedure_cases;
CREATE TRIGGER update_procedure_cases_updated_at
  BEFORE UPDATE ON procedure_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
