-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to run with elevated privileges
SET search_path = public
AS $$
DECLARE
  new_enterprise_id uuid;
  user_email text;
  user_first_name text;
  user_last_name text;
BEGIN
  -- Extract email and derive basic name parts from it
  user_email := NEW.email;
  user_first_name := 'User'; -- Default first name
  user_last_name := split_part(user_email, '@', 1); -- Use part before '@' as last name

  -- Create a new enterprise for the user
  INSERT INTO public.enterprises (name, email, is_active)
  VALUES ('My Enterprise', user_email, true)
  RETURNING id INTO new_enterprise_id;

  -- Create the user's profile, linking to the new user and enterprise
  INSERT INTO public.profiles (id, user_id, enterprise_id, email, first_name, last_name, role)
  VALUES (
    NEW.id, -- Use the user's ID from auth.users as the profile ID
    NEW.id, -- Link to the user_id
    new_enterprise_id, -- Link to the newly created enterprise
    user_email,
    user_first_name,
    user_last_name,
    'superadmin' -- Set the initial role in the profile (can also be derived from user_roles)
  );

  -- Add the user to the user_roles table for the new enterprise
  INSERT INTO public.user_roles (user_id, enterprise_id, role)
  VALUES (NEW.id, new_enterprise_id, 'superadmin');

  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Drop existing trigger if it exists

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
