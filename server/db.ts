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
// Regex matches and extracts anything that looks like a postgresql URL
const urlMatch = databaseUrl.match(/postgresql:\/\/[^\s']+/);
if (urlMatch) {
  databaseUrl = urlMatch[0];
}

// Log anonymized URL for debugging
const anonymizedUrl = databaseUrl.replace(/:[^:@]+@/, ":****@");
console.log(`[DB] Initializing connection to: ${anonymizedUrl}`);

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
