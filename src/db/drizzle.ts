// Disable prefetch as it is not supported for "Transaction" pool mode

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env" });

// Fix for multiple connections in development
const globalForPostgres = globalThis as unknown as {
  postgres: postgres.Sql | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Use a single connection instance
export const client =
  globalForPostgres.postgres ||
  postgres(connectionString, { max: 1, idle_timeout: 20 });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgres = client;
}

export const db = drizzle(client);
