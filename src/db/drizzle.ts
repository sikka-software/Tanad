// Disable prefetch as it is not supported for "Transaction" pool mode
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create Supabase client for auth and realtime
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Only initialize database connection on the server side
const db =
  typeof window === "undefined"
    ? (() => {
        if (!process.env.DATABASE_URL) {
          throw new Error("Missing DATABASE_URL");
        }

        // Create PostgreSQL connection pool for Drizzle
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

        // Create Drizzle instance
        return drizzle(pool, { schema });
      })()
    : null;

// For development, allow multiple connections
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  let _db = db;
  Object.defineProperty(exports, "db", {
    get() {
      return _db;
    },
    set(value) {
      _db = value;
    },
  });
}

export { db };
