-- Branches
ALTER TABLE branches
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Companies
ALTER TABLE companies
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Departments
ALTER TABLE departments
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Job Listings
ALTER TABLE job_listings
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Jobs
ALTER TABLE jobs
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Offices
ALTER TABLE offices
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Products
ALTER TABLE products
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';

-- Warehouses
ALTER TABLE warehouses
ALTER COLUMN status
DROP DEFAULT,
ALTER COLUMN status TYPE text,
ALTER COLUMN status
SET DEFAULT 'active';