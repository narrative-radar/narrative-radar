import re

def patch_api():
    with open('src/routes/api/clusters/+server.ts', 'r') as f:
        content = f.read()
        
    content = content.replace("tokensTrackedToday = 1204 + (d.getHours() * 300) + (d.getMinutes() * 5) + Math.floor(Math.random() * 5);\n\t\t}", "tokensTrackedToday += 1204 + (d.getHours() * 300) + (d.getMinutes() * 5) + Math.floor(Math.random() * 5);")
    
    with open('src/routes/api/clusters/+server.ts', 'w') as f:
        f.write(content)

patch_api()
