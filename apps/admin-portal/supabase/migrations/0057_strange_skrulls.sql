ALTER TABLE "jobs" RENAME COLUMN "available_positions" TO "total_positions";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "occupied_positions" numeric DEFAULT '0' NOT NULL;