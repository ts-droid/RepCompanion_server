#!/usr/bin/env node
/**
 * Run migrations and seed on Railway using production environment
 * This script should be run once after deployment to set up the database
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db as dbInstance } from '../server/db.js';
import { adminUsers } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function runSetup() {
  console.log('[RAILWAY-SETUP] 🚀 Starting database setup...');
  
  if (!process.env.DATABASE_URL) {
    console.error('[RAILWAY-SETUP] ❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    // Step 1: Run migrations
    console.log('[RAILWAY-SETUP] 📂 Running migrations...');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('[RAILWAY-SETUP] ✅ Migrations completed!');

    // Step 2: Seed default admin
    console.log('[RAILWAY-SETUP] 🌱 Checking for default admin...');
    const defaultEmail = "thomas@recompute.it";
    
    const [existing] = await dbInstance
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, defaultEmail));
    
    if (existing) {
      console.log(`[RAILWAY-SETUP] ℹ️  Admin user ${defaultEmail} already exists`);
    } else {
      console.log('[RAILWAY-SETUP] Creating default admin user...');
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash("qwerty123456", 10);
      
      await dbInstance.insert(adminUsers).values({
        email: defaultEmail,
        passwordHash,
        forcePasswordChange: true,
        isSuperAdmin: true,
        totpEnabled: false,
      });
      
      console.log('[RAILWAY-SETUP] ✅ Default admin created!');
      console.log(`[RAILWAY-SETUP] Email: ${defaultEmail}`);
      console.log('[RAILWAY-SETUP] Password: qwerty123456 (must change on first login)');
    }

    console.log('\n[RAILWAY-SETUP] 🎉 Setup completed successfully!');
    console.log('[RAILWAY-SETUP] Admin login: https://repcompanionserver-production.up.railway.app/admin/login');
    process.exit(0);
    
  } catch (error) {
    console.error('[RAILWAY-SETUP] ❌ Setup failed:', error);
    process.exit(1);
  }
}

runSetup();
