-- Drop dependent objects first
DROP FUNCTION IF EXISTS public.get_user_permissions(UUID, UUID);

-- Drop existing constraints
DO $$ BEGIN
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_enterprise_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Drop existing indexes
DROP INDEX IF EXISTS public.user_roles_user_id_idx;
DROP INDEX IF EXISTS public.user_roles_role_id_idx;
DROP INDEX IF EXISTS public.user_roles_enterprise_id_idx;

-- Drop existing policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can read user roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Drop dependent view if it exists
DROP VIEW IF EXISTS public.user_role_permissions;

-- Drop the table if it exists
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Create the table with the correct structure
CREATE TABLE public.user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    enterprise_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id, enterprise_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles (role_id);
CREATE INDEX IF NOT EXISTS user_roles_enterprise_id_idx ON public.user_roles (enterprise_id);

-- Add foreign key constraints
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_id_fkey
FOREIGN KEY (role_id) REFERENCES public.roles(id)
ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_enterprise_id_fkey
FOREIGN KEY (enterprise_id) REFERENCES public.enterprises(id)
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read user roles" ON public.user_roles
  FOR SELECT
  USING (enterprise_id IN (
    SELECT enterprise_id FROM user_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND ur.enterprise_id = user_roles.enterprise_id
      AND rp.permission = 'roles.create'::app_permission
    )
  );

-- Recreate the view
CREATE VIEW public.user_role_permissions AS
SELECT ur.user_id,
       ur.role_id,
       ur.enterprise_id,
       r.name AS role_name,
       r.description AS role_description,
       rp.permission
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
JOIN role_permissions rp ON rp.role_id = r.id;

-- Restore valid data from backup if it exists
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles_backup'
    ) THEN
        INSERT INTO public.user_roles (user_id, role_id, enterprise_id, created_at)
        SELECT urb.user_id, urb.role_id, urb.enterprise_id, urb.created_at
        FROM public.user_roles_backup urb
        INNER JOIN auth.users u ON u.id = urb.user_id
        INNER JOIN public.roles r ON r.id = urb.role_id
        INNER JOIN public.enterprises e ON e.id = urb.enterprise_id;
        
        DROP TABLE public.user_roles_backup;
    END IF;
END $$;

-- Recreate the function
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_enterprise_id UUID, p_user_id UUID)
RETURNS TABLE (permission_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT rp.permission::TEXT
  FROM user_roles ur
  INNER JOIN roles r ON r.id = ur.role_id
  INNER JOIN role_permissions rp ON rp.role_id = r.id
  WHERE ur.user_id = p_user_id
  AND ur.enterprise_id = p_enterprise_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
