const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
    try {
        const res = await client.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'activity_logs'");
        console.log(res.rows);
    } catch (e) {
        console.log("Error: ", e.message);
    }
    process.exit(0);
});
