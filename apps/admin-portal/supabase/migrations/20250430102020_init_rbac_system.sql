-- Create app_permission type
DO $$ BEGIN
    CREATE TYPE app_permission AS ENUM (
        'roles.manage',
        'users.manage',
        'enterprises.manage'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name, enterprise_id)
);

-- Create role_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission app_permission NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role_id, permission)
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL,
    enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role_id, enterprise_id)
);

-- Insert default role permissions for admin role
INSERT INTO public.roles (name, description, enterprise_id)
SELECT 
    'Admin',
    'Administrator role with full permissions',
    id
FROM public.enterprises
ON CONFLICT (name, enterprise_id) DO NOTHING;

-- Insert default permissions for admin role
INSERT INTO public.role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM public.roles r
CROSS JOIN (
    SELECT unnest(enum_range(NULL::app_permission)) AS permission
) p
WHERE r.name = 'Admin'
ON CONFLICT (role_id, permission) DO NOTHING; 