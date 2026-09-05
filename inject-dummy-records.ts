import { db } from './src/lib/server/db/client.js';
import { clusters } from './src/lib/server/db/schema/index.js';

async function run() {
	console.log('Injecting dummy track records...');
	
	await db.insert(clusters).values([
		{
			id: 'dummy-record-1',
			name: 'retro game villains',
			label: 'retro game villains',
			memberCount: 22,
			peakMemberCount: 22,
			growthRate: '3.40',
			peakGrowthRate: '3.40',
			status: 'active',
			everReachedBreakout: true,
			centroid: '[0.1, 0.2, 0.3]',
			sparklinePoints: [5, 8, 12, 15, 18, 22],
			createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
			lastUpdated: new Date()
		},
		{
			id: 'dummy-record-2',
			name: 'haunted vending machines',
			label: 'haunted vending machines',
			memberCount: 10,
			peakMemberCount: 31,
			growthRate: '-0.50',
			peakGrowthRate: '5.10',
			status: 'archived',
			everReachedBreakout: true,
			centroid: '[0.1, 0.2, 0.3]',
			sparklinePoints: [10, 20, 31, 25, 15, 10],
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
			archivedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
			lastUpdated: new Date()
		},
		{
			id: 'dummy-record-3',
			name: 'corporate raccoon ceos',
			label: 'corporate raccoon ceos',
			memberCount: 2,
			peakMemberCount: 19,
			growthRate: '-0.10',
			peakGrowthRate: '2.75',
			status: 'archived',
			everReachedBreakout: true,
			centroid: '[0.1, 0.2, 0.3]',
			sparklinePoints: [2, 5, 12, 19, 10, 2],
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
			archivedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
			lastUpdated: new Date()
		}
	]).onConflictDoNothing();
	
	console.log('Done!');
	process.exit(0);
}

run().catch(console.error);
