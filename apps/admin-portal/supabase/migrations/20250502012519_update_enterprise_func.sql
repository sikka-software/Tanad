CREATE OR REPLACE FUNCTION public.create_enterprise(
    enterprise_name TEXT,
    enterprise_email TEXT,
    enterprise_industry TEXT,
    enterprise_size TEXT
)
RETURNS uuid -- Returns the id of the newly created enterprise
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to run with the permissions of the user who defined it
SET search_path = public
AS $$
DECLARE
    new_enterprise_id uuid;
    admin_role_id uuid;
    current_user_id uuid := auth.uid(); -- Get the ID of the currently authenticated user
BEGIN
    -- Find the 'superadmin' role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'superadmin' LIMIT 1;

    -- Raise an exception if the 'superadmin' role is not found
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Superadmin role not found. Cannot create enterprise.';
    END IF;

    -- Insert the new enterprise
    INSERT INTO enterprises (name, email, industry, size)
    VALUES (enterprise_name, enterprise_email, enterprise_industry, enterprise_size)
    RETURNING id INTO new_enterprise_id;

    -- Insert the membership record linking the creator as superadmin
    INSERT INTO memberships (profile_id, enterprise_id, role_id)
    VALUES (current_user_id, new_enterprise_id, admin_role_id);

    -- Return the new enterprise's ID
    RETURN new_enterprise_id;
END;
$$;
