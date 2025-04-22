-- Drop existing types if they exist
DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create enum types if they don't exist
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');

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