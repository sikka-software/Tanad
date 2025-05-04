CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"ip_address" "inet",
	"location" text,
	"provider" text,
	"os" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "servers_enterprise_id_idx" ON "servers" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "servers_user_id_idx" ON "servers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "servers_name_idx" ON "servers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "servers_ip_address_idx" ON "servers" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "servers_status_idx" ON "servers" USING btree ("status");