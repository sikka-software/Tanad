ALTER TABLE "clients" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "zip_code" DROP NOT NULL;