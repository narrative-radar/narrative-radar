import { db } from '../lib/server/db/client.js';
import { clusters } from '../lib/server/db/schema/index.js';

async function run() {
    const all = await db.select().from(clusters);
    console.log("Total clusters:", all.length);
    for(const c of all) {
        console.log("-", c.label, "(members:", c.memberCount, ")");
    }
    process.exit(0);
}
run();
