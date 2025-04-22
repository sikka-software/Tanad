-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- Recreate the function with proper schema references
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert into user_roles first
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin'::public.app_role);

    -- Then create the profile
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
        'superadmin'::public.app_role,
        NOW()
    );
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger with proper schema reference
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();