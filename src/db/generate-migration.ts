import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function main() {
  console.log('Starting migration generation...');
  
  try {
    // Generate the migration files
    console.log('Generating migration...');
    const output = await runCommand('npx drizzle-kit generate');
    console.log(output);
    
    console.log('Migration files generated successfully');
    
    // Update the schema.ts file in drizzle directory with the content from src/db/schema.ts
    console.log('Updating drizzle/schema.ts with current schema...');
    const schemaContent = fs.readFileSync(path.join(process.cwd(), 'src/db/schema.ts'), 'utf8');
    fs.writeFileSync(path.join(process.cwd(), 'drizzle/schema.ts'), schemaContent, 'utf8');
    
    console.log('Schema file updated');
    console.log('Migration generation complete');
  } catch (error) {
    console.error('Failed to generate migration:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 