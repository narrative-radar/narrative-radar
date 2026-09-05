import { db } from './src/lib/server/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
    await db.execute(sql`TRUNCATE TABLE tokens CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE clusters CASCADE;`);
    console.log("Database wiped clean!");
    process.exit(0);
}
main();
