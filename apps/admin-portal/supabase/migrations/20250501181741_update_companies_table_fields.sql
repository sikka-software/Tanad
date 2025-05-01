-- Add new columns
ALTER TABLE companies
ADD COLUMN building_number TEXT,
ADD COLUMN street_name TEXT,
ADD COLUMN region TEXT,
ADD COLUMN additional_number TEXT;

-- Drop old columns
ALTER TABLE companies
DROP COLUMN address,
DROP COLUMN state;
