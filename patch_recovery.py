import re

def fix_signal_row():
    with open('src/lib/features/radar/components/SignalRow.svelte', 'r') as f:
        content = f.read()
    
    # Strip everything from the first "Jika tidak ada data" to the end of the script tag, and restore it.
    script_regex = re.compile(r'function generatePoints\(data: number\[\]\) \{.*?\}</script>', re.DOTALL)
    
    correct_script = """function generatePoints(data: number[]) {
		if (!data || data.length < 2) {
			data = [10, 15, 8, 20, 12, 25, 18, 30, 22, 35, 15, 40];
		}
		
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
</script>"""
    
    content = script_regex.sub(correct_script, content)
    
    # Wait, the previous bug might have eaten the rest of the file too?
    # No, it just duplicated `// Jika tidak ada data` for every character? Let's check how much was destroyed.
