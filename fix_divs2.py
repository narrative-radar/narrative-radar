import re

def fix_divs2():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Find the double </div> at the end just before <style>
    if "</div>\n\n<style>" in content:
        content = content.replace("</div>\n\n<style>", "\n<style>")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_divs2()
