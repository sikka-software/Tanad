-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Modify the get_or_create_role function to use table aliases
CREATE OR REPLACE FUNCTION get_or_create_role(role_name text, enterprise_id uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  role_id uuid;
BEGIN
  -- Try to find existing role with table alias
  SELECT r.id INTO role_id
  FROM roles r
  WHERE r.name = role_name 
  AND r.enterprise_id = get_or_create_role.enterprise_id;
  
  -- If role doesn't exist, create it
  IF role_id IS NULL THEN
    INSERT INTO roles (name, enterprise_id)
    VALUES (role_name, get_or_create_role.enterprise_id)
    RETURNING id INTO role_id;
  END IF;
  
  RETURN role_id;
END;
$$;

-- Modify the handle_new_user function to use table aliases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_enterprise_id uuid;
  new_role_id uuid;
  user_email text;
  user_first_name text;
  user_last_name text;
BEGIN
  -- Extract email
  user_email := NEW.email;
  user_first_name := split_part(user_email, '@', 1); -- Use part before '@' as first name
  user_last_name := 'User'; -- Default last name

  -- Check if user is an enterprise owner
  IF (NEW.raw_user_meta_data->>'enterprise_owner')::boolean = true THEN
    -- Create a new enterprise for enterprise owners
    INSERT INTO public.enterprises (name, email, is_active)
    VALUES (user_first_name || '''s Enterprise', user_email, true)
    RETURNING id INTO new_enterprise_id;

    -- Get or create the superadmin role
    new_role_id := get_or_create_role('superadmin', new_enterprise_id);

    -- Create the user's profile
    INSERT INTO public.profiles (
      id,
      user_id,
      enterprise_id,
      email,
      first_name,
      last_name,
      role
    )
    VALUES (
      NEW.id,
      NEW.id,
      new_enterprise_id,
      user_email,
      user_first_name,
      user_last_name,
      'superadmin'
    );

    -- Add the user to user_roles with role_id
    INSERT INTO public.user_roles (user_id, role_id, enterprise_id)
    VALUES (NEW.id, new_role_id, new_enterprise_id);
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
