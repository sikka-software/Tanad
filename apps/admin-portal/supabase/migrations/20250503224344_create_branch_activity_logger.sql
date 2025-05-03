-- Function to log company changes to activity_logs

CREATE OR REPLACE FUNCTION public.module_log_branch()
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
    'BRANCH',
    record_data.id,
    record_data.name,
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
    raise warning 'Error in module_log_branch trigger: %', sqlerrm;
    raise exception 'Trigger module_log_branch failed: %', sqlerrm;

end;
$function$;

-- Trigger to execute the function after changes on the companies table
CREATE OR REPLACE TRIGGER log_branch_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.module_log_branch();
