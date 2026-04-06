import re
import os

# 需要添加 BreadcrumbList 的页面及其路径
pages_to_update = {
    'weapons/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Weapons', 'https://bridgerwestern.cc/weapons/')
    ],
    'weapons/primary-weapons/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Weapons', 'https://bridgerwestern.cc/weapons/'),
        ('Primary Weapons', 'https://bridgerwestern.cc/weapons/primary-weapons/')
    ],
    'weapons/secondary-weapons/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Weapons', 'https://bridgerwestern.cc/weapons/'),
        ('Secondary Weapons', 'https://bridgerwestern.cc/weapons/secondary-weapons/')
    ],
    'weapons/weapon-mechanics/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Weapons', 'https://bridgerwestern.cc/weapons/'),
        ('Weapon Mechanics', 'https://bridgerwestern.cc/weapons/weapon-mechanics/')
    ],
    'items/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Items', 'https://bridgerwestern.cc/items/')
    ],
    'cards/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Cards', 'https://bridgerwestern.cc/cards/')
    ],
    'cards/all-cards/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Cards', 'https://bridgerwestern.cc/cards/'),
        ('All Cards', 'https://bridgerwestern.cc/cards/all-cards/')
    ],
    'locations/index.html': [
        ('Home', 'https://bridgerwestern.cc/'),
        ('Locations', 'https://bridgerwestern.cc/locations/')
    ],
}

def create_breadcrumb_json(breadcrumb_items):
    """生成 BreadcrumbList JSON"""
    items = []
    for i, (name, url) in enumerate(breadcrumb_items, 1):
        items.append(f'                {{ "@type": "ListItem", "position": {i}, "name": "{name}", "item": "{url}" }}')
    
    return ',\n'.join(items)

def add_breadcrumb_to_schema(filepath, breadcrumb_items):
    """在现有 Schema.org 中添加 breadcrumb"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已有 breadcrumb
    if '"breadcrumb"' in content or '@type.*BreadcrumbList' in content:
        print(f"Skip {filepath}: already has breadcrumb")
        return False
    
    breadcrumb_json = create_breadcrumb_json(breadcrumb_items)
    breadcrumb_block = f''',
        "breadcrumb": {{
            "@type": "BreadcrumbList",
            "itemListElement": [
{breadcrumb_json}
            ]
        }}'''
    
    # 在 Schema.org 的 } 前添加 breadcrumb
    # 查找最后一个 "url": "..." 后面的位置
    pattern = r'("url":\s*"https://bridgerwestern\.cc/[^"]*")\s*\n(\s*)\}'
    
    def replacer(match):
        return match.group(1) + breadcrumb_block + '\n' + match.group(2) + '}'
    
    new_content = re.sub(pattern, replacer, content, count=1)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ Updated {filepath}")
        return True
    else:
        print(f"✗ Failed to update {filepath}")
        return False

# 执行更新
updated_count = 0
for filepath, breadcrumb_items in pages_to_update.items():
    if os.path.exists(filepath):
        if add_breadcrumb_to_schema(filepath, breadcrumb_items):
            updated_count += 1
    else:
        print(f"File not found: {filepath}")

print(f"\nTotal updated: {updated_count}/{len(pages_to_update)}")
