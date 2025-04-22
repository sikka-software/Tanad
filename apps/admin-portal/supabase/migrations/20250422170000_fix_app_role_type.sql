-- Drop existing objects that might depend on the types
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_role();
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.app_permission CASCADE;

-- Create the app_role type
CREATE TYPE public.app_role AS ENUM (
    'superadmin',
    'admin',
    'accounting',
    'hr'
);

-- Create the app_permission type if it doesn't exist
CREATE TYPE public.app_permission AS ENUM (
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

-- Create the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    enterprise_id uuid REFERENCES enterprises(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, role, enterprise_id)
);

-- Create the role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
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

-- Insert default role permissions for superadmin
INSERT INTO public.role_permissions (role, permission)
SELECT 'superadmin'::app_role, unnest(enum_range(NULL::app_permission))
ON CONFLICT (role, permission) DO NOTHING; 