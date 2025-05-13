DROP POLICY IF EXISTS "Users with roles.create permission can insert enterprise roles" ON public.roles;

CREATE POLICY "Users with roles.create permission can insert enterprise roles" ON public.roles FOR INSERT TO public
WITH
    CHECK (
        EXISTS (
            SELECT
                1
            FROM
                user_permissions_view upv
            WHERE
                upv.permission_name = 'roles.create'
                AND upv.user_id = auth.uid ()
                AND upv.enterprise_id = roles.enterprise_id
        )
    );