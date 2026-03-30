import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function test() {
  try {
    console.log("Connecting to:", process.env.DATABASE_URL);
    const res = await pool.query("SELECT * FROM users;");
    console.log("Users:", res.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    await pool.end();
  }
}
test();
