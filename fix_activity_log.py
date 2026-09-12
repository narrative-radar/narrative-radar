import re

def fix_activity_log():
    with open('src/routes/(app)/radar/+page.svelte', 'r') as f:
        content = f.read()

    # Replace the li in the activity log
    old_li = """<li class="flex items-center gap-[10px] text-[12.5px]">"""
    new_li = """<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li 
							class="flex items-center gap-[10px] text-[12.5px] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] p-1 -mx-1 rounded"
							ondblclick={() => copyCA(t.mint)}
							onclick={() => copyCA(t.mint)}
							title="Click to copy CA"
						>"""
    
    content = content.replace(old_li, new_li)

    with open('src/routes/(app)/radar/+page.svelte', 'w') as f:
        f.write(content)

fix_activity_log()
