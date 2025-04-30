-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS validate_user_role_trigger ON public.user_roles;
DROP FUNCTION IF EXISTS public.validate_user_role();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Create new validate_user_role function
CREATE OR REPLACE FUNCTION public.validate_user_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  -- Check if the role exists
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE id = NEW.role_id) THEN
    RAISE EXCEPTION 'Invalid role_id';
  END IF;

  -- Check if the enterprise exists
  IF NEW.enterprise_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM enterprises WHERE id = NEW.enterprise_id) THEN
    RAISE EXCEPTION 'Invalid enterprise_id';
  END IF;

  -- Check if the user is already assigned this role in this enterprise
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND role_id = NEW.role_id 
    AND enterprise_id = NEW.enterprise_id
  ) THEN
    RAISE EXCEPTION 'User already has this role in this enterprise';
  END IF;

  RETURN NEW;
END;
$$;

-- Create new trigger for user role validation
CREATE TRIGGER validate_user_role_trigger
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.validate_user_role();

-- Create new handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get or create the default admin role for the user's enterprise
  WITH enterprise_role AS (
    INSERT INTO public.roles (name, description, enterprise_id)
    SELECT 
      'Admin',
      'Default administrator role',
      auth.jwt() ->> 'user_metadata'::text ->> 'enterprise_id'
    WHERE auth.jwt() ->> 'user_metadata'::text ->> 'enterprise_id' IS NOT NULL
    ON CONFLICT (name, enterprise_id) DO UPDATE SET updated_at = now()
    RETURNING id
  )
  SELECT id INTO default_role_id FROM enterprise_role;

  -- If we have a role and enterprise, create the user role assignment
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, enterprise_id)
    VALUES (
      NEW.id,
      default_role_id,
      (auth.jwt() ->> 'user_metadata'::text)::jsonb ->> 'enterprise_id'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create new trigger for handling new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();
