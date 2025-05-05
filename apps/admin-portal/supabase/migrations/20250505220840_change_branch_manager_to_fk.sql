-- Temporarily bypass triggers and RLS for this session
SET session_replication_role = 'replica';

-- Set existing text manager values to NULL as they cannot be directly cast to UUID
ALTER TABLE public.branches
ALTER COLUMN manager SET DEFAULT NULL;

UPDATE public.branches
SET manager = NULL
WHERE manager IS NOT NULL;

-- Change the column type to UUID
-- Use USING NULL::uuid to handle potential conversion issues if column wasn't purely NULL before
ALTER TABLE public.branches
ALTER COLUMN manager TYPE uuid USING NULL::uuid;

-- Add the foreign key constraint
ALTER TABLE public.branches
ADD CONSTRAINT fk_branch_manager FOREIGN KEY (manager)
REFERENCES public.employees (id) ON DELETE SET NULL;

-- Optionally, add an index for the foreign key
CREATE INDEX idx_branches_manager ON public.branches (manager);

-- Restore the default session role
SET session_replication_role = 'origin';
