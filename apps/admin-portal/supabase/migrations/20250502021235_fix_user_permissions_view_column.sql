-- Drop potentially conflicting old views
DROP VIEW IF EXISTS user_role_permissions;
DROP VIEW IF EXISTS user_permissions_view;

-- Redefine user_permissions_view to include permission_id
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT DISTINCT
    ur.user_id,
    p.id AS permission_id, -- Add the permission ID column (from permissions table)
    p.permission::text    -- Keep the text representation (from permissions table)
FROM user_roles ur
JOIN permissions p ON p.role_id = ur.role_id -- Use 'permissions' table
WHERE ur.user_id = auth.uid();
