import { exec } from 'child_process';
import * as dotenv from 'dotenv';

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
  console.log('Starting database sync...');
  
  try {
    // Use drizzle-kit push to sync the schema to the database
    console.log('Pushing schema to database...');
    const output = await runCommand('npx drizzle-kit push');
    console.log(output);
    
    console.log('Database sync complete');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 