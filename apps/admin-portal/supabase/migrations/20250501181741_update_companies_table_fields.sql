-- Add new columns
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS building_number TEXT;
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS street_name TEXT;
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS additional_number TEXT;

-- Drop old columns
ALTER TABLE companies
DROP COLUMN IF EXISTS address;
ALTER TABLE companies
DROP COLUMN IF EXISTS state;
