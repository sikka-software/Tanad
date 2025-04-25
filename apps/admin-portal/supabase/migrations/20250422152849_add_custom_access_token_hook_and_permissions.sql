-- Create the custom access token hook function
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role public.app_role;
  user_permissions text[];
begin
  -- Fetch the user role in the user_roles table
  select role into user_role 
  from public.user_roles 
  where user_id = (event->>'user_id')::uuid;

  -- Get user permissions
  select array_agg(rp.permission::text)
  into user_permissions
  from public.role_permissions rp
  where rp.role = user_role;

  claims := event->'claims';
  
  if user_role is not null then
    -- Set the role claim
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    -- Set the permissions claim
    claims := jsonb_set(claims, '{user_permissions}', to_jsonb(user_permissions));
  else
    claims := jsonb_set(claims, '{user_role}', 'null');
    claims := jsonb_set(claims, '{user_permissions}', '[]');
  end if;

  -- Update the claims object in the original event
  event := jsonb_set(event, '{claims}', claims);
  
  return event;
end;
$$;

-- Grant necessary permissions
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- Insert default role permissions
-- First clear existing permissions to avoid duplicates
DELETE FROM public.role_permissions;

-- Insert permissions for superadmin (all permissions)
INSERT INTO public.role_permissions (role, permission)
SELECT 'superadmin', unnest(enum_range(NULL::app_permission));

-- Insert permissions for admin (most permissions except sensitive ones)
INSERT INTO public.role_permissions (role, permission)
SELECT 'admin', permission
FROM unnest(enum_range(NULL::app_permission)) AS permission
WHERE permission::text NOT IN ('profiles.delete', 'enterprises.delete');

-- Insert permissions for accounting
INSERT INTO public.role_permissions (role, permission)
SELECT 'accounting', permission
FROM unnest(enum_range(NULL::app_permission)) AS permission
WHERE permission::text IN (
  'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete', 'invoices.export', 'invoices.duplicate',
  'expenses.create', 'expenses.read', 'expenses.update', 'expenses.delete', 'expenses.export', 'expenses.duplicate',
  'salaries.create', 'salaries.read', 'salaries.update', 'salaries.delete', 'salaries.export'
);

-- Insert permissions for HR
INSERT INTO public.role_permissions (role, permission)
SELECT 'hr', permission
FROM unnest(enum_range(NULL::app_permission)) AS permission
WHERE permission::text IN (
  'employees.create', 'employees.read', 'employees.update', 'employees.delete', 'employees.export',
  'job_listings.create', 'job_listings.read', 'job_listings.update', 'job_listings.delete', 'job_listings.export',
  'employee_requests.create', 'employee_requests.read', 'employee_requests.update', 'employee_requests.delete', 'employee_requests.export'
);