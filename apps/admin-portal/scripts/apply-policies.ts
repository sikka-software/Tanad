import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables
config({ path: ".env" });

async function applyPolicies() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  // Create a Postgres client
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log("Connecting to database...");

    // Read the SQL file from src/db directory
    const sqlFilePath = resolve(__dirname, "../src/db/policies.sql");
    const sqlContent = readFileSync(sqlFilePath, "utf8");

    // Split the SQL content by semicolons and filter out empty statements
    const statements = sqlContent
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // First drop existing policies to avoid conflicts
    console.log("Dropping existing policies...");
    await sql.unsafe(`
      DO $$
      DECLARE
        pol record;
      BEGIN
        FOR pol IN
          SELECT policyname, tablename
          FROM pg_policies
          WHERE schemaname = 'public'
        LOOP
          EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
        END LOOP;
      END $$;
    `);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await sql.unsafe(statement);
        console.log(`Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        console.error(`Error executing statement ${i + 1}: ${statement}`);
        console.error(error);
        // Continue with next statement despite errors
      }
    }

    console.log("Policy application completed");
  } catch (error) {
    console.error("Error applying policies:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
  }
}

// Run the function
applyPolicies().catch(console.error);
