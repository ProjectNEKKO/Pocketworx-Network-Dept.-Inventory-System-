const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
    try {
        const res = await client.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5');
        console.log(res.rows);
    } catch (e) {
        console.log("No table yet or error: ", e.message);
    }
    process.exit(0);
});
