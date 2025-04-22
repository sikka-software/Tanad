-- Drop all existing enterprise policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON enterprises;
DROP POLICY IF EXISTS "Enable read access for users" ON enterprises;
DROP POLICY IF EXISTS "Enable update for admins" ON enterprises;
DROP POLICY IF EXISTS "Enable delete for admins" ON enterprises;
DROP POLICY IF EXISTS "Enable insert for signup" ON enterprises;
DROP POLICY IF EXISTS "Enable read for users" ON enterprises;
DROP POLICY IF EXISTS "Enable update for owners" ON enterprises;
DROP POLICY IF EXISTS "Enable delete for owners" ON enterprises;

-- Create new policies
-- Allow authenticated users to create enterprises (needed for signup)
CREATE POLICY "Enable insert for authenticated users"
ON enterprises
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to read enterprises they have access to through user_roles
CREATE POLICY "Enable read access for users"
ON enterprises
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND enterprise_id = enterprises.id
    )
);

-- Allow superadmins to update their enterprises
CREATE POLICY "Enable update for superadmins"
ON enterprises
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND enterprise_id = enterprises.id
        AND role = 'superadmin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND enterprise_id = enterprises.id
        AND role = 'superadmin'
    )
);

-- Allow superadmins to delete their enterprises
CREATE POLICY "Enable delete for superadmins"
ON enterprises
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND enterprise_id = enterprises.id
        AND role = 'superadmin'
    )
); 