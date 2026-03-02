#!/usr/bin/env node
/**
 * Run database migrations programmatically
 * This is more reliable than drizzle-kit migrate in production
 */

import pkg from 'pg';
const { Client } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';


async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('[MIGRATE] ❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('[MIGRATE] 🔄 Starting database migrations...');
  
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client);
    
    console.log('[MIGRATE] 📂 Reading migrations from ./migrations');
    
    await migrate(db, { migrationsFolder: './migrations' });
    await client.end();
    
    console.log('[MIGRATE] ✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[MIGRATE] ❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
