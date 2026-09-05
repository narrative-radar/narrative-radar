import { insertToken, setTokenEmbeddingsBatch, getTokensByClusterId } from '../repositories/token.repository.js';
import { getActiveClusters, getClusterById } from '../repositories/cluster.repository.js';
import { runClusteringAssignment } from '../services/clustering.service.js';

// --- Data Uji (Mock) ---
// Kita akan simulasi 3 token yang berdekatan temanya, dan 1 yang beda jauh
const mockTokens = [
	{
		mint: 'abc1', ticker: '$RETRO', name: 'Retro Game Villain', 
		imageUrl: null, createdAt: new Date(),
		vector: [0.9, 0.1, 0.0] // Simulasi vektor sederhana 3 dimensi
	},
	{
		mint: 'abc2', ticker: '$8BIT', name: '8-Bit Boss', 
		imageUrl: null, createdAt: new Date(),
		vector: [0.85, 0.15, 0.0] // Mirip dengan abc1
	},
	{
		mint: 'xyz1', ticker: '$CAT', name: 'Cat in Tiny Hat', 
		imageUrl: null, createdAt: new Date(),
		vector: [0.0, 0.1, 0.9] // Beda jauh
	}
];

async function runTest() {
	console.log('🚀 Memulai Test Clustering [Langkah 3]');

	// 1. Masukkan ke DB dengan status pending_embed
	console.log('\n[1/3] Memasukkan token mock ke DB...');
	const insertedIds = [];
	for (const mt of mockTokens) {
		const id = await insertToken({
			mint: mt.mint,
			ticker: mt.ticker,
			name: mt.name,
			createdAt: mt.createdAt
		});
		insertedIds.push({ id, vector: mt.vector });
	}
	console.log(`✅ Masuk ${insertedIds.length} token.`);

	// 2. Simulasi hasil embedding selesai (update ke pending_cluster)
	console.log('\n[2/3] Set vektor embedding (pura-puranya service OpenAI selesai)...');
	const updates = insertedIds.map(t => ({
		id: t.id,
		embeddingJson: JSON.stringify(t.vector)
	}));
	await setTokenEmbeddingsBatch(updates);
	console.log(`✅ Token siap dicluster.`);

	// 3. Jalankan Clustering Service
	console.log('\n[3/3] Menjalankan Algoritma Clustering (Cosine Similarity)...');
	const result = await runClusteringAssignment();
	console.log(`✅ Clustering selesai. Diproses: ${result.processed} token, terbentuk: ${result.newClusters} cluster baru.`);

	// 4. Verifikasi hasil
	console.log('\n--- HASIL AKHIR ---');
	const clusters = await getActiveClusters();
	for (const c of clusters) {
		console.log(`\nCluster ID: ${c.id}`);
		console.log(`Label (dari LLM): ${c.label || '(masih null - butuh min 2 anggota)'}`);
		console.log(`Member Count: ${c.memberCount}`);
		console.log(`Peak Member: ${c.peakMemberCount}`);
		console.log(`Sparkline Points:`, c.sparklinePoints);
		
		const members = await getTokensByClusterId(c.id);
		console.log(`Anggota (${members.length}):`);
		members.forEach(m => console.log(`  - ${m.ticker} (${m.name})`));
	}
	
	process.exit(0);
}

runTest().catch(console.error);
