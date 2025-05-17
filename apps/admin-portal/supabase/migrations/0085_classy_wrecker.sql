ALTER TABLE "domains" RENAME COLUMN "monthly_cost" TO "monthly_payment";--> statement-breakpoint
ALTER TABLE "domains" RENAME COLUMN "annual_cost" TO "annual_payment";--> statement-breakpoint
ALTER TABLE "servers" RENAME COLUMN "monthly_cost" TO "monthly_payment";--> statement-breakpoint
ALTER TABLE "servers" RENAME COLUMN "annual_cost" TO "annual_payment";