
-- Function to handle logging employee changes
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
     -- Create a diff of changes
     SELECT jsonb_object_agg(key, value)
     INTO log_details
     FROM jsonb_each(row_to_json(NEW)::jsonb) AS n(key, value)
     WHERE NOT EXISTS (
         SELECT 1
         FROM jsonb_each(row_to_json(OLD)::jsonb) AS o(okey, ovalue)
         WHERE o.okey = n.key AND o.ovalue = n.value
     );
     -- Add old values for changed keys
     log_details := jsonb_build_object(
       'changes', log_details,
       'old_data', (
           SELECT jsonb_object_agg(key, value)
           FROM jsonb_each(row_to_json(OLD)::jsonb)
           WHERE log_details->'changes' ? key
        )
     );
  elsif (TG_OP = 'DELETE') then
    log_action_type := 'DELETED';
    record_data := OLD;
    log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
  else
    -- Should not happen for INSERT, UPDATE, DELETE triggers
    return null;
  end if;

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    auth.uid(), -- Get the user ID of the person performing the action
    log_action_type,
    'EMPLOYEE', -- Assuming 'EMPLOYEE' is a valid enum value in activity_log_target_type
    record_data.id,
    coalesce(record_data.first_name, '') || ' ' || coalesce(record_data.last_name, ''), -- Combine first and last name
    log_details
  );

  return record_data;
end;
$$;

-- Trigger for INSERT operations on employees
create trigger log_employee_insert_trigger
after insert on public.employees
for each row execute function public.module_log_employee();

-- Trigger for UPDATE operations on employees
create trigger log_employee_update_trigger
after update on public.employees
for each row
-- Only trigger if relevant data actually changed
when (OLD.* is distinct from NEW.*)
execute function public.module_log_employee();

-- Trigger for DELETE operations on employees
create trigger log_employee_delete_trigger
after delete on public.employees
for each row execute function public.module_log_employee();
