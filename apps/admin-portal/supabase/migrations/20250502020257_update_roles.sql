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
DROP TABLE IF EXISTS role_permissions CASCADE;
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

-- Create role_permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission)
);

-- Create RLS policies for role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view role permissions in their enterprise" ON role_permissions
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

CREATE POLICY "Users can manage role permissions in their enterprise" ON role_permissions
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

-- Create user_role_permissions view
CREATE OR REPLACE VIEW user_role_permissions AS
SELECT DISTINCT
    up.user_id,
    rp.permission::text
FROM user_roles up
JOIN role_permissions rp ON rp.role_id = up.role_id
WHERE up.user_id = auth.uid();

-- Insert predefined roles and their permissions
DO $$
DECLARE
    superadmin_id UUID;
    human_resources_id UUID;
    accounting_id UUID;
BEGIN
    -- Insert superadmin role first
    INSERT INTO roles (name, description, is_system)
    VALUES ('superadmin', 'Super Administrator with full system access', true)
    RETURNING id INTO superadmin_id;

    -- Insert all permissions for superadmin
    INSERT INTO role_permissions (role_id, permission)
    SELECT 
        superadmin_id,
        unnest(enum_range(NULL::app_permission));

    -- Insert other roles
    INSERT INTO roles (name, description, is_system)
    VALUES 
        ('human_resources', 'Human Resources role with employee access', true),
        ('accounting', 'Accounting role with financial access', true);

    -- Get other role IDs
    SELECT id INTO human_resources_id FROM roles WHERE name = 'human_resources';
    SELECT id INTO accounting_id FROM roles WHERE name = 'accounting';

    -- Insert admin permissions
    INSERT INTO role_permissions (role_id, permission)
    SELECT 
        superadmin_id,
        unnest(ARRAY[
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
        ]::app_permission[]);

    -- Insert manager permissions
    INSERT INTO role_permissions (role_id, permission)
    SELECT 
        human_resources_id,
        unnest(ARRAY[
            'users.read',
            'roles.read',
            'companies.read',
            'branches.read',
            'clients.read',
            'vendors.read',
            'products.read',
            'invoices.read',
            'expenses.read',
            'settings.read'
        ]::app_permission[]);

    -- Insert accounting permissions
    INSERT INTO role_permissions (role_id, permission)
    SELECT 
        accounting_id,
        unnest(ARRAY[
            'invoices.create',
            'invoices.read',
            'invoices.update',
            'invoices.delete',
            'invoices.export',
            'expenses.create',
            'expenses.read',
            'expenses.update',
            'expenses.delete',
            'expenses.export',
            'companies.read'
        ]::app_permission[]);

END $$;
