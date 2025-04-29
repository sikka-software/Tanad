-- First get the superadmin role ID
DO $$ 
DECLARE
    superadmin_role_id uuid;
BEGIN
    -- Get the superadmin role ID
    SELECT id INTO superadmin_role_id
    FROM public.roles
    WHERE name = 'superadmin';

    -- If superadmin role doesn't exist, create it
    IF superadmin_role_id IS NULL THEN
        INSERT INTO public.roles (name)
        VALUES ('superadmin')
        RETURNING id INTO superadmin_role_id;
    END IF;

    -- Insert all permissions for superadmin role
    INSERT INTO public.role_permissions (role_id, permission)
    SELECT superadmin_role_id, permission
    FROM unnest(enum_range(NULL::app_permission)) AS permission
    ON CONFLICT (role_id, permission) DO NOTHING;
END $$;
