ALTER TABLE "cars" ADD COLUMN "daily_payment" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "weekly_payment" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "daily_payment" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "weekly_payment" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "annual_payment" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "payment_cycle" "payment_cycle";