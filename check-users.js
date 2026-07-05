const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

async function checkUsers() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query('SELECT "userId", email, role, status FROM "User"');
  console.log(result.rows);
  await pool.end();
}
checkUsers().catch(console.error);
