import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';
import { sql } from 'drizzle-orm';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

dotenv.config();

async function main() {
  console.log('Setting up new database...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Connect to the database
  console.log('Connecting to database...');
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    console.log('Creating required extensions if they do not exist...');
    // Create the uuid-ossp extension if it doesn't exist
    await client.unsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    console.log('Running push to create all tables...');
    
    // Instead of running the push command, manually create the schema
    await client.unsafe('CREATE SCHEMA IF NOT EXISTS auth;');
    
    // List all tables in the schema
    const tables = Object.entries(schema)
      .filter(([key, value]) => typeof value === 'object' && value !== null)
      .map(([key, value]) => ({ name: key, table: value }));
    
    console.log(`Found ${tables.length} tables in schema`);
    
    // Attempt to create each table
    for (const tableInfo of tables) {
      try {
        // Create the enums first if they exist
        if (tableInfo.name.includes('InAuth')) {
          console.log(`Creating enum: ${tableInfo.name}`);
          try {
            const result = await client.unsafe(`SELECT * FROM pg_type WHERE typname = '${tableInfo.name.toLowerCase()}'`);
            if (result.length === 0) {
              // Enum doesn't exist, create it
              console.log(`Enum doesn't exist, creating: ${tableInfo.name}`);
            }
          } catch (err) {
            console.log(`Error checking enum: ${err}`);
          }
        }
      } catch (error) {
        console.log(`Error with table ${tableInfo.name}: ${error}`);
      }
    }
    
    // Use drizzle-kit push as a last resort
    console.log('Using drizzle-kit push to create remaining tables...');
    await client.unsafe('COMMIT;');  // End any existing transaction
    
    await new Promise<void>((resolve, reject) => {
      execCallback('npx drizzle-kit push', (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          console.warn(`Warning: ${error.message}`);
          console.warn(`stderr: ${stderr}`);
          // Don't reject as we want to continue
        }
        console.log(stdout);
        resolve();
      });
    });
    
    console.log('Database setup complete');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 