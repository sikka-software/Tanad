ALTER TABLE "enterprises" ADD COLUMN "registration_country" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "registration_number" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "vat_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "vat_number" text;