import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
async function run() {
	try {
		await sql`ALTER TABLE clusters ADD COLUMN tweeted_at TIMESTAMP WITH TIME ZONE;`;
		console.log('Added tweeted_at column.');
	} catch (e) {
		console.log('Column might already exist:', e.message);
	} finally {
		await sql.end();
	}
}
run();
