CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"code" text NOT NULL,
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
	CONSTRAINT "branches_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clients" (
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
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"position" varchar(255) NOT NULL,
	"department" varchar(255),
	"hire_date" date NOT NULL,
	"salary" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_email_unique" UNIQUE("email")
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
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "expenses_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text]))
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"invoice_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) GENERATED ALWAYS AS (((subtotal * tax_rate) / (100)::numeric)) STORED,
	"total" numeric(10, 2) GENERATED ALWAYS AS ((subtotal + ((subtotal * tax_rate) / (100)::numeric))) STORED,
	"notes" text,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "invoices_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"sku" varchar(50),
	"stock_quantity" integer DEFAULT 0,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT "products_sku_key" UNIQUE("sku")
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"stripe_customer_id" text,
	"avatar_url" text,
	"address" text,
	"email" varchar(255),
	"user_settings" jsonb,
	"username" text,
	"subscribed_to" text,
	"price_id" text,
	CONSTRAINT "profiles_username_key" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
	"quote_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"quote_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) GENERATED ALWAYS AS (((subtotal * tax_rate) / (100)::numeric)) STORED,
	"total" numeric(10, 2) GENERATED ALWAYS AS ((subtotal + ((subtotal * tax_rate) / (100)::numeric))) STORED,
	"notes" text,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "quotes_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]))
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"payment_date" date NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"deductions" jsonb,
	"notes" text,
	"employee_name" text NOT NULL,
	"user_id" uuid NOT NULL
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
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
	CONSTRAINT "warehouses_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "warehouses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branches_name_idx" ON "branches" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "branches_code_idx" ON "branches" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "branches_user_id_idx" ON "branches" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "clients_email_idx" ON "clients" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "clients_name_idx" ON "clients" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "clients_user_id_idx" ON "clients" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "expenses_client_id_idx" ON "expenses" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "expenses_user_id_idx" ON "expenses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "invoices_client_id_idx" ON "invoices" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "invoices" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "jobs_title_idx" ON "jobs" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_department_idx" ON "jobs" USING btree ("department" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_user_id_idx" ON "jobs" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_user_id_idx" ON "products" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items" USING btree ("quote_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quotes_client_id_idx" ON "quotes" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "quotes_user_id_idx" ON "quotes" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "salaries_payment_date_idx" ON "salaries" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "salaries_employee_name_idx" ON "salaries" USING btree ("employee_name" text_ops);--> statement-breakpoint
CREATE INDEX "salaries_user_id_idx" ON "salaries" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "vendors_email_idx" ON "vendors" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "vendors_user_id_idx" ON "vendors" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "warehouses_name_idx" ON "warehouses" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "warehouses_code_idx" ON "warehouses" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "warehouses_user_id_idx" ON "warehouses" USING btree ("user_id" uuid_ops);