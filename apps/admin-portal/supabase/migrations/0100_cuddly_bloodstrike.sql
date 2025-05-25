CREATE TABLE "individuals" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"short_address" text,
	"additional_number" text,
	"building_number" text,
	"street_name" text,
	"city" text,
	"region" text,
	"country" text,
	"zip_code" text,
	"status" "common_status" DEFAULT 'active',
	"notes" jsonb
);
--> statement-breakpoint
CREATE INDEX "idx_individuals_enterprise_id" ON "individuals" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "individuals_email_idx" ON "individuals" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "individuals_name_idx" ON "individuals" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "individuals_user_id_idx" ON "individuals" USING btree ("user_id" uuid_ops);