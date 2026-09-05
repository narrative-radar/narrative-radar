import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
async function run() {
	console.log('Altering db...');
	try {
		await sql`ALTER TABLE clusters ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;`;
		console.log('Successfully altered!');
	} catch (e) {
		console.error(e);
	} finally {
		await sql.end();
	}
}
run();
