-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- First create the role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');

    -- Then create the profile using the role we just created
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
        COALESCE(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), ''),
        COALESCE(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2), ''),
        'superadmin',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Create single trigger that handles both role and profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();