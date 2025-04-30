-- Drop existing policies
DROP POLICY IF EXISTS "Users can read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a view for user enterprises to avoid recursion
CREATE OR REPLACE VIEW user_enterprises AS
SELECT DISTINCT p.user_id, p.enterprise_id
FROM profiles p;

-- Create new policies using the view instead
CREATE POLICY "Users can read user roles" ON public.user_roles
FOR SELECT TO authenticated
USING (
  enterprise_id IN (
    SELECT enterprise_id 
    FROM user_enterprises 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM user_enterprises ue
    JOIN user_roles ur ON ur.enterprise_id = ue.enterprise_id
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ue.user_id = auth.uid()
    AND ue.enterprise_id = user_roles.enterprise_id
    AND rp.permission IN ('roles.create'::app_permission, 'roles.update'::app_permission)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_enterprises ue
    JOIN user_roles ur ON ur.enterprise_id = ue.enterprise_id
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ue.user_id = auth.uid()
    AND ue.enterprise_id = user_roles.enterprise_id
    AND rp.permission IN ('roles.create'::app_permission, 'roles.update'::app_permission)
  )
);

-- Drop and recreate the get_user_permissions function with both parameter styles
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_user_permissions(enterprise_id uuid, user_id uuid);

CREATE OR REPLACE FUNCTION public.get_user_permissions(enterprise_id uuid, user_id uuid)
RETURNS TABLE (permission text)
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
  WHERE ur.enterprise_id = get_user_permissions.enterprise_id
  AND ur.user_id = get_user_permissions.user_id;
END;
$$;
