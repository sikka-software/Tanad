CREATE OR REPLACE FUNCTION public.check_user_can_create_role_in_enterprise(p_enterprise_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
BEGIN
    v_current_user_id := auth.uid(); -- Get current user's ID

    IF v_current_user_id IS NULL THEN
        RETURN FALSE; -- No authenticated user
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM
            public.memberships AS mem
        JOIN
            public.permissions AS p ON mem.role_id = p.role_id
        WHERE
            mem.profile_id = v_current_user_id
            AND mem.enterprise_id = p_enterprise_id -- Check for the specific enterprise
            AND p.permission = 'roles.create'::public.app_permission
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Optional: Consider setting a search_path for the function
-- ALTER FUNCTION public.check_user_can_create_role_in_enterprise(UUID) SET search_path = public;