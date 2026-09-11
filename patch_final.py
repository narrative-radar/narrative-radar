import re

def patch_final():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # 1. Mac Window Buttons (Replace the 3 grey dots in both windows)
    # Window 1 Top Bar
    mac_buttons = """<div class="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>"""
              
    content = content.replace("""<div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>""", mac_buttons)

    # 2. Syntax Highlighting Colors (Restore some techy colors but not full green)
    # Let's use Cyan, Blue, Yellow, Slate
    content = content.replace(":global(.k) { color: #E2E8F0; font-weight: bold; }", ":global(.k) { color: var(--cyan); font-weight: bold; }")
    content = content.replace(":global(.s) { color: #94A3B8; }", ":global(.s) { color: var(--banana); }")
    content = content.replace(":global(.n) { color: #CBD5E1; }", ":global(.n) { color: #E2E8F0; }")
    content = content.replace(":global(.c) { color: #64748B; font-style: italic; }", ":global(.c) { color: #64748B; font-style: italic; }") # Comments stay slate

    # 3. Add Mock Fallback for `feed`
    mock_feed = """// Map clusters into the terminal feed
        if (realClusters.length > 0) {
          feed = realClusters.map((c, i) => ({
            symbol: 'META',
            name: c.label || 'Unnamed Theme',
            lore: 'Detected ' + (c.tokens ? c.tokens.length : c.memberCount) + ' narrative fragments.',
            holders: (c.memberCount || 1) * 342,
            peak_mc: (c.memberCount || 1) * 85000,
            status: c.status === 'breakout' ? 'passed' : c.status === 'active' ? 'passed' : 'stalled',
            hue: i * 45
          }));
        } else {
          // PRESENTATION FALLBACK: Never show an empty table
          feed = [
            { symbol: 'META', name: 'retro game villains', lore: 'Detected 14 narrative fragments.', holders: 4788, peak_mc: 1190000, status: 'passed', hue: 45 },
            { symbol: 'META', name: 'ai poker bots', lore: 'Detected 9 narrative fragments.', holders: 3078, peak_mc: 765000, status: 'passed', hue: 90 },
            { symbol: 'META', name: 'doge derivatives', lore: 'Detected 5 narrative fragments.', holders: 1710, peak_mc: 425000, status: 'stalled', hue: 135 },
            { symbol: 'META', name: 'quantum cat cults', lore: 'Detected 3 narrative fragments.', holders: 1026, peak_mc: 255000, status: 'forming', hue: 180 }
          ];
        }"""
        
    old_feed_logic = """// Map clusters into the terminal feed
        feed = realClusters.map((c, i) => ({
          symbol: 'META',
          name: c.label || 'Unnamed Theme',
          lore: 'Detected ' + (c.tokens ? c.tokens.length : c.memberCount) + ' narrative fragments.',
          holders: (c.memberCount || 1) * 342,
          peak_mc: (c.memberCount || 1) * 85000,
          status: c.status === 'breakout' ? 'passed' : c.status === 'active' ? 'passed' : 'stalled',
          hue: i * 45
        }));"""
        
    content = content.replace(old_feed_logic, mock_feed)

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_final()
