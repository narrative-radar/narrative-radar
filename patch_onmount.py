import re

def patch_onmount():
    with open('src/routes/(app)/radar/+page.svelte', 'r') as f:
        content = f.read()

    old_onmount = """	onMount(() => {
		scanInterval = setInterval(() => {
			scanSeconds--;
			if (scanSeconds < 0) scanSeconds = 300;
		}, 1000);

		// Scramble title
		const titleEl = document.getElementById("dashTitle");
		if (titleEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			const text = titleEl.innerText;
			scrambleText(titleEl, text, 1100, 100);
		}
	});"""
    
    new_onmount = """	onMount(() => {
		scanInterval = setInterval(() => {
			scanSeconds--;
			if (scanSeconds < 0) scanSeconds = 300;
		}, 1000);

		// Scramble title
		const titleEl = document.getElementById("dashTitle");
		if (titleEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			const text = titleEl.innerText;
			scrambleText(titleEl, text, 1100, 100);
		}
		
		// Auto-open detail panel if ?cluster= query parameter is present
		const urlParams = new URLSearchParams(window.location.search);
		const clusterParam = urlParams.get('cluster');
		if (clusterParam) {
			openDetail(clusterParam);
		}
	});"""

    content = content.replace(old_onmount, new_onmount)
    with open('src/routes/(app)/radar/+page.svelte', 'w') as f:
        f.write(content)

patch_onmount()
