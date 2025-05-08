ALTER TABLE "offices" ADD COLUMN "manager" uuid;--> statement-breakpoint
ALTER TABLE "offices" ADD CONSTRAINT "fk_office_manager" FOREIGN KEY ("manager") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_offices_manager" ON "offices" USING btree ("manager" uuid_ops);