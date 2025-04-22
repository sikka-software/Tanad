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
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create enum types first
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');
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

-- Create tables
CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE public.role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(role, permission)
);

-- Insert role permissions for superadmin (all permissions)
INSERT INTO public.role_permissions (role, permission)
SELECT 'superadmin', permission
FROM unnest(enum_range(NULL::app_permission)) AS permission;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all role permissions"
  ON public.role_permissions
  FOR SELECT
  USING (true);

-- Create functions
CREATE OR REPLACE FUNCTION public.has_role(role_name app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = role_name
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name app_permission)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = auth.uid()
    AND rp.permission = permission_name
  );
$$;

-- Create triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 