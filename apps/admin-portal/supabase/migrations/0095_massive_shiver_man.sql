ALTER TABLE "cars" ALTER COLUMN "purchase_price" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "employee_requests" ALTER COLUMN "amount" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "invoice_items" ALTER COLUMN "amount" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "tax_amount";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "total";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "subtotal" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "subtotal" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "tax_rate" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_amount" numeric(13, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END
) STORED;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "total" numeric(13, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END
) STORED;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "salary" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "cost" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "amount" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "quote_items" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "quote_items" ALTER COLUMN "unit_price" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "quote_items" ADD COLUMN "amount" numeric(13, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED;--> statement-breakpoint
ALTER TABLE "quotes" DROP COLUMN "tax_amount";--> statement-breakpoint
ALTER TABLE "quotes" DROP COLUMN "total";--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "subtotal" SET DATA TYPE numeric(13, 2);--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "subtotal" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "tax_amount" numeric(13, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN (0)::numeric
    ELSE round((subtotal * tax_rate), 2)
END
) STORED;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "total" numeric(13, 2) GENERATED ALWAYS AS (
CASE
    WHEN (tax_rate IS NULL) THEN subtotal
    ELSE round((subtotal * ((1)::numeric + tax_rate)), 2)
END
) STORED;--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "amount" SET DATA TYPE numeric(13, 2);