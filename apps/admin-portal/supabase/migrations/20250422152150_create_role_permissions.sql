-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  CONSTRAINT role_permissions_role_permission_key UNIQUE(role, permission)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY; 