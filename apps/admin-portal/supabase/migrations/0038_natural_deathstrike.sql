CREATE TABLE "websites" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"domain_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"notes" text,
	CONSTRAINT "websites_enterprise_id_domain_name_unique" UNIQUE("domain_name","enterprise_id")
);
--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "websites_domain_name_idx" ON "websites" USING btree ("domain_name" text_ops);--> statement-breakpoint
CREATE INDEX "websites_enterprise_id_idx" ON "websites" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "websites_user_id_idx" ON "websites" USING btree ("user_id" uuid_ops);