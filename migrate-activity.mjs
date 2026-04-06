import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log("Creating activity_logs table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          action VARCHAR(255) NOT NULL,
          detail TEXT NOT NULL,
          user_name VARCHAR(255),
          user_email VARCHAR(255),
          icon_type VARCHAR(50),
          color_class VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
    `);
    
    console.log("Migration successful! activity_logs table is ready.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
