-- Update existing memberships with invalid or NULL role_ids to superadmin
UPDATE public.memberships
SET role_id = 'c009b2b6-c288-4ae9-b910-17497fee91ce' -- superadmin role ID
WHERE role_id IS NULL OR role_id NOT IN (SELECT id FROM public.roles);

-- Add foreign key constraint referencing roles table
ALTER TABLE public.memberships
ADD CONSTRAINT memberships_role_id_fkey
FOREIGN KEY (role_id)
REFERENCES public.roles(id)
ON DELETE RESTRICT;

-- Add an index on the new foreign key for performance
CREATE INDEX idx_memberships_role_id ON public.memberships(role_id);
