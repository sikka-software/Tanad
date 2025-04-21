-- Drop existing objects first
DROP POLICY IF EXISTS "SUPERADMINS CAN MANAGE PROFILES" ON profiles;
DROP POLICY IF EXISTS "SUPERADMINS CAN MANAGE ENTERPRISES" ON enterprises;
DROP POLICY IF EXISTS "ACCOUNTING CAN MANAGE INVOICES" ON invoices;
DROP POLICY IF EXISTS "ACCOUNTING CAN MANAGE PRODUCTS" ON products;
DROP POLICY IF EXISTS "ACCOUNTING CAN MANAGE QUOTES" ON quotes;
DROP POLICY IF EXISTS "HR CAN MANAGE EMPLOYEES" ON employees;
DROP POLICY IF EXISTS "HR CAN MANAGE SALARIES" ON salaries;

DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.user_roles;

DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create enum types
CREATE TYPE public.app_permission AS ENUM (
  'profiles.manage',
  'enterprises.manage',
  'invoices.manage',
  'products.manage',
  'quotes.manage',
  'employees.manage',
  'salaries.manage',
  'documents.manage',
  'templates.manage',
  'employee_requests.manage',
  'job_listings.manage',
  'offices.manage',
  'expenses.manage',
  'departments.manage',
  'warehouses.manage',
  'vendors.manage',
  'clients.manage',
  'companies.manage',
  'branches.manage'
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
  ('superadmin', 'profiles.manage'),
  ('superadmin', 'enterprises.manage'),
  ('superadmin', 'invoices.manage'),
  ('superadmin', 'products.manage'),
  ('superadmin', 'quotes.manage'),
  ('superadmin', 'employees.manage'),
  ('superadmin', 'salaries.manage'),
  ('superadmin', 'documents.manage'),
  ('superadmin', 'templates.manage'),
  ('superadmin', 'employee_requests.manage'),
  ('superadmin', 'job_listings.manage'),
  ('superadmin', 'offices.manage'),
  ('superadmin', 'expenses.manage'),
  ('superadmin', 'departments.manage'),
  ('superadmin', 'warehouses.manage'),
  ('superadmin', 'vendors.manage'),
  ('superadmin', 'clients.manage'),
  ('superadmin', 'companies.manage'),
  ('superadmin', 'branches.manage'),
  ('admin', 'invoices.manage'),
  ('admin', 'products.manage'),
  ('admin', 'quotes.manage'),
  ('admin', 'documents.manage'),
  ('admin', 'templates.manage'),
  ('admin', 'employee_requests.manage'),
  ('admin', 'job_listings.manage'),
  ('admin', 'offices.manage'),
  ('admin', 'expenses.manage'),
  ('admin', 'departments.manage'),
  ('admin', 'warehouses.manage'),
  ('admin', 'vendors.manage'),
  ('admin', 'clients.manage'),
  ('admin', 'companies.manage'),
  ('admin', 'branches.manage'),
  ('accounting', 'invoices.manage'),
  ('accounting', 'products.manage'),
  ('accounting', 'quotes.manage'),
  ('accounting', 'expenses.manage'),
  ('hr', 'employees.manage'),
  ('hr', 'salaries.manage'),
  ('hr', 'employee_requests.manage'),
  ('hr', 'departments.manage')
ON CONFLICT (role, permission) DO NOTHING;

-- Create policies
CREATE POLICY "SUPERADMINS CAN MANAGE PROFILES"
  ON profiles FOR ALL
  TO authenticated
  USING (authorize('profiles.manage'::app_permission));

CREATE POLICY "SUPERADMINS CAN MANAGE ENTERPRISES"
  ON enterprises FOR ALL
  TO authenticated
  USING (authorize('enterprises.manage'::app_permission));

CREATE POLICY "ACCOUNTING CAN MANAGE INVOICES"
  ON invoices FOR ALL
  TO authenticated
  USING (authorize('invoices.manage'::app_permission, enterprise_id));

CREATE POLICY "ACCOUNTING CAN MANAGE PRODUCTS"
  ON products FOR ALL
  TO authenticated
  USING (authorize('products.manage'::app_permission, enterprise_id));

CREATE POLICY "ACCOUNTING CAN MANAGE QUOTES"
  ON quotes FOR ALL
  TO authenticated
  USING (authorize('quotes.manage'::app_permission, enterprise_id));

CREATE POLICY "HR CAN MANAGE EMPLOYEES"
  ON employees FOR ALL
  TO authenticated
  USING (authorize('employees.manage'::app_permission, enterprise_id));

CREATE POLICY "HR CAN MANAGE SALARIES"
  ON salaries FOR ALL
  TO authenticated
  USING (authorize('salaries.manage'::app_permission, enterprise_id));

-- Create policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON user_roles;

CREATE POLICY "Only superadmins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

-- Create policies for role_permissions table
CREATE POLICY "Only superadmins can manage role permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  ); 