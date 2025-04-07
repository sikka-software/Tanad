import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, check, uuid, timestamp, text, date, numeric, index, foreignKey } from 'drizzle-orm/pg-core';

dotenv.config();

async function main() {
  console.log('Creating quotes and quote_items tables...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Connect to the database
  console.log('Connecting to database...');
  const client = postgres(connectionString);
  
  try {
    // Create the quotes table
    console.log('Creating quotes table...');
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS "quotes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
        "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
        "quote_number" text NOT NULL,
        "issue_date" date NOT NULL,
        "expiry_date" date NOT NULL,
        "status" text DEFAULT 'draft' NOT NULL,
        "subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
        "tax_rate" numeric(5, 2) DEFAULT '0',
        "tax_amount" numeric(10, 2) GENERATED ALWAYS AS ((subtotal * tax_rate) / (100)::numeric) STORED,
        "total" numeric(10, 2) GENERATED ALWAYS AS ((subtotal + ((subtotal * tax_rate) / (100)::numeric))) STORED,
        "notes" text,
        "client_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "quotes_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]))
      );

      CREATE INDEX IF NOT EXISTS "quotes_client_id_idx" ON "quotes" USING btree ("client_id");
      CREATE INDEX IF NOT EXISTS "quotes_status_idx" ON "quotes" USING btree ("status");
      CREATE INDEX IF NOT EXISTS "quotes_user_id_idx" ON "quotes" USING btree ("user_id");
      
      ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" 
        FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE cascade ON UPDATE no action;
      
      ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can update their own quotes" ON "quotes" AS PERMISSIVE
        FOR UPDATE TO public USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can read their own quotes" ON "quotes" AS PERMISSIVE
        FOR SELECT TO public;
      
      CREATE POLICY "Users can insert their own quotes" ON "quotes" AS PERMISSIVE
        FOR INSERT TO public;
      
      CREATE POLICY "Users can delete their own quotes" ON "quotes" AS PERMISSIVE
        FOR DELETE TO public USING (auth.uid() = user_id);
    `);
    
    // Create the quote_items table
    console.log('Creating quote_items table...');
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS "quote_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
        "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
        "description" text NOT NULL,
        "quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
        "unit_price" numeric(10, 2) NOT NULL,
        "amount" numeric(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
        "quote_id" uuid NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS "quote_items_quote_id_idx" ON "quote_items" USING btree ("quote_id");
      
      ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" 
        FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE cascade ON UPDATE no action;
      
      ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can update quote items through quotes" ON "quote_items" AS PERMISSIVE
        FOR UPDATE TO public USING (EXISTS (
          SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
        ));
      
      CREATE POLICY "Users can read quote items through quotes" ON "quote_items" AS PERMISSIVE
        FOR SELECT TO public;
      
      CREATE POLICY "Users can insert quote items through quotes" ON "quote_items" AS PERMISSIVE
        FOR INSERT TO public;
      
      CREATE POLICY "Users can delete quote items through quotes" ON "quote_items" AS PERMISSIVE
        FOR DELETE TO public USING (EXISTS (
          SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
        ));
    `);
    
    console.log('Quotes and quote_items tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 