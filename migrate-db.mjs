import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'schema.sql'), 'utf-8');
    console.log("Applying schema migration from schema.sql...");
    
    // Split by semicolon but be careful with functions/triggers if any (none in this schema)
    // Actually, pg.query can execute multiple statements separated by semicolons in one call.
    await pool.query(schemaSql);
    
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
