import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables
config({ path: ".env" });

async function applyTriggers() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  // Create a Postgres client
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log("Connecting to database...");

    // Read the SQL file from src/db directory
    const sqlFilePath = resolve(__dirname, "../src/db/triggers.sql");
    const sqlContent = readFileSync(sqlFilePath, "utf8");

    // Split the SQL content into statements, being careful with PL/pgSQL blocks
    const statements: string[] = [];
    let currentStatement = "";
    let inPlpgsqlBlock = false;
    let dollarQuoteLevel = 0;

    for (const line of sqlContent.split("\n")) {
      const trimmedLine = line.trim();
      
      // Check for dollar-quoted string start/end
      if (trimmedLine.includes("$$")) {
        const matches = trimmedLine.match(/\$\$/g) || [];
        dollarQuoteLevel += matches.length;
        if (dollarQuoteLevel % 2 === 0) {
          inPlpgsqlBlock = false;
        } else {
          inPlpgsqlBlock = true;
        }
      }

      currentStatement += line + "\n";

      // If we're not in a PL/pgSQL block and we see a semicolon, split the statement
      if (!inPlpgsqlBlock && trimmedLine.endsWith(";")) {
        statements.push(currentStatement.trim());
        currentStatement = "";
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await sql.unsafe(statement);
        console.log(`Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`);
        console.error(statement);
        console.error(error);
        // Continue with next statement despite errors
      }
    }

    console.log("Trigger application completed");
  } catch (error) {
    console.error("Error applying triggers:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
  }
}

// Run the function
applyTriggers().catch(console.error);
