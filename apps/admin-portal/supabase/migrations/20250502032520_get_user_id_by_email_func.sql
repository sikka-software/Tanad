CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS TABLE (id uuid)
SECURITY DEFINER -- Allows function to query auth.users
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT au.id FROM auth.users au WHERE au.email = user_email;
END;
$$;
