-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS validate_department_location_trigger ON department_locations;
DROP FUNCTION IF EXISTS validate_department_location();

-- Drop existing RBAC triggers and functions if they exist
DROP TRIGGER IF EXISTS validate_user_role_trigger ON user_roles;
DROP TRIGGER IF EXISTS validate_role_permission_trigger ON role_permissions;
DROP FUNCTION IF EXISTS validate_user_role();
DROP FUNCTION IF EXISTS validate_role_permission();
DROP FUNCTION IF EXISTS has_permission(text, uuid);
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_role();

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

-- Create function to validate user role assignments
CREATE OR REPLACE FUNCTION validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  -- Check if the role is valid
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = NEW.role::text AND enumtypid = 'app_role'::regtype) THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Check if the enterprise exists
  IF NEW.enterprise_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM enterprises WHERE id = NEW.enterprise_id) THEN
    RAISE EXCEPTION 'Invalid enterprise_id';
  END IF;

  -- Check if the user is already assigned this role in this enterprise
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND role = NEW.role 
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
  -- Check if the role is valid
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = NEW.role::text AND enumtypid = 'app_role'::regtype) THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Check if the permission is valid
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = NEW.permission::text AND enumtypid = 'app_permission'::regtype) THEN
    RAISE EXCEPTION 'Invalid permission';
  END IF;

  -- Check if this role already has this permission
  IF EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role = NEW.role 
    AND permission = NEW.permission
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
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    AND ur.enterprise_id = has_permission.enterprise_id
    AND rp.permission = permission_name::app_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user role creation
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a superadmin role for the new user
  INSERT INTO public.user_roles (user_id, role, enterprise_id)
  VALUES (NEW.id, 'superadmin'::app_role, NULL);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user role creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_role();

-- Create function to set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    _role public.app_role;
BEGIN
    -- Set the role
    _role := 'superadmin'::public.app_role;

    -- Log the trigger execution
    INSERT INTO public.trigger_audit_log (trigger_name, table_name, user_id, data)
    VALUES ('handle_new_user_profile', 'auth.users', NEW.id, row_to_json(NEW)::jsonb);

    -- Insert into user_roles first with explicit schema
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role);

    -- Then create the profile with explicit schema
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        first_name,
        last_name,
        role,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NULLIF(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), ''), 'New'),
        COALESCE(NULLIF(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2), ''), 'User'),
        _role,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.trigger_audit_log (trigger_name, table_name, user_id, data)
    VALUES ('handle_new_user_profile_error', 'auth.users', NEW.id, jsonb_build_object('error', SQLERRM));
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function for custom access token hook
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role public.app_role;
    user_permissions text[];
BEGIN
    -- Fetch the user role in the user_roles table
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = (event->>'user_id')::uuid;

    -- Get user permissions
    SELECT array_agg(rp.permission::text)
    INTO user_permissions
    FROM public.role_permissions rp
    WHERE rp.role = user_role;

    claims := event->'claims';
    
    IF user_role IS NOT NULL THEN
        -- Set the role claim
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
        -- Set the permissions claim
        claims := jsonb_set(claims, '{user_permissions}', to_jsonb(user_permissions));
    ELSE
        claims := jsonb_set(claims, '{user_role}', 'null');
        claims := jsonb_set(claims, '{user_permissions}', '[]');
    END IF;

    -- Update the claims object in the original event
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;