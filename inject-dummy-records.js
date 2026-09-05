import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
async function run() {
	console.log('Injecting dummy track records...');
	try {
		await sql`
			INSERT INTO clusters (id, label, member_count, peak_member_count, growth_rate, peak_growth_rate, status, ever_reached_breakout, centroid, sparkline_points, created_at, archived_at, last_updated)
			VALUES 
			(
				'11111111-1111-1111-1111-111111111111', 'retro game villains', 22, 22, 3.40, 3.40, 'active', true, '[0.1]', '[5, 8, 12, 15, 18, 22]', NOW() - INTERVAL '30 minutes', NULL, NOW()
			),
			(
				'22222222-2222-2222-2222-222222222222', 'haunted vending machines', 10, 31, -0.50, 5.10, 'archived', true, '[0.1]', '[10, 20, 31, 25, 15, 10]', NOW() - INTERVAL '3 days', NOW() - INTERVAL '10 hours', NOW()
			),
			(
				'33333333-3333-3333-3333-333333333333', 'corporate raccoon ceos', 2, 19, -0.10, 2.75, 'archived', true, '[0.1]', '[2, 5, 12, 19, 10, 2]', NOW() - INTERVAL '5 days', NOW() - INTERVAL '48 hours', NOW()
			)
			ON CONFLICT DO NOTHING;
		`;
		console.log('Successfully injected dummy track records!');
	} catch (e) {
		console.error(e);
	} finally {
		await sql.end();
	}
}
run();
