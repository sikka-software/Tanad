CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"expense_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"notes" text,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "expenses_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text]))
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"payment_date" date NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"deductions" jsonb,
	"notes" text,
	"employee_name" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "salaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."audit_log_entries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."identities" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."instances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."schema_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."sso_providers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "auth"."audit_log_entries" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."flow_state" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."identities" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."instances" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."mfa_amr_claims" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."mfa_challenges" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."mfa_factors" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."one_time_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."refresh_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."saml_providers" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."saml_relay_states" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."schema_migrations" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."sessions" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."sso_domains" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."sso_providers" CASCADE;--> statement-breakpoint
DROP TABLE "auth"."users" CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_fkey";
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_client_id_idx" ON "expenses" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "expenses_user_id_idx" ON "expenses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "salaries_payment_date_idx" ON "salaries" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "salaries_employee_name_idx" ON "salaries" USING btree ("employee_name" text_ops);--> statement-breakpoint
CREATE INDEX "salaries_user_id_idx" ON "salaries" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "vendors_email_idx" ON "vendors" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "vendors_user_id_idx" ON "vendors" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Users can update their own expenses" ON "expenses" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read their own expenses" ON "expenses" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can insert their own expenses" ON "expenses" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own expenses" ON "expenses" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own salary records" ON "salaries" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read their own salary records" ON "salaries" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own salary records" ON "salaries" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own salary records" ON "salaries" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own vendors" ON "vendors" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read their own vendors" ON "vendors" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own vendors" ON "vendors" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own vendors" ON "vendors" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
DROP TYPE "auth"."aal_level";--> statement-breakpoint
DROP TYPE "auth"."code_challenge_method";--> statement-breakpoint
DROP TYPE "auth"."factor_status";--> statement-breakpoint
DROP TYPE "auth"."factor_type";--> statement-breakpoint
DROP TYPE "auth"."one_time_token_type";--> statement-breakpoint
DROP SCHEMA "auth";
