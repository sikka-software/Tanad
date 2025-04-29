-- Drop existing objects
DROP TABLE IF EXISTS public.user_role_permissions CASCADE;

-- Create table to handle the relationship
CREATE TABLE public.user_role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enterprise_id uuid NOT NULL REFERENCES public.enterprises(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    role_name text NOT NULL,
    permission_id uuid NOT NULL REFERENCES public.role_permissions(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    UNIQUE(user_id, role_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.user_role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own role permissions"
    ON public.user_role_permissions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Function to sync the permissions table
CREATE OR REPLACE FUNCTION sync_user_role_permissions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clear existing entries that might be affected
    DELETE FROM public.user_role_permissions
    WHERE role_id IN (
        SELECT DISTINCT r.id 
        FROM public.roles r
        WHERE r.id IN (
            SELECT ur.role_id FROM public.user_roles ur
            UNION
            SELECT rp.role_id FROM public.role_permissions rp
        )
    );

    -- Insert fresh data
    INSERT INTO public.user_role_permissions (
        user_id,
        enterprise_id,
        role_id,
        role_name,
        permission_id,
        permission
    )
    SELECT DISTINCT
        ur.user_id,
        ur.enterprise_id,
        ur.role_id,
        r.name,
        rp.id,
        rp.permission
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id;

    RETURN NULL;
END;
$$;

-- Create triggers to keep the table in sync
DROP TRIGGER IF EXISTS sync_user_role_permissions_user_roles ON public.user_roles;
CREATE TRIGGER sync_user_role_permissions_user_roles
    AFTER INSERT OR UPDATE OR DELETE
    ON public.user_roles
    FOR EACH STATEMENT
    EXECUTE FUNCTION sync_user_role_permissions();

DROP TRIGGER IF EXISTS sync_user_role_permissions_roles ON public.roles;
CREATE TRIGGER sync_user_role_permissions_roles
    AFTER INSERT OR UPDATE OR DELETE
    ON public.roles
    FOR EACH STATEMENT
    EXECUTE FUNCTION sync_user_role_permissions();

DROP TRIGGER IF EXISTS sync_user_role_permissions_role_permissions ON public.role_permissions;
CREATE TRIGGER sync_user_role_permissions_role_permissions
    AFTER INSERT OR UPDATE OR DELETE
    ON public.role_permissions
    FOR EACH STATEMENT
    EXECUTE FUNCTION sync_user_role_permissions();

-- Update role_permissions policy to be simpler
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.role_permissions;
CREATE POLICY "Enable read access for authenticated users" ON public.role_permissions
FOR SELECT
USING (
    role_id IN (
        SELECT role_id 
        FROM public.user_roles 
        WHERE user_id = auth.uid()
    )
);

-- Initial population of the table
INSERT INTO public.user_role_permissions (
    user_id,
    enterprise_id,
    role_id,
    role_name,
    permission_id,
    permission
)
SELECT DISTINCT
    ur.user_id,
    ur.enterprise_id,
    ur.role_id,
    r.name,
    rp.id,
    rp.permission
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id;
