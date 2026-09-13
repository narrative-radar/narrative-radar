import os

filepath = "src/routes/(marketing)/+page.svelte"
with open(filepath, 'r') as f: content = f.read()

old_block = """    <!-- Right Demo (Compact Pare-style) -->
    <div class="relative flex flex-col bg-[var(--panel)] rounded-[16px] p-6 shadow-[0_30px_80px_rgba(0,0,0,.45),0_0_0_1px_rgba(60,227,167,.10)] border border-white/5">"""

new_block = """    <!-- Right Demo (Compact Pare-style) -->
    <div class="flex flex-col w-full relative z-20">
      <div class="flex justify-end mb-3">
        <button class="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--panel)] shadow-lg border border-white/10 rounded-lg text-[11px] font-mono text-[var(--dim)] hover:text-white hover:border-[var(--live)]/50 hover:bg-[var(--panel2)] transition-all cursor-pointer group" onclick="navigator.clipboard.writeText('0xe2e4a2404c3923990ccc1e6435dc5b6476284992'); const span = this.querySelector('span'); span.innerText = 'Copied!'; setTimeout(() => span.innerText = 'CA: 0xe2e4a2...4992', 2000);">
          <span>CA: 0xe2e4a2...4992</span>
          <svg class="w-3.5 h-3.5 group-hover:text-[var(--live)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div>

      <div class="relative flex flex-col bg-[var(--panel)] rounded-[16px] p-6 shadow-[0_30px_80px_rgba(0,0,0,.45),0_0_0_1px_rgba(60,227,167,.10)] border border-white/5">"""

content = content.replace(old_block, new_block)

with open(filepath, 'w') as f: f.write(content)
