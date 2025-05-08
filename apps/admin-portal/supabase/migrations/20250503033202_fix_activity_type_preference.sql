-- Recreate the desired enum type
CREATE TYPE public.activity_log_action_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Alter the table to use the correct enum type
-- This assumes the column currently exists and holds compatible values (like 'INSERT', 'UPDATE', 'DELETE')
-- If the column was previously using activity_action_type, the cast should work.
ALTER TABLE public.activity_logs 
ALTER COLUMN action_type TYPE public.activity_log_action_type 
USING action_type::text::public.activity_log_action_type;

-- Update the trigger function to use the correct enum type
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
    TG_OP::public.activity_log_action_type, -- Use the correct enum
    TG_TABLE_NAME::text,
    new.id,
    v_old_data,
    v_new_data
  );

  return coalesce(new, old);
end;
$$;

-- Drop the incorrect enum type
DROP TYPE public.activity_action_type;
