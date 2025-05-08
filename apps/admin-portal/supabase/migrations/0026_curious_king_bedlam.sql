ALTER TABLE "job_listings" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "locations" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "departments" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "enable_search_filtering" boolean DEFAULT true;