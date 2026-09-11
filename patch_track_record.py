import re

def patch_track_record():
    with open('src/routes/(app)/track-record/+page.svelte', 'r') as f:
        content = f.read()

    # Add the function
    func_code = """
	function generatePoints(data) {
		if (!data || data.length === 0) return '0,10 64,10';
		if (data.length === 1) return `0,10 64,10`;
		const max = Math.max(...data, 1);
		const min = Math.min(...data, 0);
		const range = max - min;
		const width = 64;
		const height = 18;
		const step = width / (data.length - 1);
		return data.map((val, i) => {
			const x = i * step;
			const y = 19 - ((val - min) / (range || 1)) * height;
			return `${x},${y}`;
		}).join(' ');
	}
"""
    if "function generatePoints" not in content:
        content = content.replace("let records = $derived(trackRecordQuery.data?.records || []);", "let records = $derived(trackRecordQuery.data?.records || []);\n" + func_code)

    # Change the grid-cols from grid-cols-[12px_1fr_110px_90px_130px] to include the 64px width chart
    content = content.replace("grid-cols-[12px_1fr_110px_90px_130px]", "grid-cols-[12px_1fr_70px_90px_90px_130px]")
    
    # Add an empty header for the chart in the table header
    header_regex = re.compile(r'(<div class="grid grid-cols-\[.*?\][^>]+>.*?<span>theme</span>.*?)(<span class="text-right">peak size</span>)', re.DOTALL)
    content = header_regex.sub(r'\1<span></span>\n\t\t\2', content)
    
    # Add the SVG in the loop
    svg_regex = re.compile(r'(<span class="block text-\[11\.5px\].*?</span>\n\t\t\t\t\t</div>)(.*?)<span class="font-\[var\(--font-mono\)\] text-\[12\.5px\]', re.DOTALL)
    
    svg_html = """
					<svg viewBox="0 0 64 20" class="w-[64px] h-[20px] overflow-visible">
						<polyline 
							points={generatePoints(r.sparklinePoints)} 
							fill="none" 
							stroke={rowColor} 
							stroke-width="1.6" 
							stroke-linecap="round" 
							stroke-linejoin="round"
						/>
					</svg>
					<span class="font-[var(--font-mono)] text-[12.5px]"""
    
    content = svg_regex.sub(r'\1' + svg_html, content)
    
    with open('src/routes/(app)/track-record/+page.svelte', 'w') as f:
        f.write(content)

patch_track_record()
