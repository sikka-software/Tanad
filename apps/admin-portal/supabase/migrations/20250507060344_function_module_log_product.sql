
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


CREATE OR REPLACE FUNCTION public.module_log_product()
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
    'PRODUCT',
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
    -- Only raise a warning, do not re-raise the exception
    raise warning 'Error in module_log_product trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;
$function$;


CREATE TRIGGER trigger_products_activity_log
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.module_log_product();
