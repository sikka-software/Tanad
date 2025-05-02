CREATE OR REPLACE VIEW public.user_permissions_view AS
SELECT
    m.profile_id AS user_id,
    m.enterprise_id,
    p.permission AS permission_id -- Using the text permission string as the 'id'
FROM
    public.memberships m
JOIN
    public.permissions p ON m.role_id = p.role_id;

