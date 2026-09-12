import re

def rm_btn():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Remove the View Full Terminal button block
    btn_html = """      <a href="/radar" class="mt-6 h-[44px] rounded-xl bg-[var(--live)] hover:bg-[#56ECB6] text-[#06130D] font-semibold flex items-center justify-center transition-colors">
        View Full Terminal
      </a>"""
      
    content = content.replace(btn_html, "")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

rm_btn()
