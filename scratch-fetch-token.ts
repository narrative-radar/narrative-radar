import { db } from './src/lib/server/db/client.ts';
import { tokens } from './src/lib/server/db/schema/index.ts';

async function run() {
    const result = await db.select({ mint: tokens.mint }).from(tokens).limit(3);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
run();
