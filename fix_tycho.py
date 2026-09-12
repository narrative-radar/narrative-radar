import re

def fix():
    with open('src/routes/(app)/manifesto/+page.svelte', 'r') as f:
        content = f.read()

    # Fix ASCII Art
    bad_ascii = """  _____ _   _  ____ _   _  ___  
 |_   _| \\ | |/ ___| | | |/ _ \\ 
   | | |  \\| | |   | |_| | | | |
   | | | |\\  | |___|  _  | |_| |
   |_| |_| \\_|\\____|_| |_|\\___/ """

    good_ascii = """  _____ __   __  ____  _   _   ___  
 |_   _|\\ \\ / / / ___|| | | | / _ \\ 
   | |   \\ V / | |    | |_| || | | |
   | |    | |  | |___ |  _  || |_| |
   |_|    |_|   \\____||_| |_| \\___/ """

    content = content.replace(bad_ascii, good_ascii)

    # Adjust Button spacing / height
    content = content.replace('min-h-[80vh] flex flex-col items-center justify-center py-24', 'flex flex-col items-center justify-center pt-16 pb-32')
    content = content.replace('mt-20 flex flex-col', 'mt-16 flex flex-col')

    with open('src/routes/(app)/manifesto/+page.svelte', 'w') as f:
        f.write(content)

fix()
