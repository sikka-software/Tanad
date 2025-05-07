
-- Creates a function that logs the activity of a module (CREATE, UPDATE, DELETE)
-- Also, creates a trigger for the function 
--
--
-- Replace the word SIKKA with the actual module name (all capital)
-- Replace the word sikka with the actual module name (singular, all lower)
-- Replace record_data.title with the name of the record. (i.e. record_data.name, record_data.code)
--
--
--
--
--

    
CREATE OR REPLACE FUNCTION public.module_log_domain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  user_id_to_log uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    log_details := jsonb_build_object('updated_data', row_to_json(NEW));
 elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'DOMAIN',
    record_data.id,
    record_data.domain_name,    
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;

exception
  when others then
    -- Only raise a warning, do not re-raise the exception
    raise warning 'Error in module_log_domain trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;
$function$;


CREATE TRIGGER trigger_domains_activity_log
AFTER INSERT OR UPDATE OR DELETE ON public.domains
FOR EACH ROW EXECUTE FUNCTION public.module_log_domain();


-- Drop existing function if needed
DROP FUNCTION IF EXISTS get_module_analytics_domain;

-- Create new function with full implementation
CREATE OR REPLACE FUNCTION get_module_analytics_domain(
  start_date TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'UTC' - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'UTC',
  time_interval TEXT DEFAULT 'day'
)
RETURNS TABLE (
  period_start TIMESTAMPTZ,
  domains_added BIGINT,
  domains_removed BIGINT,
  domains_updated BIGINT
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
    COUNT(al.*) FILTER (WHERE al.action_type = 'CREATED')::BIGINT AS domains_added,
    COUNT(al.*) FILTER (WHERE al.action_type = 'DELETED')::BIGINT AS domains_removed,
    COUNT(al.*) FILTER (WHERE al.action_type = 'UPDATED')::BIGINT AS domains_updated
  FROM time_series ts
  LEFT JOIN activity_logs al ON 
    date_trunc(time_interval, al.created_at AT TIME ZONE 'UTC') = ts.period_start
    AND al.target_type = 'DOMAIN'
    AND al.created_at BETWEEN start_date AND end_date
  GROUP BY ts.period_start
  ORDER BY ts.period_start;

EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in get_module_analytics_domain: %', SQLERRM;
    RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Set permissions
REVOKE ALL ON FUNCTION get_module_analytics_domain FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_module_analytics_domain TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS activity_logs_domain_created_at_idx
ON activity_logs (created_at)
WHERE target_type = 'DOMAIN';

CREATE INDEX IF NOT EXISTS activity_logs_domain_action_idx
ON activity_logs (action_type)
WHERE target_type = 'DOMAIN';