CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"phone" text,
	"email" text,
	"manager" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "branches_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"capacity" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "warehouses_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "warehouses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "salaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "branches_name_idx" ON "branches" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "branches_code_idx" ON "branches" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "branches_user_id_idx" ON "branches" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "warehouses_name_idx" ON "warehouses" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "warehouses_code_idx" ON "warehouses" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "warehouses_user_id_idx" ON "warehouses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Users can update their own branches" ON "branches" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can read their own branches" ON "branches" AS PERMISSIVE FOR SELECT TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can delete their own branches" ON "branches" AS PERMISSIVE FOR DELETE TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can update their own warehouses" ON "warehouses" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read their own warehouses" ON "warehouses" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own warehouses" ON "warehouses" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own warehouses" ON "warehouses" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));