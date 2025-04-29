-- Drop existing tables and views to ensure clean state
DO $$ 
BEGIN
    -- Drop view if it exists
    DROP VIEW IF EXISTS user_role_permissions CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        -- If it's not a view, try dropping it as a table
        DROP TABLE IF EXISTS user_role_permissions CASCADE;
END $$;

DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Recreate roles table with proper constraints
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_predefined BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create role_permissions table with proper constraints
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role_id, permission)
);

CREATE INDEX role_permissions_role_id_idx ON role_permissions(role_id);

-- Create user_roles table with proper constraints
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role_id, enterprise_id)
);

CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX user_roles_role_id_idx ON user_roles(role_id);
CREATE INDEX user_roles_enterprise_id_idx ON user_roles(enterprise_id);

-- Create user_role_permissions view
CREATE OR REPLACE VIEW user_role_permissions AS
SELECT DISTINCT
    ur.user_id,
    ur.enterprise_id,
    rp.permission
FROM user_roles ur
JOIN role_permissions rp ON ur.role_id = rp.role_id;

-- Insert predefined roles
INSERT INTO roles (name, description, is_predefined)
VALUES 
    ('superadmin', 'Super Administrator with full access', true),
    ('admin', 'Administrator with enterprise-wide access', true),
    ('manager', 'Manager with department-level access', true),
    ('accounting', 'Accounting role with financial access', true),
    ('employee', 'Regular employee with basic access', true);

-- Insert superadmin permissions (all permissions)
INSERT INTO role_permissions (role_id, permission)
SELECT 
    r.id,
    enum_range(NULL::app_permission)
FROM roles r
WHERE r.name = 'superadmin';

-- Add RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Users can view roles" ON roles
    FOR SELECT
    USING (true);

CREATE POLICY "Only superadmins can insert roles" ON roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.create'
        )
    );

CREATE POLICY "Only superadmins can update roles" ON roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.update'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.update'
        )
    );

CREATE POLICY "Only superadmins can delete roles" ON roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.delete'
        )
    );

-- Role permissions policies
CREATE POLICY "Users can view role permissions" ON role_permissions
    FOR SELECT
    USING (true);

CREATE POLICY "Only superadmins can insert role permissions" ON role_permissions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.update'
        )
    );

CREATE POLICY "Only superadmins can update role permissions" ON role_permissions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.update'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.update'
        )
    );

CREATE POLICY "Only superadmins can delete role permissions" ON role_permissions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.delete'
        )
    );

-- User roles policies
CREATE POLICY "Users can view user roles" ON user_roles
    FOR SELECT
    USING (true);

CREATE POLICY "Only superadmins and admins can insert user roles" ON user_roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.assign'
            AND urp.enterprise_id = NEW.enterprise_id
        )
    );

CREATE POLICY "Only superadmins and admins can update user roles" ON user_roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.assign'
            AND urp.enterprise_id = NEW.enterprise_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.assign'
            AND urp.enterprise_id = NEW.enterprise_id
        )
    );

CREATE POLICY "Only superadmins and admins can delete user roles" ON user_roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_role_permissions urp
            WHERE urp.user_id = auth.uid()
            AND urp.permission = 'roles.assign'
            AND urp.enterprise_id = OLD.enterprise_id
        )
    );
