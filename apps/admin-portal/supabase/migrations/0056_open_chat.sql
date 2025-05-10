-- Update existing non-numeric available_positions to '0' or a default numeric value
-- This attempts to convert to integer, and defaults to 0 if conversion fails or is null/empty
UPDATE "jobs"
SET "available_positions" = 
    CASE 
        WHEN "available_positions" ~ E'^\\d+$' THEN "available_positions"
        ELSE '0' 
    END
WHERE "available_positions" IS NULL OR "available_positions" !~ E'^\\d+$';
--> statement-breakpoint
ALTER TABLE "employees" RENAME COLUMN "position" TO "job_id";
--> statement-breakpoint
-- Explicitly set the data type of job_id to UUID before setting to NULL and adding FK
ALTER TABLE "employees" ALTER COLUMN "job_id" SET DATA TYPE uuid USING NULL::uuid;
--> statement-breakpoint
-- Set all existing job_id values in employees to NULL before creating FK
UPDATE "employees" SET "job_id" = NULL;
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "available_positions" SET DATA TYPE numeric USING "available_positions"::numeric;
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "available_positions" SET DEFAULT '0';
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "available_positions" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "employees_job_id_idx" ON "employees" USING btree ("job_id" uuid_ops);