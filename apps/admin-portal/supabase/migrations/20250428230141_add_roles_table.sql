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

-- Backup existing user_roles data
CREATE TEMP TABLE user_roles_backup AS
SELECT * FROM user_roles;

-- Drop existing user_roles table
DROP TABLE user_roles;

-- Create new user_roles table with role_id reference
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, role_id, enterprise_id)
);

-- Create indexes for user_roles table
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS user_roles_enterprise_id_idx ON user_roles(enterprise_id);

-- Create default roles for each enterprise and migrate existing data
INSERT INTO roles (name, description, enterprise_id)
SELECT DISTINCT role, 'Default role', enterprise_id
FROM user_roles_backup;

-- Migrate user_roles data
INSERT INTO user_roles (user_id, role_id, enterprise_id)
SELECT ub.user_id, r.id, ub.enterprise_id
FROM user_roles_backup ub
JOIN roles r ON r.name = ub.role AND r.enterprise_id = ub.enterprise_id;

-- Drop temporary table
DROP TABLE user_roles_backup;
