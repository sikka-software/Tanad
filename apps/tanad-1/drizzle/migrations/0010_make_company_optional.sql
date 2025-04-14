-- Make company field optional in clients table
ALTER TABLE clients ALTER COLUMN company DROP NOT NULL; 