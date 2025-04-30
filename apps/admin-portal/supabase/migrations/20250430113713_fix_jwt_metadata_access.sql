-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Create new handle_new_user_role function with fixed JWT metadata access
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id uuid;
  user_metadata jsonb;
  enterprise_id uuid;
BEGIN
  -- Get user metadata from the JWT
  user_metadata := (auth.jwt() ->> 'user_metadata')::jsonb;
  
  -- Extract enterprise_id from metadata if it exists
  enterprise_id := (user_metadata ->> 'enterprise_id')::uuid;

  -- Get or create the default admin role for the user's enterprise
  IF enterprise_id IS NOT NULL THEN
    WITH enterprise_role AS (
      INSERT INTO public.roles (name, description, enterprise_id)
      VALUES (
        'Admin',
        'Default administrator role',
        enterprise_id
      )
      ON CONFLICT (name, enterprise_id) DO UPDATE SET updated_at = now()
      RETURNING id
    )
    SELECT id INTO default_role_id FROM enterprise_role;

    -- Create the user role assignment
    IF default_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id, enterprise_id)
      VALUES (NEW.id, default_role_id, enterprise_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create new trigger for handling new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();
