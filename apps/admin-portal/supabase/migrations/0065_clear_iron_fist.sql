CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'maintenance', 'sold', 'totaled', 'retired', 'stored', 'other');--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "status" "vehicle_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "status" "vehicle_status" DEFAULT 'active';