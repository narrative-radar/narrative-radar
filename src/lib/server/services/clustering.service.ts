import * as tokenRepo from '../repositories/token.repository.js';
import * as clusterRepo from '../repositories/cluster.repository.js';
import { generateClusterLabel } from './labeling.service.js';
import type { Token, Cluster } from '../db/schema/index.js';

// Threshold: seberapa mirip vektor token baru dengan centroid agar bisa masuk cluster
const SIMILARITY_THRESHOLD = 0.75;
// Threshold untuk menandai cluster sebagai "breakout"
const BREAKOUT_MEMBER_MIN = 5;
const BREAKOUT_GROWTH_MIN = 50.0; 

/**
 * Main pipeline: takes all `pending_cluster` tokens, compares them to active clusters,
 * assigns them, updates centroids, and generates labels if needed.
 */
export async function runClusteringAssignment(): Promise<{ processed: number; newClusters: number }> {
	const pendingTokens = await tokenRepo.getTokensPendingCluster();
	if (pendingTokens.length === 0) {
		return { processed: 0, newClusters: 0 };
	}

	const activeClusters = await clusterRepo.getClustersWithCentroid();
	let newClustersCount = 0;

	for (const token of pendingTokens) {
		if (!token.embedding) continue;
		
		const tokenVec: number[] = JSON.parse(token.embedding);
		let bestMatch: Cluster | null = null;
		let highestSim = -1;

		// [1] Compare with existing centroids
		for (const cluster of activeClusters) {
			if (!cluster.centroid) continue;
			const clusterVec: number[] = JSON.parse(cluster.centroid);
			const sim = cosineSimilarity(tokenVec, clusterVec);
			
			if (sim >= SIMILARITY_THRESHOLD && sim > highestSim) {
				highestSim = sim;
				bestMatch = cluster;
			}
		}

		if (bestMatch) {
			// [2a] Assign to existing cluster
			await tokenRepo.assignTokenToCluster(token.id, bestMatch.id);
			
			const newMemberCount = bestMatch.memberCount + 1;
			
			// Recalculate centroid (incremental mean)
			const oldCentroidVec: number[] = JSON.parse(bestMatch.centroid!);
			const newCentroidVec = recalculateCentroid(oldCentroidVec, bestMatch.memberCount, tokenVec);
			
			// Mock growth rate for now (real logic requires querying previous hour count)
			// For V1, we simply bump the growth rate based on new members
			const simulatedGrowth = Number(bestMatch.growthRate) + (100 / newMemberCount);
			
			// Check breakout status
			const isBreakoutNow = newMemberCount >= BREAKOUT_MEMBER_MIN && simulatedGrowth >= BREAKOUT_GROWTH_MIN;
			const everReachedBreakout = bestMatch.everReachedBreakout || isBreakoutNow;

			// Recompute aggregate DB row
			await clusterRepo.recomputeCluster(bestMatch.id, {
				memberCount: newMemberCount,
				growthRate: simulatedGrowth,
				centroid: JSON.stringify(newCentroidVec),
				sparklinePoints: [...(Array.isArray(bestMatch.sparklinePoints) ? bestMatch.sparklinePoints : []), newMemberCount].slice(-12),
				status: 'active',
				everReachedBreakout
			});

			// Check if we need to generate a label (Brief §4a: at 2nd or 3rd member)
			if (!bestMatch.label && newMemberCount >= 2) {
				const clusterTokens = await tokenRepo.getTokensByClusterId(bestMatch.id);
				const names = clusterTokens.map((t) => t.name);
				const tickers = clusterTokens.map((t) => t.ticker);
				const label = await generateClusterLabel(names, tickers);
				await clusterRepo.setClusterLabel(bestMatch.id, label);
				// Update in memory for the next loop iteration
				bestMatch.label = label;
			}

			// Update in memory so subsequent tokens in this batch see the new centroid
			bestMatch.memberCount = newMemberCount;
			bestMatch.centroid = JSON.stringify(newCentroidVec);
			bestMatch.growthRate = simulatedGrowth.toString();

		} else {
			// [2b] No match -> Create new cluster
			const newCluster = await clusterRepo.createCluster({
				centroid: JSON.stringify(tokenVec),
				memberCount: 1,
				growthRate: '0',
				peakMemberCount: 1,
				peakGrowthRate: '0',
				status: 'active',
				sparklinePoints: [1], // Explicitly initialize sparkline to avoid Postgres null constraint
				everReachedBreakout: false,
				// label remains null until member 2
			});
			
			await tokenRepo.assignTokenToCluster(token.id, newCluster.id);
			
			// Add to in-memory active list for the rest of the batch
			activeClusters.push(newCluster);
			newClustersCount++;
		}
	}

	return { processed: pendingTokens.length, newClusters: newClustersCount };
}

// --- Utils ---

function cosineSimilarity(vecA: number[], vecB: number[]): number {
	let dotProduct = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < vecA.length; i++) {
		dotProduct += vecA[i] * vecB[i];
		normA += vecA[i] * vecA[i];
		normB += vecB[i] * vecB[i];
	}
	if (normA === 0 || normB === 0) return 0;
	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Incrementally update the mean of vectors.
 * new_mean = (old_mean * n + new_val) / (n + 1)
 */
function recalculateCentroid(oldCentroid: number[], oldCount: number, newVector: number[]): number[] {
	return oldCentroid.map((val, i) => {
		return ((val * oldCount) + newVector[i]) / (oldCount + 1);
	});
}
