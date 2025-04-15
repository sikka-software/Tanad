-- Enable Row-Level Security on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- Enable RLS for job listings tables
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listing_jobs ENABLE ROW LEVEL SECURITY;

-- Enable RLS for offices table
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

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

-- Templates policies
alter table templates enable row level security;

create policy "Users can view their own templates."
  on templates for select
  to authenticated
  using (
    auth.uid() = user_id
  );

create policy "Users can create their own templates."
  on templates for insert
  to authenticated
  with check (
    auth.uid() = user_id
  );

create policy "Users can update their own templates."
  on templates for update
  to authenticated
  using (
    auth.uid() = user_id
  )
  with check (
    auth.uid() = user_id
  );

create policy "Users can delete their own templates."
  on templates for delete
  to authenticated
  using (
    auth.uid() = user_id
  );

-- BRANCHES POLICIES
CREATE POLICY "Users can read their own branches" ON branches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own branches" ON branches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own branches" ON branches FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own branches" ON branches FOR DELETE USING (auth.uid() = user_id);

-- CLIENTS POLICIES
CREATE POLICY "Users can read their own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- COMPANIES POLICIES
CREATE POLICY "Users can read their own companies" ON companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own companies" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own companies" ON companies FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own companies" ON companies FOR DELETE USING (auth.uid() = user_id);

-- EMPLOYEES POLICIES
CREATE POLICY "Users can read employees" ON employees FOR SELECT USING (true);

-- EXPENSES POLICIES
CREATE POLICY "Users can read their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- INVOICES POLICIES
CREATE POLICY "Users can read their own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- INVOICE ITEMS POLICIES
CREATE POLICY "Users can read invoice items through invoices" ON invoice_items FOR SELECT USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert invoice items through invoices" ON invoice_items FOR INSERT WITH CHECK (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update invoice items through invoices" ON invoice_items FOR UPDATE USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
) WITH CHECK (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete invoice items through invoices" ON invoice_items FOR DELETE USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);

-- JOBS POLICIES
CREATE POLICY "Users can read their own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jobs" ON jobs FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS POLICIES
CREATE POLICY "Users can read their own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- PROFILES POLICIES
CREATE POLICY "Admin full access" ON profiles FOR ALL TO service_role USING (true);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- QUOTES POLICIES
CREATE POLICY "Users can read their own quotes" ON quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotes" ON quotes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotes" ON quotes FOR DELETE USING (auth.uid() = user_id);

-- QUOTE ITEMS POLICIES
CREATE POLICY "Users can read quote items through quotes" ON quote_items FOR SELECT USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert quote items through quotes" ON quote_items FOR INSERT WITH CHECK (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update quote items through quotes" ON quote_items FOR UPDATE USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
) WITH CHECK (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete quote items through quotes" ON quote_items FOR DELETE USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
);

-- SALARIES POLICIES
CREATE POLICY "Users can read their own salary records" ON salaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own salary records" ON salaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own salary records" ON salaries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own salary records" ON salaries FOR DELETE USING (auth.uid() = user_id);

-- VENDORS POLICIES
CREATE POLICY "Users can read their own vendors" ON vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vendors" ON vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vendors" ON vendors FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vendors" ON vendors FOR DELETE USING (auth.uid() = user_id);

-- WAREHOUSES POLICIES
CREATE POLICY "Users can read their own warehouses" ON warehouses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own warehouses" ON warehouses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own warehouses" ON warehouses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own warehouses" ON warehouses FOR DELETE USING (auth.uid() = user_id);

-- Job Listings Policies
CREATE POLICY "Users can view their own job listings and public ones"
ON job_listings
FOR SELECT
USING (
  auth.uid() = user_id OR
  is_active = true
);

CREATE POLICY "Users can create job listings"
ON job_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job listings"
ON job_listings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job listings"
ON job_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Job Listing Jobs Policies
CREATE POLICY "Users can view job listing jobs for their listings"
ON job_listing_jobs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_listing_jobs.job_listing_id
    AND job_listings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add jobs to their listings"
ON job_listing_jobs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_listing_jobs.job_listing_id
    AND job_listings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update jobs in their listings"
ON job_listing_jobs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_listing_jobs.job_listing_id
    AND job_listings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove jobs from their listings"
ON job_listing_jobs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_listing_jobs.job_listing_id
    AND job_listings.user_id = auth.uid()
  )
);

-- OFFICES POLICIES
CREATE POLICY "Users can read their own offices" ON offices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own offices" ON offices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own offices" ON offices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own offices" ON offices FOR DELETE USING (auth.uid() = user_id); 