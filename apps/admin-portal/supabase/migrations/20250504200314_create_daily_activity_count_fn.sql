-- Add the SQL definition for the get_daily_activity_counts function
CREATE OR REPLACE FUNCTION get_daily_activity_counts(p_enterprise_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone)
RETURNS TABLE(activity_date date, activity_count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at AT TIME ZONE 'UTC') AS activity_date,
    COUNT(*) AS activity_count
  FROM
    activity_logs
  WHERE
    enterprise_id = p_enterprise_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date
  GROUP BY
    activity_date
  ORDER BY
    activity_date;
END;
$$;
