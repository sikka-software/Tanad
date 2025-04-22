-- Drop the column that depends on the type
ALTER TABLE user_roles DROP COLUMN IF EXISTS role;

-- Drop and recreate the type
DROP TYPE IF EXISTS app_role;
CREATE TYPE app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');

-- Add the column back
ALTER TABLE user_roles ADD COLUMN role app_role NOT NULL;