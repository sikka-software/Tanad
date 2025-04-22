-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.enterprises;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.enterprises;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.enterprises;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.enterprises;

-- Create RLS policies for enterprises table
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create enterprises during signup
CREATE POLICY "Enable insert for authenticated users"
ON public.enterprises
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to read enterprises they are associated with
CREATE POLICY "Enable read access for authenticated users"
ON public.enterprises
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.enterprise_id = id 
    AND ur.user_id = auth.uid()
  )
);

-- Allow users to update enterprises they are associated with
CREATE POLICY "Enable update for users based on email"
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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.enterprise_id = id 
    AND ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
  )
);

-- Allow users to delete enterprises they are associated with
CREATE POLICY "Enable delete for users based on email"
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