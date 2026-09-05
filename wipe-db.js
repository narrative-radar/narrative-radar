import postgres from 'postgres';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const dbUrl = envFile.split('\n').find(line => line.startsWith('DATABASE_URL')).split('=')[1].replace(/"/g, '');

async function main() {
  const sql = postgres(dbUrl);
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
