-- Drop existing function if needed
DROP FUNCTION IF EXISTS get_module_analytics_employee;

-- Create new function with full implementation
CREATE OR REPLACE FUNCTION get_module_analytics_employee(
  start_date TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'UTC' - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'UTC',
  time_interval TEXT DEFAULT 'day'
)
RETURNS TABLE (
  period_start TIMESTAMPTZ,
  employees_added BIGINT,
  employees_removed BIGINT,
  employees_updated BIGINT
) AS $$
DECLARE
  interval_pattern TEXT[] := ARRAY['hour', 'day', 'week', 'month'];
BEGIN
  -- Validate time interval
  IF time_interval NOT IN (SELECT unnest(interval_pattern)) THEN
    RAISE EXCEPTION 'Invalid time interval: "%". Use hour/day/week/month', time_interval;
  END IF;

  RETURN QUERY
  WITH time_series AS (
    SELECT generate_series(
      date_trunc(time_interval, start_date),
      date_trunc(time_interval, end_date),
      ('1 ' || time_interval)::INTERVAL
    ) AS period_start
  )
  SELECT 
    ts.period_start,
    COUNT(al.*) FILTER (WHERE al.action_type = 'CREATED')::BIGINT AS employees_added,
    COUNT(al.*) FILTER (WHERE al.action_type = 'DELETED')::BIGINT AS employees_removed,
    COUNT(al.*) FILTER (WHERE al.action_type = 'UPDATED')::BIGINT AS employees_updated
  FROM time_series ts
  LEFT JOIN activity_logs al ON 
    date_trunc(time_interval, al.created_at AT TIME ZONE 'UTC') = ts.period_start
    AND al.target_type = 'EMPLOYEE'
    AND al.created_at BETWEEN start_date AND end_date
  GROUP BY ts.period_start
  ORDER BY ts.period_start;

EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in get_module_analytics_employee: %', SQLERRM;
    RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Set permissions
REVOKE ALL ON FUNCTION get_module_analytics_employee FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_module_analytics_employee TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS activity_logs_employee_created_at_idx
ON activity_logs (created_at)
WHERE target_type = 'EMPLOYEE';

CREATE INDEX IF NOT EXISTS activity_logs_employee_action_idx
ON activity_logs (action_type)
WHERE target_type = 'EMPLOYEE';