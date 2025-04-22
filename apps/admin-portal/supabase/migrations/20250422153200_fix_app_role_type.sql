-- Drop the type if it exists
DROP TYPE IF EXISTS app_role CASCADE;

-- Create the type
CREATE TYPE app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');

-- Recreate any dependent objects that were dropped
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, role, enterprise_id)
);

-- Recreate the handle_new_user_role function
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a superadmin role for the new user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_role(); 