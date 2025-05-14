ALTER TABLE "cars" ADD COLUMN "annual_payment" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "payment_cycle" "payment_cycle";--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "purchase_date" date;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "purchase_price" numeric(10, 2);