import re

def patch_data():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Import createQuery if not exists
    if 'import { createQuery } from ' not in content:
        content = content.replace(
            "import { onMount } from 'svelte';",
            "import { onMount } from 'svelte';\n  import { createQuery } from '@tanstack/svelte-query';"
        )

    # Add TanStack query for live data
    query_code = """
  const dashboardQuery = createQuery(() => ({
    queryKey: ['marketing_dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/clusters?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    refetchInterval: 15000 // real time
  }));

  let liveClusters = $derived(dashboardQuery.data?.clusters || []);
  let liveTokensTracked = $derived(dashboardQuery.data?.tokensTrackedToday || 0);
  let liveRecentTokens = $derived(dashboardQuery.data?.recentTokens || []);
"""
    
    if 'const dashboardQuery =' not in content:
        content = content.replace(
            "let howWorksRef = $state();",
            query_code + "\n  let howWorksRef = $state();"
        )
        
    # Replace static mock variables with live variables in the Pipeline section
    content = content.replace("{totalDataPoints > 0 ? (totalDataPoints / 10).toLocaleString() : '14,029'}", "{liveTokensTracked.toLocaleString()}")
    content = content.replace("{realClusters.length || 0}", "{liveClusters.length}")
    
    # Let's also remove the Emile Scrollytelling completely since it's "design lama"!
    # The scrollytelling is between `<!-- Technical Process Panel (Pinned Scrollytelling) -->` and `<!-- Track Record Preview -->`
    start_str = "<!-- Technical Process Panel (Pinned Scrollytelling) -->"
    end_str = "<!-- Track Record Preview -->"
    
    if start_str in content and end_str in content:
        start_idx = content.find(start_str)
        end_idx = content.find(end_str)
        content = content[:start_idx] + content[end_idx:]
        
    # Remove the JS logic for scrollytelling
    content = re.sub(r'if \(howWorksRef[^\}]+}[^\}]+}', '', content, flags=re.DOTALL)

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_data()
