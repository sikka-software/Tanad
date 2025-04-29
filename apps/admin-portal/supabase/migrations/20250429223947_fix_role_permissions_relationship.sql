-- Drop existing role_permissions table and its dependencies
DROP TABLE IF EXISTS role_permissions CASCADE;

-- Recreate role_permissions table with proper foreign key relationship
CREATE TABLE role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(role_id, permission)
);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for role_permissions
CREATE POLICY "Users can view role permissions"
ON role_permissions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.role_id = role_permissions.role_id
        AND ur.user_id = auth.uid()
    )
);

CREATE POLICY "Only superadmins can manage role permissions"
ON role_permissions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'superadmin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'superadmin'
    )
);

-- Create trigger for updated_at
CREATE TRIGGER set_role_permissions_updated_at
    BEFORE UPDATE ON role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
