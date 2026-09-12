import re

def fix_mock_tokens():
    with open('src/routes/api/clusters/[id]/tokens/+server.ts', 'r') as f:
        content = f.read()

    # Replace 'address:' with 'mint:'
    content = content.replace("address: 'Dx...1x'", "mint: 'DxBq...1x2y'")
    content = content.replace("address: '9M...Z2'", "mint: '9Md8...Z2a1'")
    content = content.replace("address: '4F...E8'", "mint: '4Fw1...E8b9'")

    with open('src/routes/api/clusters/[id]/tokens/+server.ts', 'w') as f:
        f.write(content)

fix_mock_tokens()
