create or replace function public.set_user_id_for_session(user_id uuid)
returns void
language plpgsql
security definer -- Or invoker, depending on your RLS needs
set search_path = public
as $$
begin
  -- Use perform to execute the SET command
  -- Ensure the variable name matches what the trigger expects ('session_vars.user_id')
  -- Convert uuid to text for set_config
  perform set_config('session_vars.user_id', user_id::text, true); -- true for is_local
end;
$$;
