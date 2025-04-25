-- First disable RLS temporarily to allow the migration
ALTER TABLE enterprises DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON enterprises;
DROP POLICY IF EXISTS "Enable read access for users with access to the enterprise" ON enterprises;
DROP POLICY IF EXISTS "Enable update for users with access to the enterprise" ON enterprises;
DROP POLICY IF EXISTS "Enable delete for superadmins" ON enterprises;
DROP POLICY IF EXISTS "Enable insert for signup" ON enterprises;
DROP POLICY IF EXISTS "Enable read for users" ON enterprises;
DROP POLICY IF EXISTS "Enable update for owners" ON enterprises;
DROP POLICY IF EXISTS "Enable delete for owners" ON enterprises;

-- Create a more permissive insert policy
CREATE POLICY "Enable insert for signup"
ON enterprises
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create read policy
CREATE POLICY "Enable read for users"
ON enterprises
FOR SELECT
TO authenticated
USING (true);

-- Create update policy for owners
CREATE POLICY "Enable update for owners"
ON enterprises
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create delete policy for owners
CREATE POLICY "Enable delete for owners"
ON enterprises
FOR DELETE
TO authenticated
USING (true);

-- Re-enable RLS
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY; 