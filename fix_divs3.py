import re

def fix_divs3():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Find the double </div> at the end just before <style>
    if "\n<style>" in content:
        content = content.replace("\n<style>", "\n</div>\n</div>\n<style>")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_divs3()
