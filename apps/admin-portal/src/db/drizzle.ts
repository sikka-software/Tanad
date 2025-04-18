import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as relations from "@/db/relations";
import * as schema from "@/db/schema";

// This file is only imported by server-side code
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Parse the connection string to handle SSL
const connectionString = process.env.DATABASE_URL;
const ssl = connectionString.includes("sslmode=require")
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl,
});

export const db = drizzle(pool, {
  schema: { ...schema, ...relations },
});
