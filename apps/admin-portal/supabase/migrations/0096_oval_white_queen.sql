ALTER TABLE "jobs" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "location_type" text;--> statement-breakpoint
CREATE INDEX "jobs_location_poly_idx" ON "jobs" USING btree ("location_type","location_id");--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_type_check" CHECK ((location_type IS NULL) OR location_type = ANY (ARRAY['office'::text, 'branch'::text, 'warehouse'::text]));--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_type_consistency_check" CHECK (((location_id IS NULL AND location_type IS NULL) OR (location_id IS NOT NULL AND location_type IS NOT NULL)));