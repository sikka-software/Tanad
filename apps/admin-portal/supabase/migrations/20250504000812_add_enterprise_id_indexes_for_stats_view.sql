-- Add indexes for enterprise_id on tables used in the enterprise_dashboard_stats view

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_enterprise_id ON public.invoices(enterprise_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_enterprise_id ON public.products(enterprise_id);

-- employees
CREATE INDEX IF NOT EXISTS idx_employees_enterprise_id ON public.employees(enterprise_id);

-- departments
CREATE INDEX IF NOT EXISTS idx_departments_enterprise_id ON public.departments(enterprise_id);

-- jobs
CREATE INDEX IF NOT EXISTS idx_jobs_enterprise_id ON public.jobs(enterprise_id);

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_enterprise_id ON public.clients(enterprise_id);

-- companies
CREATE INDEX IF NOT EXISTS idx_companies_enterprise_id ON public.companies(enterprise_id);

-- vendors
CREATE INDEX IF NOT EXISTS idx_vendors_enterprise_id ON public.vendors(enterprise_id);

-- offices
CREATE INDEX IF NOT EXISTS idx_offices_enterprise_id ON public.offices(enterprise_id);

-- warehouses
CREATE INDEX IF NOT EXISTS idx_warehouses_enterprise_id ON public.warehouses(enterprise_id);

-- branches
CREATE INDEX IF NOT EXISTS idx_branches_enterprise_id ON public.branches(enterprise_id);
