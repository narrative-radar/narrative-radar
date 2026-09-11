import re

def patch_terminal():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # 1. CRT Background and border
    content = content.replace(
        """bg-[var(--crt)] min-h-[400px] rounded-t-xl rounded-b-none border-t border-l border-r border-[#14261C]""",
        """bg-[var(--panel)] min-h-[400px] rounded-t-xl rounded-b-none border-t border-l border-r border-[var(--rule)]"""
    )
    
    # 2. Terminal Top Bar
    content = content.replace(
        """<div class="scr-bar flex items-center gap-3 px-4 py-2.5 bg-[#09120D] text-xs relative z-10" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 30px 100%, 20px calc(100% - 4px), 0 calc(100% - 4px)); border-bottom: 2px solid #14261C;">""",
        """<div class="scr-bar flex items-center gap-3 px-4 py-2.5 bg-[var(--panel2)] text-xs relative z-10 border-b border-[var(--rule)]">"""
    )
    
    # 3. Top bar texts
    content = content.replace("text-[#9ED8B3]", "text-white")
    content = content.replace(
        """<span class="ml-auto text-[#4E755D] font-mono text-[11px] bg-[#0E1F16] px-3 py-0.5 border-b border-[#163625]" style="clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);">""",
        """<span class="ml-auto text-[var(--dim)] font-mono text-[11px] bg-[var(--panel)] px-3 py-0.5 border border-[var(--rule)] rounded">"""
    )
    
    # 4. Code Stream (text-start/left align)
    content = content.replace(
        """<div class="flex-1 min-h-[236px] max-h-[236px] overflow-hidden p-3.5 px-4.5 font-mono text-xs leading-relaxed text-[#A4CBB1] relative z-10 break-words whitespace-pre-wrap">""",
        """<div class="flex-1 min-h-[236px] max-h-[236px] overflow-hidden p-3.5 px-4.5 font-mono text-xs leading-relaxed text-white text-left relative z-10 break-words whitespace-pre-wrap">"""
    )

    # 5. Feed Counters
    content = content.replace(
        """<div class="flex gap-4 px-4.5 py-2 border-t border-b border-[#14261C] bg-[#09120D] text-[11px] text-[#4E7360] font-mono relative z-10">""",
        """<div class="flex gap-4 px-4.5 py-2 border-t border-b border-[var(--rule)] bg-[var(--panel2)] text-[11px] text-[var(--dim)] font-mono relative z-10 text-left">"""
    )
    content = content.replace("text-[#A7E2BD]", "text-white")
    
    # 6. Feed Row border
    content = content.replace("border-[#0E1B15]", "border-[var(--rule)]")
    
    # 7. Feed text
    content = content.replace("text-[#E3F2E9]", "text-white")
    content = content.replace("text-[#5A826D]", "text-[var(--dim)]")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_terminal()
