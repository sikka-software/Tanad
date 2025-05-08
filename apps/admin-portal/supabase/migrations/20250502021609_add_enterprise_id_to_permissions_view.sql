-- Drop the existing view first
DROP VIEW IF EXISTS user_permissions_view;

-- Redefine user_permissions_view to include enterprise_id and is_system from roles
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT DISTINCT
    ur.user_id,
    p.id AS permission_id,   -- The permission record ID
    p.permission::text,      -- The permission name
    r.id AS role_id,         -- The role ID the permission belongs to
    r.enterprise_id,       -- The enterprise the role belongs to (or NULL if system)
    r.is_system            -- Flag indicating if it's a system role
FROM user_roles ur
JOIN permissions p ON p.role_id = ur.role_id
JOIN roles r ON r.id = p.role_id -- Join with roles table
WHERE ur.user_id = auth.uid();
