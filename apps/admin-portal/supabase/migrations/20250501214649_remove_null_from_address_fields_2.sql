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

ALTER TABLE "branches" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "employees" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "employees" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "employees" ALTER COLUMN "position" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "employees" ALTER COLUMN "salary" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "employees" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "expenses" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "expenses" ALTER COLUMN "incurred_at" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "expenses" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "invoices" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "offices" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "offices" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "vendors" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "vendors" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "warehouses" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
-- ALTER TABLE "warehouses" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint