import re

def update():
    with open('src/routes/api/tokens/[mint]/cluster/+server.ts', 'r') as f:
        content = f.read()

    # Add imports
    imports = """import { db } from '$lib/server/db/client.js';
import { generateEmbeddingsBatch } from '$lib/server/services/embedding.service.js';
import { runClusteringAssignment } from '$lib/server/services/clustering.service.js';"""
    
    content = content.replace("import { db } from '$lib/server/db/client.js';", imports)

    # Change the response logic
    old_logic = """				// Kasih tahu user bahwa tokennya sudah berhasil di-scan dan sedang diantrekan
				return json({ 
					status: 'processing', 
					message: 'Token found on chain! It has been added to our radar queue. Please check back in 1-2 minutes for the narrative analysis.' 
				});"""
    
    new_logic = """				// [REAL-TIME PROCESSING] Instead of waiting for cron, force the pipeline immediately!
				try {
					await generateEmbeddingsBatch();
					await runClusteringAssignment();
					
					// Re-check the database after processing
					const recheck = await db.select({
						token: tokens,
						cluster: clusters
					})
					.from(tokens)
					.leftJoin(clusters, eq(tokens.clusterId, clusters.id))
					.where(eq(tokens.mint, mint))
					.limit(1);

					if (recheck.length > 0 && recheck[0].token.status === 'clustered' && recheck[0].cluster) {
						return json({
							status: 'found',
							cluster: recheck[0].cluster,
							token: recheck[0].token
						});
					}
				} catch (pipelineErr) {
					console.error("Pipeline forced execution error:", pipelineErr);
				}

				// Fallback if real-time pipeline fails or still pending
				return json({ 
					status: 'processing', 
					message: 'Token found on chain! It has been added to our radar queue. Our AI is overwhelmed right now, please check back soon.' 
				});"""
    
    content = content.replace(old_logic, new_logic)

    with open('src/routes/api/tokens/[mint]/cluster/+server.ts', 'w') as f:
        f.write(content)

update()
