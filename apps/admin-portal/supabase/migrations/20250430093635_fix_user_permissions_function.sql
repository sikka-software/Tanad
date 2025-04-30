-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_permissions(uuid);
DROP FUNCTION IF EXISTS get_user_permissions(uuid, uuid);

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid, p_enterprise_id uuid)
RETURNS SETOF text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    WITH user_permissions AS (
        SELECT DISTINCT rp.permission::text
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        WHERE ur.user_id = p_user_id
        AND ur.enterprise_id = p_enterprise_id
    )
    SELECT permission FROM user_permissions;
$$;
