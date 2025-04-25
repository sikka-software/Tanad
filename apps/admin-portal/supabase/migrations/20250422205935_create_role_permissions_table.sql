-- Check if table exists before creating
DO $outer$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'role_permissions') THEN
        -- Create role_permissions table
        CREATE TABLE role_permissions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            role TEXT NOT NULL,
            permission TEXT[] NOT NULL DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
        );

        -- Create unique index on role to ensure one permission set per role
        CREATE UNIQUE INDEX role_permissions_role_idx ON role_permissions(role);

        -- Create RLS policies
        ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

        -- Allow read access to authenticated users
        CREATE POLICY "Allow read access to authenticated users" ON role_permissions
            FOR SELECT TO authenticated
            USING (true);

        -- Allow all access to service_role only
        CREATE POLICY "Allow all access to service_role" ON role_permissions
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true);

        -- Create function to update updated_at timestamp if it doesn't exist
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $inner$
        BEGIN
            NEW.updated_at = TIMEZONE('utc', NOW());
            RETURN NEW;
        END;
        $inner$ language 'plpgsql';

        -- Create trigger to update updated_at
        CREATE TRIGGER update_role_permissions_updated_at
            BEFORE UPDATE ON role_permissions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$outer$;
