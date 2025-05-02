-- Add missing values to the app_permission enum
-- Use IF NOT EXISTS to avoid errors if values already exist

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'companies.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'companies.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'companies.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'companies.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'companies.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'companies.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.invite';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.export';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'users.duplicate';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'roles.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'roles.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'roles.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'roles.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'roles.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'roles.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'jobs.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'jobs.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'jobs.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'jobs.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'jobs.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'jobs.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'job_listings.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'job_listings.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'job_listings.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'job_listings.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'job_listings.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'job_listings.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'clients.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'clients.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'clients.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'clients.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'clients.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'clients.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'expenses.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'expenses.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'expenses.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'expenses.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'expenses.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'expenses.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'departments.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'departments.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'departments.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'departments.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'departments.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'departments.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'salaries.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'salaries.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'salaries.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'salaries.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'salaries.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'salaries.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'offices.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'offices.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'offices.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'offices.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'offices.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'offices.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'warehouses.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'warehouses.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'warehouses.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'warehouses.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'warehouses.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'warehouses.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employee_requests.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employee_requests.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employee_requests.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employee_requests.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employee_requests.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employee_requests.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'products.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'products.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'products.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'products.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'products.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'products.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'invoices.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'invoices.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'invoices.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'invoices.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'invoices.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'invoices.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quotes.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quotes.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quotes.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quotes.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quotes.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quotes.export';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'vendors.read';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'vendors.create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'vendors.delete';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'vendors.update';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'vendors.duplicate';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'vendors.export';
