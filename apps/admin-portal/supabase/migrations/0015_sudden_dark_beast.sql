ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;