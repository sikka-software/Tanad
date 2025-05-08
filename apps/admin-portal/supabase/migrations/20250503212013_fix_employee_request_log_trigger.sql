-- Fixes the module_log_employee_request trigger to prevent rollback on logging failure

CREATE OR REPLACE FUNCTION public.module_log_employee_request()
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
    -- Should not happen, but good practice to handle
    raise warning 'Unhandled TG_OP: % in module_log_employee_request', TG_OP;
    return null;
  end if;

  -- Ensure record_data is not null before proceeding
  if record_data is null then
    raise warning 'Record data is NULL in module_log_employee_request for TG_OP: %', TG_OP;
    -- Decide how to handle: maybe return null or the appropriate record (NEW/OLD)
    -- Returning the record allows the main operation to proceed without logging
    if (TG_OP = 'DELETE') then return OLD; else return NEW; end if;
  end if;

  -- Attempt to get auth.uid(), default to a placeholder if NULL
  -- Ensure user_id_to_log is never null for the INSERT constraint
  user_id_to_log := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  -- Ensure necessary fields for logging are not null
  if record_data.enterprise_id is null or record_data.id is null then
     raise warning 'NULL enterprise_id or target_id in module_log_employee_request. Skipping log insert.';
     -- Allow the original operation to succeed even if logging info is incomplete
     if (TG_OP = 'DELETE') then return OLD; else return NEW; end if;
  end if;

  -- Insert into activity_logs
  insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
  values (
    record_data.enterprise_id,
    user_id_to_log,
    log_action_type,
    'EMPLOYEE_REQUEST', -- Set target_type to employee request
    record_data.id,
    coalesce(record_data.title, 'N/A'), -- Use coalesce for target_name
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
    -- Log the error but DO NOT re-raise the exception
    raise warning 'Error inserting into activity_logs from module_log_employee_request: %. SQLSTATE: %, Detail: %', sqlerrm, sqlstate, pg_exception_detail;
    -- Allow the original DML operation to succeed
    if (TG_OP = 'DELETE') then
      return OLD;
    else
      return NEW;
    end if;
end;
$function$;

-- Grant execute permission if needed (adjust role if necessary)
GRANT EXECUTE ON FUNCTION public.module_log_employee_request() TO authenticated;
