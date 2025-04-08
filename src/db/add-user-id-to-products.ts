import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

// Database connection
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log('Starting migration: Adding user_id column to products table...');
  
  try {
    // Add user_id column to products table
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN user_id UUID;
    `);
    
    console.log('Added user_id column to products table');
    
    // Create index on user_id
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS products_user_id_idx ON products (user_id);
    `);
    
    console.log('Created index on user_id column');
    
    // Add foreign key constraint (optional, depending on your schema)
    // await db.execute(sql`
    //   ALTER TABLE products
    //   ADD CONSTRAINT fk_products_user_id
    //   FOREIGN KEY (user_id)
    //   REFERENCES auth.users(id)
    //   ON DELETE CASCADE;
    // `);
    
    // Set default value for existing rows
    // This depends on your application logic
    // You might want to assign them to a default/admin user
    // or handle this differently
    
    // Make the column NOT NULL for future inserts
    await db.execute(sql`
      ALTER TABLE products
      ALTER COLUMN user_id SET NOT NULL;
    `);
    
    console.log('Set user_id column to NOT NULL');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Failed to execute migration:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 