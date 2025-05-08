-- Add description column
ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS description text;

-- Add is_system column
ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false NOT NULL;

-- Update existing system roles to set is_system = true
UPDATE public.roles
SET is_system = true
WHERE name IN ('superadmin', 'admin', 'viewer');
