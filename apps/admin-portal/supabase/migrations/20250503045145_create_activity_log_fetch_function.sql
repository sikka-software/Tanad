-- supabase/migrations/20250503045145_create_activity_log_fetch_function.sql

CREATE OR REPLACE FUNCTION get_activity_logs_with_user_email(p_enterprise_id uuid)
RETURNS TABLE (
    id uuid,
    enterprise_id uuid,
    user_id uuid,
    action_type activity_log_action_type,
    target_type activity_target_type,
    target_id uuid,
    target_name text,
    details jsonb,
    created_at timestamptz,
    user_email text
)
LANGUAGE sql
STABLE -- Indicates the function doesn't modify the database
SECURITY DEFINER -- Allows the function to query across schemas (like auth) safely
AS $$
  SELECT
    al.id,
    al.enterprise_id,
    al.user_id,
    al.action_type,
    al.target_type,
    al.target_id,
    al.target_name,
    al.details,
    al.created_at,
    p.email AS user_email
  FROM
    public.activity_logs al
  LEFT JOIN auth.users u ON al.user_id = u.id -- Join with auth.users first
  LEFT JOIN public.profiles p ON u.id = p.id -- Then join profiles using the auth user ID
  WHERE
    al.enterprise_id = p_enterprise_id
  ORDER BY
    al.created_at DESC;
$$;

-- Grant execution permission to the authenticated role
-- Adjust 'authenticated' if you use a different role for logged-in users
GRANT EXECUTE ON FUNCTION public.get_activity_logs_with_user_email(uuid) TO authenticated;

-- Optional: Grant to service_role if needed for server-side operations
-- GRANT EXECUTE ON FUNCTION public.get_activity_logs_with_user_email(uuid) TO service_role;
