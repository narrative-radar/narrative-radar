import os

def replace_in_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f: content = f.read()
    
    # Replace " new" with " in 24h"
    content = content.replace("} new", "} in 24h")
    
    with open(filepath, 'w') as f: f.write(content)

replace_in_file("src/lib/features/radar/components/SignalRow.svelte")
replace_in_file("src/routes/(app)/radar/+page.svelte")
replace_in_file("src/routes/(app)/track-record/+page.svelte")
