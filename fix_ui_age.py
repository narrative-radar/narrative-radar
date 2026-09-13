import os

filepath = "src/routes/(app)/radar/+page.svelte"
with open(filepath, 'r') as f: content = f.read()

# Replace NEXT SCAN pending
content = content.replace('<span class="text-white text-[16px] font-bold">pending</span>', '<span class="text-[var(--text-secondary)] text-[13px] font-mono mt-1">scheduler: off</span>')

# Inject formatClusterAge
func = """
	function formatClusterAge(ms) {
		const h = Math.floor(ms / (1000 * 60 * 60));
		if (h < 1) return '<1h';
		if (h < 24) return `${h}h`;
		const d = Math.floor(h / 24);
		if (d <= 30) return `${d}d`;
		const mo = Math.floor(d / 30);
		return `${mo}mo`;
	}
"""

if "function formatClusterAge" not in content:
    content = content.replace('function timeAgo(dateString: string) {', func + '\n\tfunction timeAgo(dateString: string) {')

# Replace the complex line
# old: <span>{activeTokens.length > 0 ? Math.floor((Date.now() - Math.min(...activeTokens.map(t => new Date(t.createdAt).getTime()))) / (1000 * 60 * 60)) : (selectedCluster?.createdAt ? Math.floor((Date.now() - new Date(selectedCluster.createdAt).getTime()) / (1000 * 60 * 60)) : 0)} hours</span>
# new: <span>{activeTokens.length > 0 ? formatClusterAge(Date.now() - Math.min(...activeTokens.map(t => new Date(t.createdAt).getTime()))) : (selectedCluster?.createdAt ? formatClusterAge(Date.now() - new Date(selectedCluster.createdAt).getTime()) : formatClusterAge(0))}</span>

old_span = '<span>{activeTokens.length > 0 ? Math.floor((Date.now() - Math.min(...activeTokens.map(t => new Date(t.createdAt).getTime()))) / (1000 * 60 * 60)) : (selectedCluster?.createdAt ? Math.floor((Date.now() - new Date(selectedCluster.createdAt).getTime()) / (1000 * 60 * 60)) : 0)} hours</span>'
new_span = '<span>{activeTokens.length > 0 ? formatClusterAge(Date.now() - Math.min(...activeTokens.map(t => new Date(t.createdAt).getTime()))) : (selectedCluster?.createdAt ? formatClusterAge(Date.now() - new Date(selectedCluster.createdAt).getTime()) : formatClusterAge(0))}</span>'

content = content.replace(old_span, new_span)

with open(filepath, 'w') as f: f.write(content)
