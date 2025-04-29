-- Drop existing foreign key constraints
ALTER TABLE public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;

-- Add new foreign key constraints with ON DELETE CASCADE
ALTER TABLE public.role_permissions 
  ADD CONSTRAINT role_permissions_role_id_fkey 
  FOREIGN KEY (role_id) 
  REFERENCES public.roles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_roles 
  ADD CONSTRAINT user_roles_role_id_fkey 
  FOREIGN KEY (role_id) 
  REFERENCES public.roles(id) 
  ON DELETE CASCADE;

-- Add table comments
COMMENT ON TABLE public.role_permissions IS 'Stores permissions assigned to roles. When a role is deleted, all associated permissions are automatically removed.';
COMMENT ON TABLE public.user_roles IS 'Maps users to their assigned roles. When a role is deleted, all user associations are automatically removed.';

-- Create RLS policy for role_permissions
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.role_permissions;
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
