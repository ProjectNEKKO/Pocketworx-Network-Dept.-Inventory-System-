import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log("Adding tag column to inventory_components...");
    await pool.query(`ALTER TABLE inventory_components ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT 'Local';`);
    console.log("Successfully migrated database.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

main();
