import re

def update():
    with open('src/routes/api/tokens/[mint]/cluster/+server.ts', 'r') as f:
        content = f.read()

    # Change State 2 logic
    old_state2 = """			} else {
				// State 2: Ketemu + pending_embed / pending_cluster
				return json({ 
					status: 'processing', 
					message: 'Token detected on radar and is currently being processed. Please check back in a few minutes.' 
				});
			}"""
    
    new_state2 = """			} else {
				// State 2: Ketemu + pending_embed / pending_cluster
				// FORCE PIPELINE NOW
				try {
					await generateEmbeddingsBatch();
					await runClusteringAssignment();
					
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
				} catch (e) {}

				return json({ 
					status: 'processing', 
					message: 'Token detected on radar and is currently being processed by our AI. Due to high load, please check back soon.' 
				});
			}"""
    
    content = content.replace(old_state2, new_state2)

    with open('src/routes/api/tokens/[mint]/cluster/+server.ts', 'w') as f:
        f.write(content)

update()
