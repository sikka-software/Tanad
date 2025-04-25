import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const url = new URL(connectionString);

export default {
  schema: "./src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  schemaFilter: ["public"],
  introspect: {
    casing: "preserve",
  },
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: url.searchParams.get("sslmode") === "require",
  },
  verbose: true,
  strict: true,
} satisfies Config;
