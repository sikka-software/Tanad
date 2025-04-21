-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS validate_department_location_trigger ON department_locations;
DROP FUNCTION IF EXISTS validate_department_location();

-- Create the trigger function
CREATE OR REPLACE FUNCTION validate_department_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_type = 'office' AND NOT EXISTS (SELECT 1 FROM offices WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid office location_id';
  ELSIF NEW.location_type = 'branch' AND NOT EXISTS (SELECT 1 FROM branches WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid branch location_id';
  ELSIF NEW.location_type = 'warehouse' AND NOT EXISTS (SELECT 1 FROM warehouses WHERE id = NEW.location_id) THEN
    RAISE EXCEPTION 'Invalid warehouse location_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER validate_department_location_trigger
BEFORE INSERT OR UPDATE ON department_locations
FOR EACH ROW
EXECUTE FUNCTION validate_department_location();

-- Drop existing RBAC triggers and functions if they exist
DROP TRIGGER IF EXISTS validate_user_role_trigger ON user_roles;
DROP TRIGGER IF EXISTS validate_role_permission_trigger ON role_permissions;
DROP FUNCTION IF EXISTS validate_user_role();
DROP FUNCTION IF EXISTS validate_role_permission();
DROP FUNCTION IF EXISTS has_permission(text, uuid);

-- Create function to validate user role assignments
CREATE OR REPLACE FUNCTION validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user exists in profiles
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.profile_id) THEN
    RAISE EXCEPTION 'Invalid profile_id';
  END IF;

  -- Check if the role exists
  IF NOT EXISTS (SELECT 1 FROM roles WHERE id = NEW.role_id) THEN
    RAISE EXCEPTION 'Invalid role_id';
  END IF;

  -- Check if the enterprise exists
  IF NOT EXISTS (SELECT 1 FROM enterprises WHERE id = NEW.enterprise_id) THEN
    RAISE EXCEPTION 'Invalid enterprise_id';
  END IF;

  -- Check if the user is already assigned this role in this enterprise
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE profile_id = NEW.profile_id 
    AND role_id = NEW.role_id 
    AND enterprise_id = NEW.enterprise_id
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'User already has this role in this enterprise';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user role validation
CREATE TRIGGER validate_user_role_trigger
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION validate_user_role();

-- Create function to validate role permission assignments
CREATE OR REPLACE FUNCTION validate_role_permission()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the role exists
  IF NOT EXISTS (SELECT 1 FROM roles WHERE id = NEW.role_id) THEN
    RAISE EXCEPTION 'Invalid role_id';
  END IF;

  -- Check if the permission exists
  IF NOT EXISTS (SELECT 1 FROM permissions WHERE id = NEW.permission_id) THEN
    RAISE EXCEPTION 'Invalid permission_id';
  END IF;

  -- Check if this role already has this permission
  IF EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role_id = NEW.role_id 
    AND permission_id = NEW.permission_id
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Role already has this permission';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role permission validation
CREATE TRIGGER validate_role_permission_trigger
BEFORE INSERT OR UPDATE ON role_permissions
FOR EACH ROW
EXECUTE FUNCTION validate_role_permission();

-- Create the has_permission function
CREATE OR REPLACE FUNCTION has_permission(permission_name text, enterprise_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.profile_id = auth.uid()
    AND ur.enterprise_id = has_permission.enterprise_id
    AND p.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;