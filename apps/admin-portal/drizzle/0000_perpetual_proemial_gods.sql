-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."app_permission" AS ENUM('profiles.create', 'profiles.read', 'profiles.update', 'profiles.delete', 'profiles.export', 'enterprises.create', 'enterprises.read', 'enterprises.update', 'enterprises.delete', 'enterprises.export', 'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete', 'invoices.export', 'invoices.duplicate', 'products.create', 'products.read', 'products.update', 'products.delete', 'products.export', 'quotes.create', 'quotes.read', 'quotes.update', 'quotes.delete', 'quotes.export', 'quotes.duplicate', 'employees.create', 'employees.read', 'employees.update', 'employees.delete', 'employees.export', 'salaries.create', 'salaries.read', 'salaries.update', 'salaries.delete', 'salaries.export', 'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.export', 'templates.create', 'templates.read', 'templates.update', 'templates.delete', 'templates.export', 'templates.duplicate', 'employee_requests.create', 'employee_requests.read', 'employee_requests.update', 'employee_requests.delete', 'employee_requests.export', 'job_listings.create', 'job_listings.read', 'job_listings.update', 'job_listings.delete', 'job_listings.export', 'offices.create', 'offices.read', 'offices.update', 'offices.delete', 'offices.export', 'expenses.create', 'expenses.read', 'expenses.update', 'expenses.delete', 'expenses.export', 'expenses.duplicate', 'departments.create', 'departments.read', 'departments.update', 'departments.delete', 'departments.export', 'warehouses.create', 'warehouses.read', 'warehouses.update', 'warehouses.delete', 'warehouses.export', 'vendors.create', 'vendors.read', 'vendors.update', 'vendors.delete', 'vendors.export', 'clients.create', 'clients.read', 'clients.update', 'clients.delete', 'clients.export', 'companies.create', 'companies.read', 'companies.update', 'companies.delete', 'companies.export', 'branches.create', 'branches.read', 'branches.update', 'branches.delete', 'branches.export');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('superadmin', 'admin', 'accounting', 'hr');--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "templates_type_check" CHECK (type = ANY (ARRAY['invoice'::text, 'quote'::text]))
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"url" text NOT NULL,
	"file_path" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "documents_entity_type_check" CHECK (entity_type = ANY (ARRAY['company'::text, 'expense'::text]))
);
--> statement-breakpoint
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"sku" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"cost" numeric(10, 2),
	"quantity" numeric(10, 2) DEFAULT '0' NOT NULL,
	"unit" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employee_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"amount" numeric(10, 2),
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employee_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "job_listing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_listing_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_listing_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"invoice_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" text NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"notes" text,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tax_amount" numeric(10, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END) STORED,
	"total" numeric(10, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END) STORED,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "invoices_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "job_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	CONSTRAINT "job_listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "job_listings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"full_name" text,
	"email" text NOT NULL,
	"user_settings" jsonb,
	"enterprise_id" uuid,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"stripe_customer_id" text,
	"avatar_url" text,
	"username" text,
	"subscribed_to" text,
	"price_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"user_id" uuid NOT NULL,
	"role" "app_role"
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "offices" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"phone" text,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "department_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"location_type" text NOT NULL,
	"location_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "unique_department_location" UNIQUE("department_id","location_type","location_id"),
	CONSTRAINT "location_type_check" CHECK (location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text]))
);
--> statement-breakpoint
ALTER TABLE "department_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"hire_date" date,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"termination_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"department_id" uuid
);
--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"expense_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"notes" text,
	"client_id" uuid,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "expenses_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text]))
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"quote_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"notes" text,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tax_amount" numeric(10, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END) STORED,
	"total" numeric(10, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END) STORED,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "quotes_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]))
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"notes" text,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_frequency" text DEFAULT 'monthly' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date
);
--> statement-breakpoint
ALTER TABLE "salaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"is_active" boolean DEFAULT true NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"capacity" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "warehouses_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "warehouses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"requirements" text,
	"location" varchar(255),
	"department" varchar(255),
	"type" varchar(50) NOT NULL,
	"salary" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"code" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"phone" text,
	"email" text,
	"manager" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "branches_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"industry" text,
	"size" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "enterprises" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"website" text,
	"industry" text,
	"size" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "enterprises" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"role" "app_role" NOT NULL,
	"permission" "app_permission" NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT "role_permissions_role_permission_key" UNIQUE("role","permission")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"enterprise_id" uuid,
	CONSTRAINT "user_roles_user_id_role_enterprise_id_key" UNIQUE("user_id","role","enterprise_id")
);
--> statement-breakpoint
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	"company" uuid,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
	"quote_id" uuid NOT NULL,
	"product_id" uuid
);
--> statement-breakpoint
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_jobs" ADD CONSTRAINT "job_listing_jobs_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_jobs" ADD CONSTRAINT "job_listing_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_jobs" ADD CONSTRAINT "job_listing_jobs_job_listing_id_job_listings_id_fk" FOREIGN KEY ("job_listing_id") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offices" ADD CONSTRAINT "offices_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_locations" ADD CONSTRAINT "department_locations_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_locations" ADD CONSTRAINT "department_locations_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_fkey" FOREIGN KEY ("company") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "templates_name_idx" ON "templates" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "templates_type_idx" ON "templates" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "templates_user_id_idx" ON "templates" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "documents_entity_id_idx" ON "documents" USING btree ("entity_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "documents_entity_type_idx" ON "documents" USING btree ("entity_type" text_ops);--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "products_sku_idx" ON "products" USING btree ("sku" text_ops);--> statement-breakpoint
CREATE INDEX "products_user_id_idx" ON "products" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employee_requests_created_at_idx" ON "employee_requests" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "employee_requests_employee_id_idx" ON "employee_requests" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employee_requests_status_idx" ON "employee_requests" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "employee_requests_type_idx" ON "employee_requests" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "employee_requests_user_id_idx" ON "employee_requests" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "job_listing_jobs_job_id_idx" ON "job_listing_jobs" USING btree ("job_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "job_listing_jobs_job_listing_id_idx" ON "job_listing_jobs" USING btree ("job_listing_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "invoices_client_id_idx" ON "invoices" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "invoices" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "job_listings_slug_idx" ON "job_listings" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "job_listings_title_idx" ON "job_listings" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "job_listings_user_id_idx" ON "job_listings" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "profiles_enterprise_id_idx" ON "profiles" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "profiles_username_idx" ON "profiles" USING btree ("username" text_ops);--> statement-breakpoint
CREATE INDEX "offices_name_idx" ON "offices" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "offices_user_id_idx" ON "offices" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employees_department_id_idx" ON "employees" USING btree ("department_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employees_email_idx" ON "employees" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "employees_user_id_idx" ON "employees" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "expenses_client_id_idx" ON "expenses" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "expenses_user_id_idx" ON "expenses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quotes_client_id_idx" ON "quotes" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "quotes_user_id_idx" ON "quotes" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "salaries_employee_id_idx" ON "salaries" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "salaries_user_id_idx" ON "salaries" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "vendors_email_idx" ON "vendors" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "vendors_user_id_idx" ON "vendors" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "departments_name_idx" ON "departments" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "departments_user_id_idx" ON "departments" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "warehouses_code_idx" ON "warehouses" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "warehouses_name_idx" ON "warehouses" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "warehouses_user_id_idx" ON "warehouses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "jobs_department_idx" ON "jobs" USING btree ("department" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_title_idx" ON "jobs" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_user_id_idx" ON "jobs" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "branches_code_idx" ON "branches" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "branches_name_idx" ON "branches" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "branches_user_id_idx" ON "branches" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "companies_email_idx" ON "companies" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "companies_is_active_idx" ON "companies" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "enterprises_email_idx" ON "enterprises" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "enterprises_name_idx" ON "enterprises" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "clients_email_idx" ON "clients" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "clients_name_idx" ON "clients" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "clients_user_id_idx" ON "clients" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items" USING btree ("quote_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Users can view their own documents" ON "documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can upload their own documents" ON "documents" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own documents" ON "documents" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own documents" ON "documents" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own products" ON "products" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own products" ON "products" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own products" ON "products" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own products" ON "products" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own employee requests" ON "employee_requests" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own employee requests" ON "employee_requests" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own employee requests" ON "employee_requests" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own employee requests" ON "employee_requests" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can view job listing jobs for their listings" ON "job_listing_jobs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM job_listings jl
  WHERE ((jl.id = job_listing_jobs.job_listing_id) AND (jl.user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Users can add jobs to their listings" ON "job_listing_jobs" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update jobs in their listings" ON "job_listing_jobs" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can remove jobs from their listings" ON "job_listing_jobs" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own invoices" ON "invoices" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own invoices" ON "invoices" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own invoices" ON "invoices" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own invoices" ON "invoices" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read invoice items through invoices" ON "invoice_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = invoice_items.invoice_id) AND (i.user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Users can insert invoice items through invoices" ON "invoice_items" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update invoice items through invoices" ON "invoice_items" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete invoice items through invoices" ON "invoice_items" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can view their own job listings and public ones" ON "job_listings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid() = user_id) OR (is_public = true)));--> statement-breakpoint
CREATE POLICY "Users can create job listings" ON "job_listings" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own job listings" ON "job_listings" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own job listings" ON "job_listings" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can view their own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can update their own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can create their own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own profile" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own offices" ON "offices" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read their own offices" ON "offices" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can insert their own offices" ON "offices" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own offices" ON "offices" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read department locations through departments" ON "department_locations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM departments d
  WHERE ((d.id = department_locations.department_id) AND (d.user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Users can insert department locations through departments" ON "department_locations" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update department locations through departments" ON "department_locations" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete department locations through departments" ON "department_locations" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own expenses" ON "expenses" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own expenses" ON "expenses" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own expenses" ON "expenses" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own expenses" ON "expenses" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own quotes" ON "quotes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own quotes" ON "quotes" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own quotes" ON "quotes" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own quotes" ON "quotes" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own salary records" ON "salaries" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own salary records" ON "salaries" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own salary records" ON "salaries" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own salary records" ON "salaries" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own vendors" ON "vendors" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own vendors" ON "vendors" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own vendors" ON "vendors" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own vendors" ON "vendors" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own departments" ON "departments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own departments" ON "departments" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own departments" ON "departments" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own departments" ON "departments" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own warehouses" ON "warehouses" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own warehouses" ON "warehouses" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own warehouses" ON "warehouses" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own warehouses" ON "warehouses" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own jobs" ON "jobs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own jobs" ON "jobs" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own jobs" ON "jobs" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own jobs" ON "jobs" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can insert their own branches" ON "branches" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own branches" ON "branches" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own branches" ON "branches" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own branches" ON "branches" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own companies" ON "companies" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own companies" ON "companies" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own companies" ON "companies" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own companies" ON "companies" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can create enterprises" ON "enterprises" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can view enterprises" ON "enterprises" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update enterprises" ON "enterprises" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Only superadmins can manage role permissions" ON "role_permissions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'superadmin'::app_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'superadmin'::app_role)))));--> statement-breakpoint
CREATE POLICY "Users can view their own roles" ON "user_roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can create initial role" ON "user_roles" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Only superadmins can manage roles" ON "user_roles" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read their own clients" ON "clients" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own clients" ON "clients" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own clients" ON "clients" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete their own clients" ON "clients" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can read quote items through quotes" ON "quote_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM quotes q
  WHERE ((q.id = quote_items.quote_id) AND (q.user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Users can insert quote items through quotes" ON "quote_items" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update quote items through quotes" ON "quote_items" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can delete quote items through quotes" ON "quote_items" AS PERMISSIVE FOR DELETE TO "authenticated";
*/