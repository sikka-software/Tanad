ALTER TABLE "expenses" ALTER COLUMN "enterprise_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "user_id" uuid NOT NULL;