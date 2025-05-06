ALTER TABLE "warehouses" ADD COLUMN "manager" uuid;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "fk_warehouse_manager" FOREIGN KEY ("manager") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_warehouses_manager" ON "warehouses" USING btree ("manager" uuid_ops);