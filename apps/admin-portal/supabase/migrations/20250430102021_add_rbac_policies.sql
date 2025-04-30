-- Drop all existing policies
DO $$ BEGIN
    -- Drop policies for roles table
    DROP POLICY IF EXISTS "Users can view roles in their enterprise" ON public.roles;
    DROP POLICY IF EXISTS "Enterprise admins can manage roles" ON public.roles;
    DROP POLICY IF EXISTS "Users can read roles" ON public.roles;
    DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
    
    -- Drop policies for user_roles table
    DROP POLICY IF EXISTS "Users can view user roles in their enterprise" ON public.user_roles;
    DROP POLICY IF EXISTS "Enterprise admins can manage user roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Users can read user roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
    
    -- Drop policies for role_permissions table
    DROP POLICY IF EXISTS "Users can view role permissions" ON public.role_permissions;
    DROP POLICY IF EXISTS "Users can view role permissions in their enterprise" ON public.role_permissions;
    DROP POLICY IF EXISTS "Enterprise admins can manage role permissions" ON public.role_permissions;
    DROP POLICY IF EXISTS "Users can read role permissions" ON public.role_permissions;
    DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_enterprise_id UUID, p_user_id UUID)
RETURNS TABLE (permission_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT rp.permission::TEXT
    FROM user_roles ur
    INNER JOIN roles r ON r.id = ur.role_id
    INNER JOIN role_permissions rp ON rp.role_id = r.id
    WHERE ur.enterprise_id = p_enterprise_id
    AND ur.user_id = p_user_id;
END;
$$;

-- Add RLS policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Users can read roles" ON public.roles
    FOR SELECT
    USING (enterprise_id IN (
        SELECT enterprise_id FROM user_roles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage roles" ON public.roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND ur.enterprise_id = roles.enterprise_id
            AND rp.permission = 'roles.create'::app_permission
        )
    );

-- User roles policies
CREATE POLICY "Users can read user roles" ON public.user_roles
    FOR SELECT
    USING (enterprise_id IN (
        SELECT enterprise_id FROM user_roles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND ur.enterprise_id = user_roles.enterprise_id
            AND rp.permission = 'roles.create'::app_permission
        )
    );

-- Role permissions policies
CREATE POLICY "Users can read role permissions" ON public.role_permissions
    FOR SELECT
    USING (
        role_id IN (
            SELECT r.id FROM roles r
            INNER JOIN user_roles ur ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            INNER JOIN role_permissions rp ON rp.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.enterprise_id IN (
                SELECT r2.enterprise_id FROM roles r2
                WHERE r2.id = role_permissions.role_id
            )
            AND rp.permission = 'roles.create'::app_permission
        )
    );
