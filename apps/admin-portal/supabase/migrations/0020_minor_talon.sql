CREATE TYPE "public"."activity_action_type" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'INVITE', 'ASSIGN_ROLE', 'LOGIN');--> statement-breakpoint
CREATE TYPE "public"."activity_target_type" AS ENUM('USER', 'ROLE', 'COMPANY', 'CLIENT', 'INVOICE', 'EXPENSE', 'QUOTE', 'BRANCH', 'VENDOR', 'OFFICE', 'WAREHOUSE', 'PURCHASE', 'PRODUCT', 'EMPLOYEE', 'DEPARTMENT', 'SALARY', 'JOB_LISTING', 'APPLICANT', 'JOB', 'TEMPLATE', 'DOCUMENT', 'ENTERPRISE_SETTINGS');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" "activity_action_type" NOT NULL,
	"target_type" "activity_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"target_name" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "activity_logs_id_created_at_pk" PRIMARY KEY("id","created_at")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_enterprise_idx" ON "activity_logs" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_target_idx" ON "activity_logs" USING btree ("target_type","target_id");