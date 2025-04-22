-- Drop existing types if they exist
DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'accounting', 'hr');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_permission') THEN
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
    END IF;
END$$; 