import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query('SELECT current_database(), current_user');
    console.log('Connection OK:', res.rows[0]);
    const users = await pool.query('SELECT email FROM users');
    console.log('Users in DB:', users.rows.map(r => r.email));
  } catch (err) {
    console.error('Connection FAILED:', err);
  } finally {
    await pool.end();
  }
}
check();
