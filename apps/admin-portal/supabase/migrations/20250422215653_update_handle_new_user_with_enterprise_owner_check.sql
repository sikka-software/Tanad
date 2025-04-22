-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Modify the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_enterprise_id uuid;
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

    -- Add the user to user_roles
    INSERT INTO public.user_roles (user_id, enterprise_id, role)
    VALUES (NEW.id, new_enterprise_id, 'superadmin');
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
