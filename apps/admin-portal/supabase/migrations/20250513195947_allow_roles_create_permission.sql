-- Allow users with 'roles.create' permission to insert roles for their enterprise
DROP POLICY IF EXISTS "Users can create roles in their enterprise" ON public.roles;

CREATE POLICY "Users with roles.create permission can insert enterprise roles"
  ON public.roles
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_permissions_view upv
      WHERE upv.permission_name = 'roles.create'
        AND upv.user_id = auth.uid()
        AND upv.enterprise_id = enterprise_id
    )
  );
