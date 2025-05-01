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

ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "additional_number" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "additional_number" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "short_address" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
-- ALTER TABLE "employees" ADD COLUMN "short_address" text;--> statement-breakpoint
-- ALTER TABLE "employees" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "additional_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "building_number" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "street_name" text;--> statement-breakpoint
-- ALTER TABLE "employees" ADD COLUMN "position" text;--> statement-breakpoint
-- ALTER TABLE "employees" ADD COLUMN "salary" numeric(10, 2);--> statement-breakpoint
-- ALTER TABLE "employees" ADD COLUMN "notes" text;--> statement-breakpoint
-- ALTER TABLE "expenses" ADD COLUMN "description" text;--> statement-breakpoint
-- ALTER TABLE "expenses" ADD COLUMN "incurred_at" date DEFAULT CURRENT_DATE;--> statement-breakpoint
-- ALTER TABLE "expenses" ADD COLUMN "created_by" uuid;--> statement-breakpoint
-- ALTER TABLE "invoices" ADD COLUMN "created_by" uuid;--> statement-breakpoint
-- ALTER TABLE "offices" ADD COLUMN "short_address" text;--> statement-breakpoint
-- ALTER TABLE "offices" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "additional_number" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "building_number" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "street_name" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "additional_number" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "building_number" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "street_name" text;--> statement-breakpoint
-- ALTER TABLE "vendors" ADD COLUMN "region" text;--> statement-breakpoint
-- ALTER TABLE "vendors" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "additional_number" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "building_number" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "street_name" text;--> statement-breakpoint
-- ALTER TABLE "warehouses" ADD COLUMN "region" text;--> statement-breakpoint
-- ALTER TABLE "warehouses" ADD COLUMN "short_address" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint