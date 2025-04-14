# Database Management with Drizzle

This directory contains the database schema and utility scripts for managing database connections and migrations.

## Connecting to a New PostgreSQL Database

When you need to connect to a new PostgreSQL database and set it up with all the required tables from the schema, follow these steps:

1. **Update your `.env` file** with the new database connection string:

   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database_name?sslmode=require
   ```

2. **Run the setup script** to create all tables in the new database:

   ```bash
   npm run db:setup-new
   ```

   This script will:
   - Create any required extensions (uuid-ossp)
   - Create the necessary schemas (auth, public)
   - Attempt to create all tables defined in the schema.ts file
   - Use drizzle-kit push to create any remaining tables

## Other Database Commands

- **Generate migrations** from schema changes:
  ```bash
  npm run db:generate
  ```

- **Push schema changes** to the database:
  ```bash
  npm run db:push
  ```

- **View database in Drizzle Studio**:
  ```bash
  npm run db:studio
  ```

- **Sync schema with database**:
  ```bash
  npm run db:sync
  ```

## Schema Structure

- `schema.ts` - Contains all table definitions
- `setup-new.ts` - Script for setting up a new database
- `sync.ts` - Script for syncing schema changes with the database
- `generate-migration.ts` - Script for generating migration files

## Troubleshooting

If you encounter issues with the database setup:

1. **Check Connection String**: Ensure your DATABASE_URL is correctly formatted
2. **Check Database Permissions**: Ensure your database user has CREATE privileges
3. **Manual Setup**: If the scripts fail, you can manually apply migrations by reviewing the migration files in the `drizzle` directory 