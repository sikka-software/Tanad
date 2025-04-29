-- Drop existing role_permissions table if it exists
DROP TABLE IF EXISTS public.role_permissions CASCADE;

-- Create new role_permissions table with proper relationships
CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(role_id, permission)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for role_permissions
CREATE POLICY "Users can view role permissions"
    ON public.role_permissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id IN (
                SELECT id FROM roles r
                WHERE r.id = role_permissions.role_id
            )
        )
    );

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(enterprise_id uuid)
RETURNS SETOF app_permission
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT rp.permission
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    WHERE ur.user_id = auth.uid()
    AND ur.enterprise_id = get_user_permissions.enterprise_id;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER set_role_permissions_updated_at
    BEFORE UPDATE ON public.role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Insert default permissions for admin role
INSERT INTO public.role_permissions (role_id, permission)
SELECT 
    r.id,
    unnest(enum_range(NULL::app_permission)) AS permission
FROM roles r
WHERE r.name = 'admin';
