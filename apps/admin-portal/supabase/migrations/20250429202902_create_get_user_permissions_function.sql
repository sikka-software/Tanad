CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID, enterprise_id UUID)
RETURNS TABLE (permission app_permission) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT rp.permission
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  JOIN role_permissions rp ON rp.role = r.name
  WHERE ur.user_id = $1
  AND ur.enterprise_id = $2;
END;
$$ LANGUAGE plpgsql;
