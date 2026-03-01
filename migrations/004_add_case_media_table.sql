-- Migration: Add case_media table for beauty hospitals
-- Date: 2026-03-01
-- Purpose: Enable case media storage for beauty hospitals (role=hospital)
--          Previously only China Medical Supabase (regular_hospital) had this table
--          Now both beauty and regular hospitals use the same case_media structure

-- Create case_media table
CREATE TABLE IF NOT EXISTS public.case_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.procedure_cases(id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_case_media_case_id ON public.case_media(case_id);
CREATE INDEX IF NOT EXISTS idx_case_media_sort_order ON public.case_media(case_id, sort_order);

-- Enable RLS
ALTER TABLE public.case_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access" ON public.case_media
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.case_media
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.case_media
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.case_media
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_case_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER case_media_updated_at
  BEFORE UPDATE ON public.case_media
  FOR EACH ROW
  EXECUTE FUNCTION update_case_media_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.case_media IS 'Stores media files (images/videos) for procedure cases. Used by both beauty hospitals (Main Supabase) and regular hospitals (China Medical Supabase).';
