-- Disable RLS temporarily to avoid policy conflicts
ALTER TABLE enterprises DISABLE ROW LEVEL SECURITY;

-- Drop all policies on enterprises that might reference the deprecated_role
DROP POLICY IF EXISTS "Enable update for superadmins" ON enterprises CASCADE;
DROP POLICY IF EXISTS "Enable delete for superadmins" ON enterprises CASCADE;
DROP POLICY IF EXISTS "Enable read access for users" ON enterprises CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON enterprises CASCADE;

-- Now drop the deprecated_role column
ALTER TABLE user_roles DROP COLUMN IF EXISTS deprecated_role CASCADE;

-- Re-enable RLS
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;

-- Recreate the policies using the new role system
CREATE POLICY "Enable insert for authenticated users"
ON enterprises
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for users"
ON enterprises
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for superadmins"
ON enterprises
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superadmin'
  )
);

CREATE POLICY "Enable delete for superadmins"
ON enterprises
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superadmin'
  )
);
