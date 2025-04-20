-- Enable Row-Level Security on all tables
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


-- Drop existing policies before recreating
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
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
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

-- TEMPLATES POLICIES
CREATE POLICY "USERS CAN VIEW THEIR OWN TEMPLATES"
  ON templates FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "USERS CAN CREATE THEIR OWN TEMPLATES"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "USERS CAN UPDATE THEIR OWN TEMPLATES"
  ON templates FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "USERS CAN DELETE THEIR OWN TEMPLATES"
  ON templates FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- BRANCHES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN BRANCHES"
  ON branches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN BRANCHES"
  ON branches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN BRANCHES"
  ON branches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN BRANCHES"
  ON branches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- CLIENTS POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN CLIENTS"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN CLIENTS"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN CLIENTS"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN CLIENTS"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- COMPANIES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN COMPANIES"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN COMPANIES"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN COMPANIES"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN COMPANIES"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- EMPLOYEES POLICIES
CREATE POLICY "USERS CAN READ EMPLOYEES"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "USERS CAN INSERT THEIR OWN EMPLOYEES"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN EMPLOYEES"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN EMPLOYEES"
  ON employees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- EMPLOYEE REQUESTS POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN EMPLOYEE REQUESTS"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN EMPLOYEE REQUESTS"
  ON employee_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN EMPLOYEE REQUESTS"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN EMPLOYEE REQUESTS"
  ON employee_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- EXPENSES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN EXPENSES"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN EXPENSES"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN EXPENSES"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN EXPENSES"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INVOICES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN INVOICES"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN INVOICES"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN INVOICES"
  ON invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN INVOICES"
  ON invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INVOICE ITEMS POLICIES
CREATE POLICY "USERS CAN READ INVOICE ITEMS THROUGH INVOICES"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
  );

CREATE POLICY "USERS CAN INSERT INVOICE ITEMS THROUGH INVOICES"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
  );

CREATE POLICY "USERS CAN UPDATE INVOICE ITEMS THROUGH INVOICES"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
  )
  WITH CHECK (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
  );

CREATE POLICY "USERS CAN DELETE INVOICE ITEMS THROUGH INVOICES"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
  );

-- JOBS POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN JOBS"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN JOBS"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN JOBS"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN JOBS"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PRODUCTS POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN PRODUCTS"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN PRODUCTS"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN PRODUCTS"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN PRODUCTS"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PROFILES POLICIES
CREATE POLICY "ADMIN FULL ACCESS"
  ON profiles FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "PUBLIC PROFILES ARE VIEWABLE"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "USERS CAN VIEW THEIR OWN PROFILE"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "USERS CAN CREATE THEIR OWN PROFILE"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN PROFILE"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "USERS CAN DELETE THEIR OWN PROFILE"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- QUOTES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN QUOTES"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN QUOTES"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN QUOTES"
  ON quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN QUOTES"
  ON quotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- QUOTE ITEMS POLICIES
CREATE POLICY "USERS CAN READ QUOTE ITEMS THROUGH QUOTES"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

CREATE POLICY "USERS CAN INSERT QUOTE ITEMS THROUGH QUOTES"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

CREATE POLICY "USERS CAN UPDATE QUOTE ITEMS THROUGH QUOTES"
  ON quote_items FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

CREATE POLICY "USERS CAN DELETE QUOTE ITEMS THROUGH QUOTES"
  ON quote_items FOR DELETE
  TO authenticated
  USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

-- SALARIES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN SALARY RECORDS"
  ON salaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN SALARY RECORDS"
  ON salaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN SALARY RECORDS"
  ON salaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN SALARY RECORDS"
  ON salaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- VENDORS POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN VENDORS"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN VENDORS"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN VENDORS"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN VENDORS"
  ON vendors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- WAREHOUSES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN WAREHOUSES"
  ON warehouses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN WAREHOUSES"
  ON warehouses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN WAREHOUSES"
  ON warehouses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN WAREHOUSES"
  ON warehouses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- JOB LISTINGS POLICIES
CREATE POLICY "USERS CAN VIEW THEIR OWN JOB LISTINGS AND PUBLIC ONES"
  ON job_listings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    is_active = true
  );

CREATE POLICY "USERS CAN CREATE JOB LISTINGS"
  ON job_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN JOB LISTINGS"
  ON job_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN JOB LISTINGS"
  ON job_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- JOB LISTING JOBS POLICIES
CREATE POLICY "USERS CAN VIEW JOB LISTING JOBS FOR THEIR LISTINGS"
  ON job_listing_jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_listing_jobs.job_listing_id
      AND job_listings.user_id = auth.uid()
    )
  );

CREATE POLICY "USERS CAN ADD JOBS TO THEIR LISTINGS"
  ON job_listing_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_listing_jobs.job_listing_id
      AND job_listings.user_id = auth.uid()
    )
  );

CREATE POLICY "USERS CAN UPDATE JOBS IN THEIR LISTINGS"
  ON job_listing_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_listing_jobs.job_listing_id
      AND job_listings.user_id = auth.uid()
    )
  );

CREATE POLICY "USERS CAN REMOVE JOBS FROM THEIR LISTINGS"
  ON job_listing_jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_listing_jobs.job_listing_id
      AND job_listings.user_id = auth.uid()
    )
  );

-- OFFICES POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN OFFICES"
  ON offices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN OFFICES"
  ON offices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN OFFICES"
  ON offices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN OFFICES"
  ON offices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- DEPARTMENTS POLICIES
CREATE POLICY "USERS CAN READ THEIR OWN DEPARTMENTS"
  ON departments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "USERS CAN INSERT THEIR OWN DEPARTMENTS"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN UPDATE THEIR OWN DEPARTMENTS"
  ON departments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "USERS CAN DELETE THEIR OWN DEPARTMENTS"
  ON departments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- DEPARTMENT LOCATIONS POLICIES
CREATE POLICY "USERS CAN READ DEPARTMENT LOCATIONS THROUGH DEPARTMENTS"
  ON department_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = department_locations.department_id
      AND departments.user_id = auth.uid()
    )
  );

CREATE POLICY "USERS CAN INSERT DEPARTMENT LOCATIONS THROUGH DEPARTMENTS"
  ON department_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = department_locations.department_id
      AND departments.user_id = auth.uid()
    )
  );

CREATE POLICY "USERS CAN UPDATE DEPARTMENT LOCATIONS THROUGH DEPARTMENTS"
  ON department_locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = department_locations.department_id
      AND departments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = department_locations.department_id
      AND departments.user_id = auth.uid()
    )
  );

CREATE POLICY "USERS CAN DELETE DEPARTMENT LOCATIONS THROUGH DEPARTMENTS"
  ON department_locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM departments
      WHERE departments.id = department_locations.department_id
      AND departments.user_id = auth.uid()
    )
  );

-- STORAGE POLICIES FOR ENTERPRISE-DOCUMENTS BUCKET
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'enterprise-documents' AND
  (auth.uid() = owner OR owner IS NULL)
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'enterprise-documents' AND
  auth.uid() = owner
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'enterprise-documents' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'enterprise-documents' AND
  auth.uid() = owner
);
