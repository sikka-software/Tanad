ALTER TABLE "branches" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ALTER COLUMN "zip_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ALTER COLUMN "zip_code" DROP NOT NULL;