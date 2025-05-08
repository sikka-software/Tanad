-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_activity_logs_with_user_email(uuid);

-- Recreate the function with the added user_full_name column
CREATE FUNCTION public.get_activity_logs_with_user_email(p_enterprise_id uuid)
 RETURNS TABLE(id uuid, enterprise_id uuid, user_id uuid, action_type activity_log_action_type, target_type activity_target_type, target_id uuid, target_name text, details jsonb, created_at timestamp with time zone, user_email text, user_full_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
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
    p.email AS user_email,
    p.full_name AS user_full_name
  FROM
    public.activity_logs al
  LEFT JOIN auth.users u ON al.user_id = u.id
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE
    al.enterprise_id = p_enterprise_id
  ORDER BY
    al.created_at DESC;
$function$;
