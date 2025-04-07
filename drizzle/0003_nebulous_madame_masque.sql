CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
	"quote_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"quote_number" text NOT NULL,
	"issue_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) GENERATED ALWAYS AS (((subtotal * tax_rate) / (100)::numeric)) STORED,
	"total" numeric(10, 2) GENERATED ALWAYS AS ((subtotal + ((subtotal * tax_rate) / (100)::numeric))) STORED,
	"notes" text,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "quotes_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]))
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items" USING btree ("quote_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quotes_client_id_idx" ON "quotes" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "quotes_user_id_idx" ON "quotes" USING btree ("user_id" uuid_ops);--> statement-breakpoint
-- CREATE POLICY "Users can update quote items through quotes" ON "quote_items" AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
--      FROM quotes
--     WHERE ((quotes.id = quote_items.quote_id) AND (quotes.user_id = auth.uid())))));--> statement-breakpoint
-- CREATE POLICY "Users can read quote items through quotes" ON "quote_items" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
-- CREATE POLICY "Users can insert quote items through quotes" ON "quote_items" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
-- CREATE POLICY "Users can delete quote items through quotes" ON "quote_items" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
-- CREATE POLICY "Users can update their own quotes" ON "quotes" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
-- CREATE POLICY "Users can read their own quotes" ON "quotes" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
-- CREATE POLICY "Users can insert their own quotes" ON "quotes" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
-- CREATE POLICY "Users can delete their own quotes" ON "quotes" AS PERMISSIVE FOR DELETE TO public;