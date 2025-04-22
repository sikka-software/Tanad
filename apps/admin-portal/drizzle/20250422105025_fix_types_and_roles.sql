
-- First, drop existing objects that depend on the types
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_role();
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);

-- Drop existing tables that depend on the types
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop the types
DROP TYPE IF EXISTS app_permission CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;

-- Create the types
CREATE TYPE app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');

CREATE TYPE app_permission AS ENUM (
    'profiles.create', 'profiles.read', 'profiles.update', 'profiles.delete', 'profiles.export',
    'enterprises.create', 'enterprises.read', 'enterprises.update', 'enterprises.delete', 'enterprises.export',
    'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete', 'invoices.export', 'invoices.duplicate',
    'products.create', 'products.read', 'products.update', 'products.delete', 'products.export',
    'quotes.create', 'quotes.read', 'quotes.update', 'quotes.delete', 'quotes.export', 'quotes.duplicate',
    'employees.create', 'employees.read', 'employees.update', 'employees.delete', 'employees.export',
    'salaries.create', 'salaries.read', 'salaries.update', 'salaries.delete', 'salaries.export',
    'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.export',
    'templates.create', 'templates.read', 'templates.update', 'templates.delete', 'templates.export', 'templates.duplicate',
    'employee_requests.create', 'employee_requests.read', 'employee_requests.update', 'employee_requests.delete', 'employee_requests.export',
    'job_listings.create', 'job_listings.read', 'job_listings.update', 'job_listings.delete', 'job_listings.export',
    'offices.create', 'offices.read', 'offices.update', 'offices.delete', 'offices.export',
    'expenses.create', 'expenses.read', 'expenses.update', 'expenses.delete', 'expenses.export', 'expenses.duplicate',
    'departments.create', 'departments.read', 'departments.update', 'departments.delete', 'departments.export',
    'warehouses.create', 'warehouses.read', 'warehouses.update', 'warehouses.delete', 'warehouses.export',
    'vendors.create', 'vendors.read', 'vendors.update', 'vendors.delete', 'vendors.export',
    'clients.create', 'clients.read', 'clients.update', 'clients.delete', 'clients.export',
    'companies.create', 'companies.read', 'companies.update', 'companies.delete', 'companies.export',
    'branches.create', 'branches.read', 'branches.update', 'branches.delete', 'branches.export'
);

-- Create the tables
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, role, enterprise_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role app_role NOT NULL,
    permission app_permission NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(role, permission)
);

-- Create the handle_new_user_role function
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a superadmin role for the new user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_role();

-- Create the custom access token hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role public.app_role;
    user_permissions text[];
BEGIN
    -- Fetch the user role in the user_roles table
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = (event->>'user_id')::uuid;

    -- Get user permissions
    SELECT array_agg(rp.permission::text)
    INTO user_permissions
    FROM public.role_permissions rp
    WHERE rp.role = user_role;

    claims := event->'claims';
    
    IF user_role IS NOT NULL THEN
        -- Set the role claim
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
        -- Set the permissions claim
        claims := jsonb_set(claims, '{user_permissions}', to_jsonb(user_permissions));
    ELSE
        claims := jsonb_set(claims, '{user_role}', 'null');
        claims := jsonb_set(claims, '{user_permissions}', '[]');
    END IF;

    -- Update the claims object in the original event
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;

-- Grant necessary permissions
GRANT usage ON schema public TO supabase_auth_admin;
GRANT execute ON function public.custom_access_token_hook TO supabase_auth_admin;
REVOKE execute ON function public.custom_access_token_hook FROM authenticated, anon, public;

-- Insert default role permissions
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