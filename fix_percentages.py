import os

def replace_in_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f: content = f.read()
    
    # Common replacements
    content = content.replace("=== 999999}", "=== 999999} <!-- not used anymore but keep syntax -->")
    content = content.replace("+{Math.round(Number(growthRate))}%", "+{Math.round(Number(growthRate))} new")
    content = content.replace("{Math.round(Number(growthRate))}%", "{Math.round(Number(growthRate))}")
    
    content = content.replace("+{Math.round(Number(selectedCluster?.peakGrowthRate))}%", "+{Math.round(Number(selectedCluster?.peakGrowthRate))} new")
    content = content.replace("{Math.round(Number(selectedCluster?.peakGrowthRate))}%", "{Math.round(Number(selectedCluster?.peakGrowthRate))}")
    
    content = content.replace("+{Math.round(Number(row.peakGrowthRate))}%", "+{Math.round(Number(row.peakGrowthRate))} new")
    content = content.replace("{Math.round(Number(row.peakGrowthRate))}%", "{Math.round(Number(row.peakGrowthRate))}")

    # Remove 999999 condition
    # Wait, the user just wants the % removed. 
    with open(filepath, 'w') as f: f.write(content)

replace_in_file("src/lib/features/radar/components/SignalRow.svelte")
replace_in_file("src/routes/(app)/radar/+page.svelte")
replace_in_file("src/routes/(app)/track-record/+page.svelte")
