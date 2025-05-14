ALTER TABLE "offices" ADD COLUMN "capacity" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "working_hours" jsonb;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "temperature_control" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "operating_hours" jsonb;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "warehouse_type" text DEFAULT 'general';--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "safety_compliance" jsonb;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "website_name" text;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "privacy_policy_url" text;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "terms_of_service_url" text;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;