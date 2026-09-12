import { fetchRecentTokens, getMockRecentTokens } from '../services/dex.service.js';
import { generateEmbeddingsBatch } from '../services/embedding.service.js';

async function runTest() {
	console.log('🚀 Memulai Test Integrasi [Langkah 2]');
	
	// 1. Uji penarikan data dari DexScreener
	console.log('\n--- 1. Fetching from DexScreener ---');
	let tokens = await fetchRecentTokens();
	
	if (tokens.length === 0) {
		console.log('⚠️ DexScreener API limit / tidak merespon. Menggunakan data MOCK sebagai fallback.');
		tokens = getMockRecentTokens();
	}
	
	// Ambil 3 token saja untuk testing
	const sampleTokens = tokens.slice(0, 3);
	console.log(`✅ Berhasil mendapatkan ${sampleTokens.length} token:`);
	sampleTokens.forEach((t) => console.log(`   - ${t.ticker}: ${t.name}`));

	// 2. Uji generate embedding
	console.log('\n--- 2. Generating Embeddings ---');
	// Gabungkan nama dan ticker sebagai teks input untuk embedding
	const textsToEmbed = sampleTokens.map((t) => `${t.name} (${t.ticker})`);
	
	try {
		const vectors = await generateEmbeddingsBatch(textsToEmbed);
		console.log(`✅ Berhasil meng-generate ${vectors.length} vektor.`);
		console.log(`   Dimensi vektor 1: ${vectors[0].length}`);
		console.log(`   Contoh 3 angka pertama vektor 1: [${vectors[0].slice(0, 3).join(', ')}...]`);
	} catch (err) {
		console.error('❌ Gagal meng-generate embedding:', err);
	}

	console.log('\n🎉 Selesai! Integrasi DexScreener dan Embedding jalan.');
}

runTest().catch(console.error);
