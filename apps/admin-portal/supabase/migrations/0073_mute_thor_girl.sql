CREATE TYPE "public"."expense_status" AS ENUM('draft', 'submitted', 'under_review', 'pending_verification', 'approved', 'partially_approved', 'rejected', 'pending_payment', 'paid', 'disputed', 'audit_flagged', 'closed', 'archived');--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_entity_type_check";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_status_check";--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_status_check";--> statement-breakpoint
ALTER TABLE "employee_requests" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."employee_request_status";--> statement-breakpoint
ALTER TABLE "employee_requests" ALTER COLUMN "status" SET DATA TYPE "public"."employee_request_status" USING "status"::"public"."employee_request_status";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."expense_status";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "status" SET DATA TYPE "public"."expense_status" USING "status"::"public"."expense_status";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."invoice_status";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DATA TYPE "public"."invoice_status" USING "status"::"public"."invoice_status";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."purchase_status";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DATA TYPE "public"."purchase_status" USING "status"::"public"."purchase_status";--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."quote_status";--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "status" SET DATA TYPE "public"."quote_status" USING "status"::"public"."quote_status";--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "national_id" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "eqama_id" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "emergency_contact" jsonb;