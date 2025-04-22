
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- Create an audit table to debug trigger execution
CREATE TABLE IF NOT EXISTS public.trigger_audit_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    trigger_name text,
    table_name text,
    user_id uuid,
    executed_at timestamp with time zone DEFAULT now(),
    data jsonb
);

-- Recreate the function with logging
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate the trigger with explicit schema reference
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();

-- Ensure the trigger has the correct permissions
ALTER FUNCTION public.handle_new_user_profile() SECURITY DEFINER;