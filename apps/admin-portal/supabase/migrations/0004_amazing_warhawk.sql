ALTER TABLE "expenses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "enterprise_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "issue_date" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "issue_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "due_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "enterprise_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint

ALTER TABLE "branches" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "building_number" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "street_name" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "building_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "street_name" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "position" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "salary" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "incurred_at" date DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "building_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "street_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "building_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "street_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "additional_number" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "building_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "street_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint