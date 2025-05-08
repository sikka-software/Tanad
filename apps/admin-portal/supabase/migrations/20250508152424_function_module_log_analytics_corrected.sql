
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
user_id_to_log := record_data.user_id;

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
-- Only raise a warning, do not re-raise the exception
raise warning 'Error in module_log_branch trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'CAR',
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
raise warning 'Error in module_log_cars trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'CLIENT',
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
raise warning 'Error in module_log_client trigger: %', sqlerrm;
raise exception 'Trigger module_log_client failed: %', sqlerrm;

end;

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
-- Capture both old and new data for updates if desired
-- log_details := jsonb_build_object('old_data', row_to_json(OLD), 'updated_data', row_to_json(NEW));
log_details := jsonb_build_object('updated_data', row_to_json(NEW));
elsif (TG_OP = 'DELETE') then
log_action_type := 'DELETED';
record_data := OLD;
log_details := jsonb_build_object('deleted_data', row_to_json(OLD));
else
return null;
end if;

-- Use the user_id from the company record
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'COMPANY', -- Set target_type to COMPANY
record_data.id,
record_data.name, -- Use company name as target_name
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
raise warning 'Error in module_log_company trigger: %', sqlerrm;
raise exception 'Trigger module_log_company failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

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
-- Use a known placeholder for easier debugging
user_id_to_log := record_data.user_id;

-- Insert into activity_logs using the potentially placeholder user_id
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log, -- Use the variable here
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

exception
when others then
-- Log any error during trigger execution (optional but helpful for debugging)
raise warning 'Error in module_log_employee trigger: %', sqlerrm;
-- Depending on requirements, you might want to still allow the original operation
-- return NEW; -- or OLD for DELETE
-- Or re-raise the error to halt the operation
raise exception 'Trigger module_log_employee failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'EMPLOYEE_REQUEST', -- Set target_type to employee request
record_data.id,
record_data.title, -- Use employee request name as target_name
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
raise warning 'Error in module_log_employee_request trigger: %', sqlerrm;
raise exception 'Trigger module_log_employee_request failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'EXPENSE',
record_data.id,
record_data.expense_number,
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
raise warning 'Error in module_log_expense trigger: %', sqlerrm;
raise exception 'Trigger module_log_expense failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'INVOICE',
record_data.id,
record_data.invoice_number,
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
raise warning 'Error in module_log_invoice trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'JOB',
record_data.id,
record_data.title,
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
raise warning 'Error in module_log_job trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'JOB_LISTING',
record_data.id,
record_data.title,  
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
raise warning 'Error in module_log_job_listing trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'OFFICE',
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
raise warning 'Error in module_log_office trigger: %', sqlerrm;
raise exception 'Trigger module_log_office failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'ONLINE_STORE',
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
raise warning 'Error in module_log_online_stores trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'PURCHASE',
record_data.id,
record_data.purchase_number,  
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
raise warning 'Error in module_log_job_listing trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'SERVER',
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
raise warning 'Error in module_log_server trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'VENDOR',
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
raise warning 'Error in module_log_vendor trigger: %', sqlerrm;
raise exception 'Trigger module_log_vendor failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'WAREHOUSE',
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
raise warning 'Error in module_log_warehouse trigger: %', sqlerrm;
raise exception 'Trigger module_log_warehouse failed: %', sqlerrm;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'WEBSITE',
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
raise warning 'Error in module_log_website trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;

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
user_id_to_log := record_data.user_id;

-- Insert into activity_logs
insert into public.activity_logs (enterprise_id, user_id, action_type, target_type, target_id, target_name, details)
values (
record_data.enterprise_id,
user_id_to_log,
log_action_type,
'WEBSITE',
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
raise warning 'Error in module_log_websites trigger: %', sqlerrm;

    -- Still return the appropriate value to allow the original operation to proceed
    if (TG_OP = 'DELETE') then
        return OLD;
    else
        return NEW;
    end if;

end;