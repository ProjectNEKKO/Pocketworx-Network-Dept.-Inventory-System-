import pkg from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load from .env.local 
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addConstraints() {
  const client = await pool.connect();
  try {
    console.log("Adding stock constraints...");
    await client.query("ALTER TABLE inventory_components ADD CONSTRAINT stock_not_negative CHECK (stock >= 0)");
    await client.query("ALTER TABLE gateways ADD CONSTRAINT quantity_not_negative CHECK (quantity >= 0)");
    console.log("Constraints added successfully!");
  } catch (err) {
    if (err.code === '42710') {
      console.log("Constraints already exist.");
    } else {
      console.error("Error adding constraints:", err.message);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addConstraints();
