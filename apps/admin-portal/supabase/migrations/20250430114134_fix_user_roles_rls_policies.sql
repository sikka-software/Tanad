-- Drop existing policies
DROP POLICY IF EXISTS "Users can read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a function to check if a user has admin permissions in an enterprise
CREATE OR REPLACE FUNCTION public.has_enterprise_permission(
  p_enterprise_id uuid,
  p_permissions app_permission[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_enterprises ue
    JOIN user_roles ur ON ur.enterprise_id = ue.enterprise_id AND ur.user_id = ue.user_id
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ue.user_id = auth.uid()
    AND ue.enterprise_id = p_enterprise_id
    AND rp.permission = ANY(p_permissions)
  );
END;
$$;

-- Create new policies using the helper function
CREATE POLICY "Users can read user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  enterprise_id IN (
    SELECT enterprise_id 
    FROM user_enterprises 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_enterprise_permission(
    enterprise_id, 
    ARRAY['roles.create'::app_permission, 'roles.update'::app_permission]
  )
)
WITH CHECK (
  has_enterprise_permission(
    enterprise_id, 
    ARRAY['roles.create'::app_permission, 'roles.update'::app_permission]
  )
);
