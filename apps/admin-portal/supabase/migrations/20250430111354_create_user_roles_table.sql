CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    enterprise_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id, enterprise_id)
);

-- Alter table to match the desired schema if it exists from an older migration
DO $$
BEGIN
    -- Check if the old primary key exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_pkey' 
        AND table_name = 'user_roles'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        -- Check if the primary key columns are just user_id, role (old schema)
        IF EXISTS (
            SELECT 1 FROM information_schema.key_column_usage
            WHERE constraint_name = 'user_roles_pkey' 
            AND table_name = 'user_roles' 
            AND column_name = 'role'
        ) THEN 
            ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
        END IF;
    END IF;

    -- Drop the old 'role' column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='role') THEN
        ALTER TABLE public.user_roles DROP COLUMN role;
    END IF;

    -- Add role_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='role_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN role_id UUID;
    END IF;
    -- Ensure role_id is NOT NULL (might be needed if added above)
    ALTER TABLE public.user_roles ALTER COLUMN role_id SET NOT NULL;

    -- Add enterprise_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='enterprise_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN enterprise_id UUID;
    END IF;
    -- Ensure enterprise_id is NOT NULL (might be needed if added above)
    ALTER TABLE public.user_roles ALTER COLUMN enterprise_id SET NOT NULL;
    
    -- Ensure user_id is NOT NULL (should exist but make sure)
    ALTER TABLE public.user_roles ALTER COLUMN user_id SET NOT NULL;

    -- Add the new primary key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_pkey' 
        AND table_name = 'user_roles'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id, enterprise_id);
    END IF;
END $$;
