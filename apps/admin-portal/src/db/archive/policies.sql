-- Enable Row-Level Security on all tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own enterprise" ON enterprises;
DROP POLICY IF EXISTS "Users can update their own enterprise" ON enterprises;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view their own employees" ON employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own salaries" ON salaries;
DROP POLICY IF EXISTS "Users can update their own salaries" ON salaries;
DROP POLICY IF EXISTS "Users can view their own user data" ON auth.users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON auth.users;
DROP POLICY IF EXISTS "Superadmins can insert users" ON auth.users;
DROP POLICY IF EXISTS "Users can manage their own roles" ON auth.users;
DROP POLICY IF EXISTS "Superadmins can manage all users" ON auth.users;
DROP POLICY IF EXISTS "Users can create enterprises" ON enterprises;
DROP POLICY IF EXISTS "Users can view enterprises" ON enterprises;
DROP POLICY IF EXISTS "Users can create initial role" ON user_roles;
DROP POLICY IF EXISTS "Users can read their own branches" ON branches;
DROP POLICY IF EXISTS "Users can insert their own branches" ON branches;
DROP POLICY IF EXISTS "Users can update their own branches" ON branches;
DROP POLICY IF EXISTS "Users can delete their own branches" ON branches;
DROP POLICY IF EXISTS "Users can read their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Users can read their own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete their own companies" ON companies;
DROP POLICY IF EXISTS "Users can read their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can read their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can read invoice items through invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items through invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items through invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items through invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can read their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can read their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can insert their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can read quote items through quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can insert quote items through quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can update quote items through quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can delete quote items through quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can read their own salary records" ON salaries;
DROP POLICY IF EXISTS "Users can insert their own salary records" ON salaries;
DROP POLICY IF EXISTS "Users can update their own salary records" ON salaries;
DROP POLICY IF EXISTS "Users can delete their own salary records" ON salaries;
DROP POLICY IF EXISTS "Users can read their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can insert their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can delete their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can read their own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Users can insert their own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Users can update their own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Users can delete their own warehouses" ON warehouses;
DROP POLICY IF EXISTS "Users can view their own job listings and public ones" ON job_listings;
DROP POLICY IF EXISTS "Users can create job listings" ON job_listings;
DROP POLICY IF EXISTS "Users can update their own job listings" ON job_listings;
DROP POLICY IF EXISTS "Users can delete their own job listings" ON job_listings;
DROP POLICY IF EXISTS "Users can view job listing jobs for their listings" ON job_listing_jobs;
DROP POLICY IF EXISTS "Users can add jobs to their listings" ON job_listing_jobs;
DROP POLICY IF EXISTS "Users can update jobs in their listings" ON job_listing_jobs;
DROP POLICY IF EXISTS "Users can remove jobs from their listings" ON job_listing_jobs;
DROP POLICY IF EXISTS "Users can read their own offices" ON offices;
DROP POLICY IF EXISTS "Users can insert their own offices" ON offices;
DROP POLICY IF EXISTS "Users can update their own offices" ON offices;
DROP POLICY IF EXISTS "Users can delete their own offices" ON offices;
DROP POLICY IF EXISTS "Users can read their own departments" ON departments;
DROP POLICY IF EXISTS "Users can insert their own departments" ON departments;
DROP POLICY IF EXISTS "Users can update their own departments" ON departments;
DROP POLICY IF EXISTS "Users can delete their own departments" ON departments;
DROP POLICY IF EXISTS "Users can read department locations through departments" ON department_locations;
DROP POLICY IF EXISTS "Users can insert department locations through departments" ON department_locations;
DROP POLICY IF EXISTS "Users can update department locations through departments" ON department_locations;
DROP POLICY IF EXISTS "Users can delete department locations through departments" ON department_locations;
DROP POLICY IF EXISTS "Users can read their own employee requests" ON employee_requests;
DROP POLICY IF EXISTS "Users can insert their own employee requests" ON employee_requests;
DROP POLICY IF EXISTS "Users can update their own employee requests" ON employee_requests;
DROP POLICY IF EXISTS "Users can delete their own employee requests" ON employee_requests;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can upload their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view their own documents and documents of their entities" ON documents;
DROP POLICY IF EXISTS "Users can create documents for their entities" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create policies for auth.users
CREATE POLICY "Users can view their own user data"
  ON auth.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all users"
  ON auth.users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all users"
  ON auth.users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create initial role"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

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

-- Create policies for role_permissions
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

-- Create policies for enterprises
CREATE POLICY "Users can create enterprises"
  ON enterprises FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view enterprises"
  ON enterprises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update enterprises"
  ON enterprises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.enterprise_id = enterprises.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.enterprise_id = enterprises.id
    )
  );

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- Create policies for branches
CREATE POLICY "Users can read their own branches"
  ON branches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branches"
  ON branches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branches"
  ON branches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branches"
  ON branches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for clients
CREATE POLICY "Users can read their own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for companies
CREATE POLICY "Users can read their own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for expenses
CREATE POLICY "Users can read their own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for invoices
CREATE POLICY "Users can read their own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for invoice_items
CREATE POLICY "Users can read invoice items through invoices"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoice items through invoices"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice items through invoices"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice items through invoices"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.user_id = auth.uid()
    )
  );

-- Create policies for jobs
CREATE POLICY "Users can read their own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for products
CREATE POLICY "Users can read their own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for quotes
CREATE POLICY "Users can read their own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for quote_items
CREATE POLICY "Users can read quote items through quotes"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
      AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quote items through quotes"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
      AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quote items through quotes"
  ON quote_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
      AND q.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
      AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quote items through quotes"
  ON quote_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
      AND q.user_id = auth.uid()
    )
  );

-- Create policies for salaries
CREATE POLICY "Users can read their own salary records"
  ON salaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own salary records"
  ON salaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salary records"
  ON salaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own salary records"
  ON salaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for vendors
CREATE POLICY "Users can read their own vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors"
  ON vendors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for warehouses
CREATE POLICY "Users can read their own warehouses"
  ON warehouses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own warehouses"
  ON warehouses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warehouses"
  ON warehouses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own warehouses"
  ON warehouses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for job_listings
CREATE POLICY "Users can view their own job listings and public ones"
  ON job_listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create job listings"
  ON job_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job listings"
  ON job_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job listings"
  ON job_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for job_listing_jobs
CREATE POLICY "Users can view job listing jobs for their listings"
  ON job_listing_jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_jobs.job_listing_id
      AND jl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add jobs to their listings"
  ON job_listing_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_jobs.job_listing_id
      AND jl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update jobs in their listings"
  ON job_listing_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_jobs.job_listing_id
      AND jl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_jobs.job_listing_id
      AND jl.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove jobs from their listings"
  ON job_listing_jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_jobs.job_listing_id
      AND jl.user_id = auth.uid()
    )
  );

-- Create policies for offices
CREATE POLICY "Users can read their own offices"
  ON offices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own offices"
  ON offices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offices"
  ON offices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offices"
  ON offices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for departments
CREATE POLICY "Users can read their own departments"
  ON departments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own departments"
  ON departments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for department_locations
CREATE POLICY "Users can read department locations through departments"
  ON department_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.id = department_locations.department_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert department locations through departments"
  ON department_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.id = department_locations.department_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update department locations through departments"
  ON department_locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.id = department_locations.department_id
      AND d.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.id = department_locations.department_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete department locations through departments"
  ON department_locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.id = department_locations.department_id
      AND d.user_id = auth.uid()
    )
  );

-- Create policies for employee_requests
CREATE POLICY "Users can read their own employee requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employee requests"
  ON employee_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employee requests"
  ON employee_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for storage.objects
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
