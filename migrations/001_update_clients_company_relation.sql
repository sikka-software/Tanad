-- Step 1: Create a temporary column to store existing company names
ALTER TABLE clients ADD COLUMN temp_company_name text;
UPDATE clients SET temp_company_name = company;

-- Step 2: Drop the existing company column
ALTER TABLE clients DROP COLUMN company;

-- Step 3: Add the new company column as UUID with foreign key
ALTER TABLE clients ADD COLUMN company uuid REFERENCES companies(id) ON DELETE SET NULL;

-- Step 4: Create companies for existing clients
WITH new_companies AS (
  INSERT INTO companies (name, email, user_id)
  SELECT DISTINCT 
    COALESCE(temp_company_name, 'Unknown Company'),
    'company@example.com', -- Default email since it's required
    clients.user_id
  FROM clients
  WHERE temp_company_name IS NOT NULL
  RETURNING id, name
)
UPDATE clients c
SET company = nc.id
FROM new_companies nc
WHERE nc.name = c.temp_company_name;

-- Step 5: Drop the temporary column
ALTER TABLE clients DROP COLUMN temp_company_name; 