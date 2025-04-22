-- Clear existing permissions for these roles to avoid duplicates if run again
DELETE FROM public.role_permissions WHERE role IN ('superadmin', 'hr', 'accounting', 'employee');

-- Superadmin Permissions (All)
INSERT INTO public.role_permissions (role, permission)
SELECT 'superadmin', permission
FROM unnest(enum_range(NULL::public.app_permission)) AS permission;

-- HR Permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('hr', 'employees.create'),
  ('hr', 'employees.read'),
  ('hr', 'employees.update'),
  ('hr', 'employees.delete'),
  ('hr', 'employees.export'),
  ('hr', 'salaries.create'),
  ('hr', 'salaries.read'),
  ('hr', 'salaries.update'),
  ('hr', 'salaries.delete'),
  ('hr', 'salaries.export'),
  ('hr', 'documents.create'),
  ('hr', 'documents.read'),
  ('hr', 'documents.update'),
  ('hr', 'documents.delete'),
  ('hr', 'documents.export'),
  ('hr', 'job_listings.create'),
  ('hr', 'job_listings.read'),
  ('hr', 'job_listings.update'),
  ('hr', 'job_listings.delete'),
  ('hr', 'job_listings.export'),
  ('hr', 'employee_requests.read'),
  ('hr', 'employee_requests.update'),
  ('hr', 'profiles.read');

-- Accounting Permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('accounting', 'invoices.create'),
  ('accounting', 'invoices.read'),
  ('accounting', 'invoices.update'),
  ('accounting', 'invoices.delete'),
  ('accounting', 'invoices.export'),
  ('accounting', 'invoices.duplicate'),
  ('accounting', 'products.create'),
  ('accounting', 'products.read'),
  ('accounting', 'products.update'),
  ('accounting', 'products.delete'),
  ('accounting', 'products.export'),
  ('accounting', 'expenses.create'),
  ('accounting', 'expenses.read'),
  ('accounting', 'expenses.update'),
  ('accounting', 'expenses.delete'),
  ('accounting', 'expenses.export'),
  ('accounting', 'expenses.duplicate'),
  ('accounting', 'vendors.create'),
  ('accounting', 'vendors.read'),
  ('accounting', 'vendors.update'),
  ('accounting', 'vendors.delete'),
  ('accounting', 'vendors.export'),
  ('accounting', 'clients.read'),
  ('accounting', 'companies.read'),
  ('accounting', 'quotes.read');

-- Employee Permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('employee', 'employee_requests.create'),
  ('employee', 'employee_requests.read'),
  ('employee', 'employee_requests.update'),
  ('employee', 'employee_requests.delete'),
  ('employee', 'profiles.read'),
  ('employee', 'profiles.update'),
  ('employee', 'documents.read'); 