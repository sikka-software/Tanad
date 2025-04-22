ALTER TABLE "documents" DROP CONSTRAINT "documents_entity_type_check";--> statement-breakpoint
DROP INDEX "employee_requests_created_at_idx";--> statement-breakpoint
DROP INDEX "employee_requests_employee_id_idx";--> statement-breakpoint
DROP INDEX "employee_requests_status_idx";--> statement-breakpoint
DROP INDEX "employee_requests_type_idx";--> statement-breakpoint
DROP INDEX "companies_is_active_idx";--> statement-breakpoint
ALTER TABLE "invoices" drop column "tax_amount";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_amount" numeric(10, 2) GENERATED ALWAYS AS (((subtotal * tax_rate) / (100)::numeric)) STORED;--> statement-breakpoint
ALTER TABLE "invoices" drop column "total";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "total" numeric(10, 2) GENERATED ALWAYS AS ((subtotal + ((subtotal * tax_rate) / (100)::numeric))) STORED;--> statement-breakpoint
ALTER TABLE "quotes" drop column "tax_amount";--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "tax_amount" numeric(10, 2) GENERATED ALWAYS AS (((subtotal * tax_rate) / (100)::numeric)) STORED;--> statement-breakpoint
ALTER TABLE "quotes" drop column "total";--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "total" numeric(10, 2) GENERATED ALWAYS AS ((subtotal + ((subtotal * tax_rate) / (100)::numeric))) STORED;--> statement-breakpoint
CREATE INDEX "employee_requests_created_at_idx" ON "employee_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "employee_requests_employee_id_idx" ON "employee_requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_requests_status_idx" ON "employee_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "employee_requests_type_idx" ON "employee_requests" USING btree ("type");--> statement-breakpoint
CREATE INDEX "companies_is_active_idx" ON "companies" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_entity_type_check" CHECK (entity_type = ANY (ARRAY[
        'company'::text,
        'expense'::text,
        'salary'::text,
        'employee'::text,
        'invoice'::text,
        'quote'::text,
        'vendor'::text,
        'warehouse'::text,
        'branch'::text,
        'office'::text,
        'department'::text
      ]));--> statement-breakpoint
DROP POLICY "Users can view their own documents" ON "documents" CASCADE;--> statement-breakpoint
DROP POLICY "Users can upload their own documents" ON "documents" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own documents" ON "documents" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own documents" ON "documents" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own products" ON "products" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own products" ON "products" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own products" ON "products" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own products" ON "products" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own employee requests" ON "employee_requests" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own employee requests" ON "employee_requests" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own employee requests" ON "employee_requests" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own employee requests" ON "employee_requests" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view job listing jobs for their listings" ON "job_listing_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can add jobs to their listings" ON "job_listing_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update jobs in their listings" ON "job_listing_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can remove jobs from their listings" ON "job_listing_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read invoice items through invoices" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert invoice items through invoices" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update invoice items through invoices" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete invoice items through invoices" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view their own job listings and public ones" ON "job_listings" CASCADE;--> statement-breakpoint
DROP POLICY "Users can create job listings" ON "job_listings" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own job listings" ON "job_listings" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own job listings" ON "job_listings" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view their own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can create their own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own offices" ON "offices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own offices" ON "offices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own offices" ON "offices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own offices" ON "offices" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read department locations through departments" ON "department_locations" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert department locations through departments" ON "department_locations" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update department locations through departments" ON "department_locations" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete department locations through departments" ON "department_locations" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own expenses" ON "expenses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own expenses" ON "expenses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own expenses" ON "expenses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own expenses" ON "expenses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own quotes" ON "quotes" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own quotes" ON "quotes" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own quotes" ON "quotes" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own quotes" ON "quotes" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own salary records" ON "salaries" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own salary records" ON "salaries" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own salary records" ON "salaries" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own salary records" ON "salaries" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own vendors" ON "vendors" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own vendors" ON "vendors" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own vendors" ON "vendors" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own vendors" ON "vendors" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own departments" ON "departments" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own departments" ON "departments" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own departments" ON "departments" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own departments" ON "departments" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own warehouses" ON "warehouses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own warehouses" ON "warehouses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own warehouses" ON "warehouses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own warehouses" ON "warehouses" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own jobs" ON "jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own jobs" ON "jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own jobs" ON "jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own jobs" ON "jobs" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own branches" ON "branches" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own branches" ON "branches" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own branches" ON "branches" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own branches" ON "branches" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own companies" ON "companies" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own companies" ON "companies" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own companies" ON "companies" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own companies" ON "companies" CASCADE;--> statement-breakpoint
DROP POLICY "Users can create enterprises" ON "enterprises" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view enterprises" ON "enterprises" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update enterprises" ON "enterprises" CASCADE;--> statement-breakpoint
DROP POLICY "Only superadmins can manage role permissions" ON "role_permissions" CASCADE;--> statement-breakpoint
DROP POLICY "Users can view their own roles" ON "user_roles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can create initial role" ON "user_roles" CASCADE;--> statement-breakpoint
DROP POLICY "Only superadmins can manage roles" ON "user_roles" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read their own clients" ON "clients" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own clients" ON "clients" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update their own clients" ON "clients" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own clients" ON "clients" CASCADE;--> statement-breakpoint
DROP POLICY "Users can read quote items through quotes" ON "quote_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert quote items through quotes" ON "quote_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can update quote items through quotes" ON "quote_items" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete quote items through quotes" ON "quote_items" CASCADE;