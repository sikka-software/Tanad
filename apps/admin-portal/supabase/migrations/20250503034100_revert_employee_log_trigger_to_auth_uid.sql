-- Revert Function to handle logging employee changes using auth.uid()
create or replace function public.module_log_employee()
returns trigger
language plpgsql
security definer set search_path = public 
as $$
declare
  log_action_type public.activity_log_action_type;
  log_details jsonb;
  record_data record;
begin
  -- Determine action type based on trigger operation
  if (TG_OP = 'INSERT') then
    log_action_type := 'CREATED';
    record_data := NEW;
    log_details := jsonb_build_object('new_data', row_to_json(NEW));
  elsif (TG_OP = 'UPDATE') then
    log_action_type := 'UPDATED';
    record_data := NEW;
    -- Re-add the original diff logic (assuming it was correct)
    SELECT jsonb_object_agg(key, value)
    INTO log_details
    FROM jsonb_each(row_to_json(NEW)::jsonb) AS n(key, value)
    WHERE NOT EXISTS (
        SELECT 1
        FROM jsonb_each(row_to_json(OLD)::jsonb) AS o(okey, ovalue)
        WHERE o.okey = n.key AND o.ovalue = n.value
    );
    log_details := jsonb_build_object('changes', log_details); 
  elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    return null;
  end if;

  -- Insert into activity_logs using auth.uid()
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    auth.uid(), -- Use auth.uid() again
    log_action_type,
    'EMPLOYEE', 
    record_data.id,
    coalesce(record_data.first_name, '') || ' ' || coalesce(record_data.last_name, ''),
    log_details
  );

  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;
