ALTER TABLE "offices" ALTER COLUMN "short_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "building_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "street_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offices" ALTER COLUMN "zip_code" DROP NOT NULL;