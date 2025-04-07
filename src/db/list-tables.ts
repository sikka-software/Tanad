import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

async function main() {
  console.log('Listing all tables in the database...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Connect to the database
  console.log('Connecting to database...');
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Query all tables in the public schema
    console.log('Tables in public schema:');
    const publicTables = await client.unsafe(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log(publicTables);
    
    // Query all tables in the auth schema
    console.log('\nTables in auth schema:');
    const authTables = await client.unsafe(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'auth'
      ORDER BY tablename;
    `);
    
    console.log(authTables);
    
  } catch (error) {
    console.error('Error listing tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 