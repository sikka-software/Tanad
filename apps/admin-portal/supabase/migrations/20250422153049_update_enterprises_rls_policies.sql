-- First, let's enable the postgres extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.enterprises;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.enterprises;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.enterprises;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.enterprises;

-- Temporarily disable RLS to ensure we can create the initial enterprise
ALTER TABLE public.enterprises DISABLE ROW LEVEL SECURITY;

-- Create a more permissive insert policy
CREATE POLICY "Enable insert for service role"
ON public.enterprises
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create a more permissive insert policy for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON public.enterprises
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Read policy
CREATE POLICY "Enable read access for users"
ON public.enterprises
FOR SELECT
TO authenticated
USING (true);

-- Update policy for admins
CREATE POLICY "Enable update for admins"
ON public.enterprises
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.enterprise_id = id 
        AND ur.user_id = auth.uid()
        AND ur.role = 'superadmin'
    )
);

-- Delete policy for admins
CREATE POLICY "Enable delete for admins"
ON public.enterprises
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.enterprise_id = id 
        AND ur.user_id = auth.uid()
        AND ur.role = 'superadmin'
    )
);

-- Re-enable RLS
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;