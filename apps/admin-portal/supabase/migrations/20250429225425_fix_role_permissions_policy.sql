-- Drop existing policy
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.role_permissions;

-- Create new policy with proper table relationships
CREATE POLICY "Enable read access for authenticated users" ON public.role_permissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.id = role_permissions.role_id
  )
);
