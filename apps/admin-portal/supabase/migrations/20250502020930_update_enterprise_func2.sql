-- Drop existing objects if they exist
DO $$ 
DECLARE
    v_type text;
BEGIN
    SELECT c.relkind INTO v_type
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'user_role_permissions';
    
    IF v_type = 'v' THEN
        DROP VIEW IF EXISTS user_role_permissions CASCADE;
    ELSIF v_type = 'r' THEN
        DROP TABLE IF EXISTS user_role_permissions CASCADE;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Drop other objects
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TYPE IF EXISTS app_permission CASCADE;

-- Create user_enterprises view
CREATE OR REPLACE VIEW user_enterprises AS
SELECT DISTINCT
    p.id AS user_id,
    p.enterprise_id
FROM profiles p;

-- Create the app_permission enum type
CREATE TYPE app_permission AS ENUM (
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.export',
    'users.invite',
    'roles.create',
    'roles.read',
    'roles.update',
    'roles.delete',
    'roles.export',
    'roles.assign',
    'companies.create',
    'companies.read',
    'companies.update',
    'companies.delete',
    'companies.export',
    'companies.duplicate',
    'branches.create',
    'branches.read',
    'branches.update',
    'branches.delete',
    'branches.export',
    'branches.duplicate',
    'clients.create',
    'clients.read',
    'clients.update',
    'clients.delete',
    'clients.export',
    'clients.duplicate',
    'vendors.create',
    'vendors.read',
    'vendors.update',
    'vendors.delete',
    'vendors.export',
    'vendors.duplicate',
    'products.create',
    'products.read',
    'products.update',
    'products.delete',
    'products.export',
    'products.duplicate',
    'invoices.create',
    'invoices.read',
    'invoices.update',
    'invoices.delete',
    'invoices.export',
    'invoices.duplicate',
    'expenses.create',
    'expenses.read',
    'expenses.update',
    'expenses.delete',
    'expenses.export',
    'expenses.duplicate',
    'settings.read',
    'settings.update'
);

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, enterprise_id)
);

-- Create RLS policies for roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roles in their enterprise" ON roles
    FOR SELECT
    USING (
        enterprise_id IN (
            SELECT enterprise_id
            FROM user_enterprises
            WHERE user_id = auth.uid()
        ) OR
        is_system = true
    );

CREATE POLICY "Users can create roles in their enterprise" ON roles
    FOR INSERT
    WITH CHECK (
        enterprise_id IN (
            SELECT enterprise_id
            FROM user_enterprises
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update roles in their enterprise" ON roles
    FOR UPDATE
    USING (
        enterprise_id IN (
            SELECT enterprise_id
            FROM user_enterprises
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        enterprise_id IN (
            SELECT enterprise_id
            FROM user_enterprises
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete roles in their enterprise" ON roles
    FOR DELETE
    USING (
        enterprise_id IN (
            SELECT enterprise_id
            FROM user_enterprises
            WHERE user_id = auth.uid()
        )
    );

-- Create permissions table (renamed from role_permissions)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission)
);

-- Create RLS policies for permissions table
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view permissions in their enterprise" ON permissions
    FOR SELECT
    USING (
        role_id IN (
            SELECT id
            FROM roles
            WHERE enterprise_id IN (
                SELECT enterprise_id
                FROM user_enterprises
                WHERE user_id = auth.uid()
            ) OR is_system = true
        )
    );

CREATE POLICY "Users can manage permissions in their enterprise" ON permissions
    FOR ALL
    USING (
        role_id IN (
            SELECT id
            FROM roles
            WHERE enterprise_id IN (
                SELECT enterprise_id
                FROM user_enterprises
                WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        role_id IN (
            SELECT id
            FROM roles
            WHERE enterprise_id IN (
                SELECT enterprise_id
                FROM user_enterprises
                WHERE user_id = auth.uid()
            )
        )
    );

-- Create user_permissions_view (updated to use permissions table, renamed from user_role_permissions)
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT DISTINCT
    ur.user_id,
    p.permission::text
FROM user_roles ur
JOIN permissions p ON p.role_id = ur.role_id -- Changed rp to p
WHERE ur.user_id = auth.uid();

-- Insert predefined system roles ONLY (permissions handled by seed script)
DO $$
BEGIN
    -- Insert system roles
    INSERT INTO roles (name, description, is_system)
    VALUES 
        ('superadmin', 'Super Administrator with full system access', true),
        ('human_resources', 'Human Resources role with employee access', true),
        ('accounting', 'Accounting role with financial access', true);

END $$;
