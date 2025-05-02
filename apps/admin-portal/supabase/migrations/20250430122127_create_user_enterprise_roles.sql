-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_enterprise_roles table
CREATE TABLE IF NOT EXISTS user_enterprise_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    enterprise_id UUID NOT NULL REFERENCES enterprises(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, enterprise_id)
);

-- Drop the existing user_enterprises view and dependent objects
DROP VIEW IF EXISTS user_enterprises CASCADE;

-- Create the updated user_enterprises view
CREATE VIEW user_enterprises AS
SELECT DISTINCT 
    uer.user_id,
    uer.enterprise_id,
    uer.role_id
FROM user_enterprise_roles uer;

-- Add RLS policies
ALTER TABLE user_enterprise_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enterprise roles"
    ON user_enterprise_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users with roles.create permission can insert enterprise roles"
    ON user_enterprise_roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = auth.uid()
            AND rp.permission = 'roles.create'::app_permission
        )
    );

CREATE POLICY "Users with roles.update permission can update enterprise roles"
    ON user_enterprise_roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = auth.uid()
            AND rp.permission = 'roles.update'::app_permission
        )
    );

-- Add trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_enterprise_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
