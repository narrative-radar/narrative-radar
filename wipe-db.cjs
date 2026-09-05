const postgres = require('postgres');
require('dotenv').config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql`TRUNCATE TABLE tokens CASCADE;`;
    await sql`TRUNCATE TABLE clusters CASCADE;`;
    console.log('DB Wiped Clean!');
  } catch(e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
main();
