-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE
);

-- Create indexes for roles table
CREATE INDEX IF NOT EXISTS roles_name_idx ON roles(name);
CREATE INDEX IF NOT EXISTS roles_enterprise_id_idx ON roles(enterprise_id);

-- Insert default roles based on existing user_roles
INSERT INTO roles (name, description, enterprise_id)
SELECT DISTINCT role, 'Default role', enterprise_id
FROM user_roles;

-- Add role_id column to user_roles
ALTER TABLE user_roles 
ADD COLUMN role_id UUID REFERENCES roles(id);

-- Update user_roles with role_id values
UPDATE user_roles ur
SET role_id = r.id
FROM roles r
WHERE r.name = ur.role::text
AND r.enterprise_id = ur.enterprise_id;

-- Make role_id NOT NULL after populating data
ALTER TABLE user_roles 
ALTER COLUMN role_id SET NOT NULL;

-- Rename old role column to deprecated_role instead of dropping it
-- This allows existing dependencies to continue working while you migrate them
ALTER TABLE user_roles
RENAME COLUMN role TO deprecated_role;

-- Add comment to indicate this column is deprecated
COMMENT ON COLUMN user_roles.deprecated_role IS 'DEPRECATED: This column is replaced by role_id referencing the roles table. Maintain temporarily for backward compatibility.';

-- Drop existing primary key constraint
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_roles' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE user_roles DROP CONSTRAINT ' || quote_ident(constraint_name)
            FROM information_schema.table_constraints
            WHERE table_name = 'user_roles'
            AND constraint_type = 'PRIMARY KEY'
        );
    END IF;
END $$;

-- Add new primary key
ALTER TABLE user_roles
ADD PRIMARY KEY (user_id, role_id, enterprise_id);

-- Create new indexes
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON user_roles(role_id);
