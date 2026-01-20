-- Add images JSONB column to surgeons table
-- This column will store multiple image URLs for each surgeon
-- Format: {"hero": "url", "certification": "url", "with_patients": "url"}

ALTER TABLE surgeons
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN surgeons.images IS 'JSONB object containing surgeon photos: hero (main profile photo), certification (certificates/awards), with_patients (photos with patients)';

-- Example update:
-- UPDATE surgeons SET images = '{"hero": "https://...", "certification": "https://...", "with_patients": "https://..."}'::jsonb WHERE surgeon_id = 'min-zhang';
