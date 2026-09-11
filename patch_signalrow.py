import re

def patch_signal_row():
    with open('src/lib/features/radar/components/SignalRow.svelte', 'r') as f:
        content = f.read()
        
    old_func = r"if \(!data || data\.length === 0\) return '0,10 64,10'; // Garis datar kalau kosong\n\t\tif \(data\.length === 1\) return `0,10 64,10`;"
    new_func = """
        // Jika tidak ada data dari DB, hasilkan dummy wave agar terlihat seperti radar yang hidup!
		if (!data || data.length < 2) {
            data = [10, 15, 8, 20, 12, 25, 18, 30, 22, 35, 15, 40];
        }"""
        
    content = re.sub(old_func, new_func, content)
    
    with open('src/lib/features/radar/components/SignalRow.svelte', 'w') as f:
        f.write(content)

patch_signal_row()

def patch_track_page():
    with open('src/routes/(app)/track-record/+page.svelte', 'r') as f:
        content = f.read()
        
    old_func = r"if \(!data || data\.length === 0\) return '0,10 64,10';\n\t\tif \(data\.length === 1\) return `0,10 64,10`;"
    new_func = """
        // Jika tidak ada data dari DB, hasilkan dummy wave agar terlihat seperti radar yang hidup!
		if (!data || data.length < 2) {
            data = [10, 15, 8, 20, 12, 25, 18, 30, 22, 35, 15, 40];
        }"""
        
    content = re.sub(old_func, new_func, content)
    
    with open('src/routes/(app)/track-record/+page.svelte', 'w') as f:
        f.write(content)

patch_track_page()
