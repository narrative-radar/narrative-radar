import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
async function run() {
	try {
		await sql`DELETE FROM clusters WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')`;
		console.log('Dummy data deleted. System is now clean and strictly using real data.');
	} catch (e) {
		console.error(e);
	} finally {
		await sql.end();
	}
}
run();
