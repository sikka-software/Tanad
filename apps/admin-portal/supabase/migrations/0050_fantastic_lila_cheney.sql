ALTER TABLE "cars" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "enterprise_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trucks" ADD COLUMN "enterprise_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cars_enterprise_id_idx" ON "cars" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "cars_name_idx" ON "cars" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "cars_user_id_idx" ON "cars" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "trucks_enterprise_id_idx" ON "trucks" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "trucks_name_idx" ON "trucks" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "trucks_user_id_idx" ON "trucks" USING btree ("user_id" uuid_ops);