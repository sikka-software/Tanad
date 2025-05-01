ALTER TABLE "warehouses" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "street_name" text;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "building_number" text;--> statement-breakpoint

ALTER TABLE "vendors" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint

ALTER TABLE "clients" ALTER COLUMN "additional_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "building_number" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "street_name" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint