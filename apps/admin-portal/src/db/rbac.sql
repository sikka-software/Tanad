-- Drop existing RBAC objects
-- First drop the dependent policies
DROP POLICY IF EXISTS "Superadmins can view all users" ON auth.users;
DROP POLICY IF EXISTS "Superadmins can manage all users" ON auth.users;
DROP POLICY IF EXISTS "Users can update enterprises" ON enterprises;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can create initial role" ON user_roles;
DROP POLICY IF EXISTS "Only superadmins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Only superadmins can manage role permissions" ON role_permissions;

-- Now drop the tables and types
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.user_roles;
DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create enum types
CREATE TYPE public.app_permission AS ENUM (
  -- Profiles
  'profiles.create',
  'profiles.read',
  'profiles.update',
  'profiles.delete',
  'profiles.export',

  -- Enterprises
  'enterprises.create',
  'enterprises.read',
  'enterprises.update',
  'enterprises.delete',
  'enterprises.export',

  -- Invoices
  'invoices.create',
  'invoices.read',
  'invoices.update',
  'invoices.delete',
  'invoices.export',
  'invoices.duplicate',

  -- Products
  'products.create',
  'products.read',
  'products.update',
  'products.delete',
  'products.export',

  -- Quotes
  'quotes.create',
  'quotes.read',
  'quotes.update',
  'quotes.delete',
  'quotes.export',
  'quotes.duplicate',

  -- Employees
  'employees.create',
  'employees.read',
  'employees.update',
  'employees.delete',
  'employees.export',

  -- Salaries
  'salaries.create',
  'salaries.read',
  'salaries.update',
  'salaries.delete',
  'salaries.export',

  -- Documents
  'documents.create',
  'documents.read',
  'documents.update',
  'documents.delete',
  'documents.export',

  -- Templates
  'templates.create',
  'templates.read',
  'templates.update',
  'templates.delete',
  'templates.export',
  'templates.duplicate',

  -- Employee Requests
  'employee_requests.create',
  'employee_requests.read',
  'employee_requests.update',
  'employee_requests.delete',
  'employee_requests.export',

  -- Job Listings
  'job_listings.create',
  'job_listings.read',
  'job_listings.update',
  'job_listings.delete',
  'job_listings.export',

  -- Offices
  'offices.create',
  'offices.read',
  'offices.update',
  'offices.delete',
  'offices.export',

  -- Expenses
  'expenses.create',
  'expenses.read',
  'expenses.update',
  'expenses.delete',
  'expenses.export',
  'expenses.duplicate',

  -- Departments
  'departments.create',
  'departments.read',
  'departments.update',
  'departments.delete',
  'departments.export',

  -- Warehouses
  'warehouses.create',
  'warehouses.read',
  'warehouses.update',
  'warehouses.delete',
  'warehouses.export',

  -- Vendors
  'vendors.create',
  'vendors.read',
  'vendors.update',
  'vendors.delete',
  'vendors.export',

  -- Clients
  'clients.create',
  'clients.read',
  'clients.update',
  'clients.delete',
  'clients.export',

  -- Companies
  'companies.create',
  'companies.read',
  'companies.update',
  'companies.delete',
  'companies.export',

  -- Branches
  'branches.create',
  'branches.read',
  'branches.update',
  'branches.delete',
  'branches.export'
);

-- Create user_roles table with custom role names
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN ('superadmin', 'admin', 'accounting', 'hr') OR
    role ~ '^[a-z0-9_]+$' -- Allow custom role names with lowercase letters, numbers, and underscores
  ),
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, role, enterprise_id)
);

-- Create role_permissions table with custom role names
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL CHECK (
    role IN ('superadmin', 'admin', 'accounting', 'hr') OR
    role ~ '^[a-z0-9_]+$' -- Allow custom role names with lowercase letters, numbers, and underscores
  ),
  permission app_permission NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (role, permission)
);

-- Create the authorization function
CREATE OR REPLACE FUNCTION public.authorize(
  requested_permission app_permission,
  enterprise_id UUID DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bind_permissions int;
BEGIN
  SELECT COUNT(*)
  INTO bind_permissions
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  WHERE ur.user_id = auth.uid()
    AND rp.permission = requested_permission
    AND (enterprise_id IS NULL OR ur.enterprise_id = enterprise_id);

  RETURN bind_permissions > 0;
END;
$$;

-- Insert role permissions
INSERT INTO public.role_permissions (role, permission)
VALUES
  ('superadmin', 'profiles.create'),
  ('superadmin', 'profiles.read'),
  ('superadmin', 'profiles.update'),
  ('superadmin', 'profiles.delete'),
  ('superadmin', 'profiles.export'),
  ('superadmin', 'enterprises.create'),
  ('superadmin', 'enterprises.read'),
  ('superadmin', 'enterprises.update'),
  ('superadmin', 'enterprises.delete'),
  ('superadmin', 'enterprises.export'),
  ('superadmin', 'invoices.create'),
  ('superadmin', 'invoices.read'),
  ('superadmin', 'invoices.update'),
  ('superadmin', 'invoices.delete'),
  ('superadmin', 'invoices.export'),
  ('superadmin', 'invoices.duplicate'),
  ('superadmin', 'products.create'),
  ('superadmin', 'products.read'),
  ('superadmin', 'products.update'),
  ('superadmin', 'products.delete'),
  ('superadmin', 'products.export'),
  ('superadmin', 'quotes.create'),
  ('superadmin', 'quotes.read'),
  ('superadmin', 'quotes.update'),
  ('superadmin', 'quotes.delete'),
  ('superadmin', 'quotes.export'),
  ('superadmin', 'quotes.duplicate'),
  ('superadmin', 'employees.create'),
  ('superadmin', 'employees.read'),
  ('superadmin', 'employees.update'),
  ('superadmin', 'employees.delete'),
  ('superadmin', 'employees.export'),
  ('superadmin', 'salaries.create'),
  ('superadmin', 'salaries.read'),
  ('superadmin', 'salaries.update'),
  ('superadmin', 'salaries.delete'),
  ('superadmin', 'salaries.export'),
  ('superadmin', 'documents.create'),
  ('superadmin', 'documents.read'),
  ('superadmin', 'documents.update'),
  ('superadmin', 'documents.delete'),
  ('superadmin', 'documents.export'),
  ('superadmin', 'templates.create'),
  ('superadmin', 'templates.read'),
  ('superadmin', 'templates.update'),
  ('superadmin', 'templates.delete'),
  ('superadmin', 'templates.export'),
  ('superadmin', 'templates.duplicate'),
  ('superadmin', 'employee_requests.create'),
  ('superadmin', 'employee_requests.read'),
  ('superadmin', 'employee_requests.update'),
  ('superadmin', 'employee_requests.delete'),
  ('superadmin', 'employee_requests.export'),
  ('superadmin', 'job_listings.create'),
  ('superadmin', 'job_listings.read'),
  ('superadmin', 'job_listings.update'),
  ('superadmin', 'job_listings.delete'),
  ('superadmin', 'job_listings.export'),
  ('superadmin', 'offices.create'),
  ('superadmin', 'offices.read'),
  ('superadmin', 'offices.update'),
  ('superadmin', 'offices.delete'),
  ('superadmin', 'offices.export'),
  ('superadmin', 'expenses.create'),
  ('superadmin', 'expenses.read'),
  ('superadmin', 'expenses.update'),
  ('superadmin', 'expenses.delete'),
  ('superadmin', 'expenses.export'),
  ('superadmin', 'expenses.duplicate'),
  ('superadmin', 'departments.create'),
  ('superadmin', 'departments.read'),
  ('superadmin', 'departments.update'),
  ('superadmin', 'departments.delete'),
  ('superadmin', 'departments.export'),
  ('superadmin', 'warehouses.create'),
  ('superadmin', 'warehouses.read'),
  ('superadmin', 'warehouses.update'),
  ('superadmin', 'warehouses.delete'),
  ('superadmin', 'warehouses.export'),
  ('superadmin', 'vendors.create'),
  ('superadmin', 'vendors.read'),
  ('superadmin', 'vendors.update'),
  ('superadmin', 'vendors.delete'),
  ('superadmin', 'vendors.export'),
  ('superadmin', 'clients.create'),
  ('superadmin', 'clients.read'),
  ('superadmin', 'clients.update'),
  ('superadmin', 'clients.delete'),
  ('superadmin', 'clients.export'),
  ('superadmin', 'companies.create'),
  ('superadmin', 'companies.read'),
  ('superadmin', 'companies.update'),
  ('superadmin', 'companies.delete'),
  ('superadmin', 'companies.export'),
  ('superadmin', 'branches.create'),
  ('superadmin', 'branches.read'),
  ('superadmin', 'branches.update'),
  ('superadmin', 'branches.delete'),
  ('superadmin', 'branches.export'); 