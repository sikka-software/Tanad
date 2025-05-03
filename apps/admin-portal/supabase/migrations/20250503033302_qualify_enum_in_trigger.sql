create or replace function public.log_employee_activity() 
returns trigger 
language plpgsql 
security definer
as $$
declare
  v_old_data jsonb := null;
  v_new_data jsonb := null;
begin
  if TG_OP = 'INSERT' then
    v_new_data := to_jsonb(new);
  elsif TG_OP = 'UPDATE' then
    v_old_data := to_jsonb(old);
    v_new_data := to_jsonb(new);
  elsif TG_OP = 'DELETE' then
    v_old_data := to_jsonb(old);
  end if;

  insert into public.activity_logs (
    user_id,
    enterprise_id,
    action_type,
    table_name,
    record_id,
    old_record,
    new_record
  )
  values (
    auth.uid(),
    new.enterprise_id, 
    TG_OP::public.activity_log_action_type, -- Explicitly qualify the enum
    TG_TABLE_NAME::text,
    new.id,
    v_old_data,
    v_new_data
  );

  return coalesce(new, old);
end;
$$;
