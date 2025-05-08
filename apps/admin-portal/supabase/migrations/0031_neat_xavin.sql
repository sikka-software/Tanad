ALTER TABLE "companies" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "departments" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "job_listings" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "jobs" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "offices" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "warehouses" RENAME COLUMN "is_active" TO "status";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "is_active";