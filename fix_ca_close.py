import os

filepath = "src/routes/(marketing)/+page.svelte"
with open(filepath, 'r') as f: content = f.read()

old_close = """      </div>
      

    </div>
  </div>

  <!-- Technical Process Panel (Pinned Scrollytelling) -->"""

new_close = """      </div>
      

    </div>
    </div>
  </div>

  <!-- Technical Process Panel (Pinned Scrollytelling) -->"""

content = content.replace(old_close, new_close)

with open(filepath, 'w') as f: f.write(content)
