CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"account_number" text,
	"account_type" text,
	"routing_number" text,
	"iban" text NOT NULL,
	"swift_bic" text,
	"bank_name" text NOT NULL,
	"status" text NOT NULL,
	"notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	CONSTRAINT "bank_accounts_enterprise_id_name_unique" UNIQUE("name","enterprise_id")
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bank_accounts_enterprise_id_idx" ON "bank_accounts" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "bank_accounts_user_id_idx" ON "bank_accounts" USING btree ("user_id" uuid_ops);