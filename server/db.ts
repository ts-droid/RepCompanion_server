import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let databaseUrl = process.env.DATABASE_URL;

// Sanitize connection string if it was copied as a 'psql' command
if (databaseUrl.startsWith("psql '") && databaseUrl.endsWith("'")) {
  databaseUrl = databaseUrl.slice(6, -1);
} else if (databaseUrl.startsWith("psql ")) {
  databaseUrl = databaseUrl.slice(5);
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
