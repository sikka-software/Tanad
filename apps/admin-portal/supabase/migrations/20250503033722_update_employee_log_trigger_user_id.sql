-- Function to handle logging employee changes
create or replace function public.module_log_employee()
returns trigger
language plpgsql
-- Keep SECURITY DEFINER if needed for permissions, but be cautious.
-- If possible, SECURITY INVOKER is safer if RLS handles permissions.
security definer set search_path = public 
as $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
  session_user_id uuid; -- Variable to hold the user ID
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
     -- Create a diff of changes (simplified for brevity in edit)
     SELECT jsonb_object_agg(key, value)
     INTO log_details
     FROM jsonb_each(row_to_json(NEW)::jsonb) AS n(key, value)
     WHERE NOT EXISTS (
         SELECT 1
         FROM jsonb_each(row_to_json(OLD)::jsonb) AS o(okey, ovalue)
         WHERE o.okey = n.key AND o.ovalue = n.value
     );
     log_details := jsonb_build_object('changes', log_details); -- Simplified diff for example
  elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Get user_id from session variable
  session_user_id := current_setting('session_vars.user_id', true)::uuid;

  -- Optional: Check if user_id is NULL and handle if necessary
  -- For example, raise an exception or assign a default system user ID
  if session_user_id is null then
     raise exception 'User ID not set in session_vars.user_id for activity log';
     -- Alternatively, assign a default, e.g.:
     -- session_user_id := '00000000-0000-0000-0000-000000000000'; -- Example placeholder
  end if;

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    session_user_id, -- Use the user ID from the session variable
    log_action_type,
    'EMPLOYEE', 
    record_data.id,
    coalesce(record_data.first_name, '') || ' ' || coalesce(record_data.last_name, ''),
    log_details
  );

  return record_data; -- Return NEW for INSERT/UPDATE, OLD for DELETE might be more conventional
end;
$$;

-- Note: No need to recreate triggers if only the function body changes.
-- The existing triggers will automatically use the new function definition.
