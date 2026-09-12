import re

def fix_time_ago():
    with open('src/routes/(app)/radar/+page.svelte', 'r') as f:
        content = f.read()

    # Fix timeAgo function
    old_time = """	function timeAgo(dateString: string) {
		const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
		if (diff < 60) return `${diff}s ago`;
		const min = Math.floor(diff / 60);
		if (min < 60) return `${min}m ago`;
		const h = Math.floor(min / 60);
		return `${h}h ago`;
	}"""
    
    new_time = """	function timeAgo(dateString: string) {
		const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
		if (diff < 60) return `${diff}s ago`;
		const min = Math.floor(diff / 60);
		if (min < 60) return `${min}m ago`;
		const h = Math.floor(min / 60);
		if (h < 24) return `${h}h ago`;
		const d = Math.floor(h / 24);
		return `${d}d ago`;
	}"""
    
    content = content.replace(old_time, new_time)
    
    with open('src/routes/(app)/radar/+page.svelte', 'w') as f:
        f.write(content)

fix_time_ago()
