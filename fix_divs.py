import re

def fix_divs():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Find the double </div> at the end just before <style>
    if "</div>\n</div>\n\n<style>" in content:
        content = content.replace("</div>\n</div>\n\n<style>", "</div>\n\n<style>")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_divs()
