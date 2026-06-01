-- Migration: Add currency column to hospital_procedures table
-- Date: 2026-02-14
-- Description: Allow each procedure to specify its price currency

-- Add currency column with default 'CNY'
ALTER TABLE hospital_procedures
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'CNY';

-- Add comment for documentation
COMMENT ON COLUMN hospital_procedures.currency IS 'Currency code: CNY, USD, THB, KRW, JPY, EUR, GBP';
