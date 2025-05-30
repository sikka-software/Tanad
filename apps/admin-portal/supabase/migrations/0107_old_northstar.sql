CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"license_number" text,
	"license_expiration_date" date,
	"license_country" text,
	"status" "common_status" DEFAULT 'active',
	"notes" jsonb
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" smallint NOT NULL,
	"color" text,
	"vin" text,
	"code" text,
	"license_country" text,
	"license_plate" text,
	"ownership_status" "vehicle_ownership_status" DEFAULT 'owned',
	"status" "vehicle_status" DEFAULT 'active',
	"daily_payment" numeric(10, 2),
	"weekly_payment" numeric(10, 2),
	"monthly_payment" numeric(10, 2),
	"annual_payment" numeric(10, 2),
	"payment_cycle" "payment_cycle",
	"purchase_date" date,
	"purchase_price" numeric(13, 2),
	"notes" jsonb,
	"driver_id" uuid
);
--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drivers_enterprise_id_idx" ON "drivers" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "drivers_user_id_idx" ON "drivers" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "vehicles_enterprise_id_idx" ON "vehicles" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "vehicles_user_id_idx" ON "vehicles" USING btree ("user_id" uuid_ops);