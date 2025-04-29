-- Drop existing objects if they exist
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
DROP TABLE IF EXISTS roles CASCADE;
DROP TYPE IF EXISTS app_permission CASCADE;

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

-- Create role_permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission)
);

-- Create user_role_permissions view
CREATE VIEW user_role_permissions AS
SELECT DISTINCT
    up.user_id,
    rp.permission
FROM user_roles up
JOIN role_permissions rp ON rp.role_id = up.role_id;

-- Insert predefined roles
WITH inserted_roles AS (
    INSERT INTO roles (name, description, is_system)
    VALUES
        ('superadmin', 'Super Administrator with full system access', true),
        ('admin', 'Administrator with enterprise-wide access', true),
        ('manager', 'Manager with branch-level access', true),
        ('accounting', 'Accounting role with financial access', true),
        ('employee', 'Regular employee with basic access', true)
    RETURNING id, name
)
-- Insert permissions for superadmin role
INSERT INTO role_permissions (role_id, permission)
SELECT 
    r.id,
    enum_range(NULL::app_permission)
FROM inserted_roles r
WHERE r.name = 'superadmin';

-- Insert permissions for admin role
INSERT INTO role_permissions (role_id, permission)
SELECT 
    r.id,
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
    ]::app_permission[])
FROM inserted_roles r
WHERE r.name = 'admin';

-- Insert permissions for manager role
INSERT INTO role_permissions (role_id, permission)
SELECT 
    r.id,
    unnest(ARRAY[
        'users.read',
        'roles.read',
        'companies.read',
        'branches.read',
        'branches.update',
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
        'settings.read'
    ]::app_permission[])
FROM inserted_roles r
WHERE r.name = 'manager';

-- Insert permissions for accounting role
INSERT INTO role_permissions (role_id, permission)
SELECT 
    r.id,
    unnest(ARRAY[
        'invoices.create',
        'invoices.read',
        'invoices.update',
        'invoices.delete',
        'invoices.export',
        'invoices.duplicate',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'products.export',
        'expenses.create',
        'expenses.read',
        'expenses.update',
        'expenses.delete',
        'expenses.export',
        'expenses.duplicate',
        'vendors.create',
        'vendors.read',
        'vendors.update',
        'vendors.delete',
        'vendors.export',
        'clients.read',
        'companies.read'
    ]::app_permission[])
FROM inserted_roles r
WHERE r.name = 'accounting';

-- Insert permissions for employee role
INSERT INTO role_permissions (role_id, permission)
SELECT 
    r.id,
    unnest(ARRAY[
        'companies.read',
        'branches.read',
        'clients.read',
        'vendors.read',
        'products.read',
        'invoices.read',
        'expenses.read'
    ]::app_permission[])
FROM inserted_roles r
WHERE r.name = 'employee';

-- Add RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Admins can manage roles in their enterprise" ON roles
    FOR ALL
    USING (
        enterprise_id IN (
            SELECT enterprise_id 
            FROM user_enterprises ue
            JOIN user_role_permissions urp ON urp.user_id = ue.user_id
            WHERE ue.user_id = auth.uid() 
            AND urp.permission = 'roles.create'
        )
    );

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
            ) OR 
            is_system = true
        )
    );

CREATE POLICY "Admins can manage role permissions in their enterprise" ON role_permissions
    FOR ALL
    USING (
        role_id IN (
            SELECT id 
            FROM roles 
            WHERE enterprise_id IN (
                SELECT enterprise_id 
                FROM user_enterprises ue
                JOIN user_role_permissions urp ON urp.user_id = ue.user_id
                WHERE ue.user_id = auth.uid() 
                AND urp.permission = 'roles.create'
            )
        )
    );
