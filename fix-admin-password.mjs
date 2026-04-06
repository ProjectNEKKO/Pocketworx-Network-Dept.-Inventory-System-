import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixPasswords() {
  const correctHash = '$2b$10$YSRzMb2LJIdwBp8ddcw3l.fxkBjTvGaHLRu032CRV5k71CdRdNTUi'; // 'packetworx'
  const emails = [
    'admin@packetworx.com', 
    'admin@packetwokx.com', 
    'co-admin@packetworx.com', 
    'user@packetworx.com'
  ];

  try {
    console.log("Connecting to database to fix passwords and ensure admin accounts exist...");
    
    for (const email of emails) {
      // Try to update
      const updateResult = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        [correctHash, email]
      );
      
      if (updateResult.rowCount === 0) {
        // If update failed, the user might not exist. Let's insert them safely.
        console.log(`User not found: ${email}. Attempting to create...`);
        const role = email.includes('admin') ? (email.includes('co-admin') ? 'co-admin' : 'admin') : 'user';
        await pool.query(
          "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
          [email, correctHash, role]
        );
        console.log(`Ensured user exists: ${email}`);
      } else {
        console.log(`Successfully updated password for: ${email}`);
      }
    }
    
    console.log("Database accounts and passwords synced!");
  } catch (err) {
    console.error("Failed to fix passwords:", err.message);
  } finally {
    await pool.end();
  }
}

fixPasswords();
