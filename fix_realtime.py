import re

def fix():
    with open('src/routes/api/tokens/[mint]/cluster/+server.ts', 'r') as f:
        content = f.read()

    # Replace bad imports
    old_imports = """import { generateEmbeddingsBatch } from '$lib/server/services/embedding.service.js';
import { runClusteringAssignment } from '$lib/server/services/clustering.service.js';"""
    content = content.replace(old_imports, "import { env } from '$env/dynamic/private';")

    # Fix State 2 execution
    old_try_1 = """				try {
					await generateEmbeddingsBatch();
					await runClusteringAssignment();
					
					const recheck = await db.select({"""
					
    new_try_1 = """				try {
					await fetch(new URL('/api/cron', request.url).toString(), { headers: { 'Authorization': `Bearer ${env.CRON_SECRET}` } });
					
					const recheck = await db.select({"""
    content = content.replace(old_try_1, new_try_1)

    # Fix State 3 execution
    old_try_2 = """				try {
					await generateEmbeddingsBatch();
					await runClusteringAssignment();
					
					// Re-check the database after processing
					const recheck = await db.select({"""
					
    new_try_2 = """				try {
					await fetch(new URL('/api/cron', request.url).toString(), { headers: { 'Authorization': `Bearer ${env.CRON_SECRET}` } });
					
					// Re-check the database after processing
					const recheck = await db.select({"""
    content = content.replace(old_try_2, new_try_2)

    with open('src/routes/api/tokens/[mint]/cluster/+server.ts', 'w') as f:
        f.write(content)

fix()
