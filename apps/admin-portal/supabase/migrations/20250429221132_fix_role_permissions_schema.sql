-- Drop the existing role_permissions table
DROP TABLE IF EXISTS public.role_permissions CASCADE;

-- Create the new role_permissions table with proper structure
CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission app_permission NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(role_id, permission)
);

-- Create index on role_id
CREATE INDEX role_permissions_role_id_idx ON public.role_permissions (role_id);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view role permissions for their roles"
    ON public.role_permissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_id = role_permissions.role_id
        )
    );

-- Insert default permissions for admin role
INSERT INTO public.role_permissions (role_id, permission)
SELECT 
    r.id,
    unnest(enum_range(NULL::app_permission)) AS permission
FROM roles r
WHERE r.name = 'admin';
