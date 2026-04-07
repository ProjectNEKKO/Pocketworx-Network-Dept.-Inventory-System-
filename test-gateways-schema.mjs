const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gateways'").then(res => {
  require('fs').writeFileSync('gateways_schema.json', JSON.stringify(res.rows, null, 2));
  pool.end();
}).catch(console.error);
