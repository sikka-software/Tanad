CREATE TYPE "public"."payment_cycle" AS ENUM('monthly', 'annual');--> statement-breakpoint
ALTER TYPE "public"."activity_target_type" ADD VALUE 'DOMAIN';--> statement-breakpoint
CREATE TABLE "domains" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"domain_name" text NOT NULL,
	"registrar" text,
	"monthly_cost" numeric(10, 2),
	"annual_cost" numeric(10, 2),
	"payment_cycle" "payment_cycle",
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "domains_enterprise_id_domain_name_unique" UNIQUE("enterprise_id","domain_name")
);
--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domains_enterprise_id_idx" ON "domains" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "domains_user_id_idx" ON "domains" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domains_domain_name_idx" ON "domains" USING btree ("domain_name");