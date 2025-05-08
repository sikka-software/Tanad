-- Drop the existing incorrect view
DROP VIEW IF EXISTS user_permissions_view;

-- Create the correct user_permissions_view
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT DISTINCT
    m.profile_id AS user_id,
    p.id AS permission_id,
    p.permission::text AS permission_name,
    m.role_id,
    r.name AS role_name,
    m.enterprise_id,
    r.is_system
FROM
    memberships m
JOIN
    roles r ON m.role_id = r.id
JOIN
    permissions p ON r.id = p.role_id;
