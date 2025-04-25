-- Enable RLS on enterprises table if not already enabled
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON enterprises;
DROP POLICY IF EXISTS "Enable read access for users with access to the enterprise" ON enterprises;
DROP POLICY IF EXISTS "Enable update for users with access to the enterprise" ON enterprises;
DROP POLICY IF EXISTS "Enable delete for superadmins" ON enterprises;

-- Create policies
-- Allow authenticated users to create enterprises (needed for signup)
CREATE POLICY "Enable insert for authenticated users"
ON enterprises
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to create an enterprise

-- Allow users to read enterprises they have access to
CREATE POLICY "Enable read access for users with access to the enterprise"
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

-- Allow users to update enterprises they have access to as superadmin
CREATE POLICY "Enable update for users with access to the enterprise"
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

-- Allow superadmins to delete enterprises
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