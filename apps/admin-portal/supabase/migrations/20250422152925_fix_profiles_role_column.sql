-- First, make sure the app_role type exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');
    END IF;
END $$;

-- Add the role column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role app_role;
    END IF;
END $$;

-- Update existing profiles to have a role based on user_roles
UPDATE profiles p
SET role = ur.role
FROM user_roles ur
WHERE p.id = ur.user_id
AND p.role IS NULL;