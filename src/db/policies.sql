-- Enable Row-Level Security on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- BRANCHES POLICIES
CREATE POLICY "Users can read their own branches" 
ON branches 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branches" 
ON branches 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branches" 
ON branches 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branches" 
ON branches 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- CLIENTS POLICIES
CREATE POLICY "Users can read their own clients" 
ON clients 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" 
ON clients 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON clients 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON clients 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- INVOICES POLICIES
CREATE POLICY "Users can read their own invoices" 
ON invoices 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" 
ON invoices 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
ON invoices 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
ON invoices 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- INVOICE ITEMS POLICIES
CREATE POLICY "Users can read invoice items through invoices" 
ON invoice_items 
FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 
  FROM invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can insert invoice items through invoices" 
ON invoice_items 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 
  FROM invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can update invoice items through invoices" 
ON invoice_items 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 
  FROM invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can delete invoice items through invoices" 
ON invoice_items 
FOR DELETE 
TO authenticated 
USING (EXISTS (
  SELECT 1 
  FROM invoices 
  WHERE invoices.id = invoice_items.invoice_id 
  AND invoices.user_id = auth.uid()
));

-- QUOTES POLICIES
CREATE POLICY "Users can read their own quotes" 
ON quotes 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes" 
ON quotes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes" 
ON quotes 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes" 
ON quotes 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- QUOTE ITEMS POLICIES
CREATE POLICY "Users can read quote items through quotes" 
ON quote_items 
FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 
  FROM quotes 
  WHERE quotes.id = quote_items.quote_id 
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can insert quote items through quotes" 
ON quote_items 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 
  FROM quotes 
  WHERE quotes.id = quote_items.quote_id 
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can update quote items through quotes" 
ON quote_items 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 
  FROM quotes 
  WHERE quotes.id = quote_items.quote_id 
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can delete quote items through quotes" 
ON quote_items 
FOR DELETE 
TO authenticated 
USING (EXISTS (
  SELECT 1 
  FROM quotes 
  WHERE quotes.id = quote_items.quote_id 
  AND quotes.user_id = auth.uid()
));

-- PROFILES POLICIES
CREATE POLICY "Admin full access" 
ON profiles 
FOR ALL 
TO service_role 
USING (true);

CREATE POLICY "Public profiles are viewable" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- EXPENSES POLICIES
CREATE POLICY "Users can read their own expenses" 
ON expenses 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" 
ON expenses 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON expenses 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON expenses 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- VENDORS POLICIES
CREATE POLICY "Users can read their own vendors" 
ON vendors 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendors" 
ON vendors 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors" 
ON vendors 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors" 
ON vendors 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- SALARIES POLICIES
CREATE POLICY "Users can read their own salary records" 
ON salaries 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own salary records" 
ON salaries 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salary records" 
ON salaries 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own salary records" 
ON salaries 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- WAREHOUSES POLICIES
CREATE POLICY "Users can read their own warehouses" 
ON warehouses 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own warehouses" 
ON warehouses 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warehouses" 
ON warehouses 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own warehouses" 
ON warehouses 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- PRODUCTS POLICIES  
CREATE POLICY "Users can read products" 
ON products 
FOR SELECT 
TO authenticated 
USING (true);

-- EMPLOYEES POLICIES
CREATE POLICY "Users can read employees" 
ON employees 
FOR SELECT 
TO authenticated 
USING (true); 