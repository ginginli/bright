import re

# 定义关键词到链接的映射
keyword_links = {
    # Stands 相关
    'Bridger Western Stands database': 'stands/',
    'Bridger Western stands': 'stands/',
    'Arrow Shard fishing': 'stands/how-to-get-stand/',
    'Corpse Part KOTH events': 'stands/corpse-part-guide/',
    'Bridger Western Stand tier list': 'stands/stand-tier-list/',
    'Stand abilities': 'stands/stand-abilities/',
    
    # Weapons 相关
    'Bridger Western weapons system': 'weapons/',
    'Bridger Western weapons': 'weapons/',
    'Bridger Western Mares Leg': 'weapons/mares-leg/',
    'primary weapons': 'weapons/primary-weapons/',
    'secondary weapons': 'weapons/secondary-weapons/',
    
    # Cards 相关
    'Bridger Western card builds guide': 'cards/card-builds/',
    'Bridger Western Cards': 'cards/',
    'Tarot Cards': 'cards/',
    'how to get cards': 'cards/how-to-get-cards/',
    
    # Fishing 相关
    'Bridger Western fishing': 'fishing/',
    'fishing guide': 'fishing/',
    
    # Locations 相关
    'Mud Witch in the Swamp': 'locations/',
    'Bridger Western horse system': 'locations/horses/',
    'Horse Stables': 'locations/horses/',
    'Bridger Western map': 'locations/map/',
    
    # Items 相关
    'Bridger Western items': 'items/',
}

def add_links_to_text(text, base_path=''):
    """在文本中添加内链"""
    # 按长度排序，优先匹配长关键词
    sorted_keywords = sorted(keyword_links.keys(), key=len, reverse=True)
    
    for keyword in sorted_keywords:
        link = keyword_links[keyword]
        # 确保不重复添加链接
        if f'<a href="{link}"' not in text and f'<a href="{base_path}{link}"' not in text:
            # 使用正则替换，确保不在已有的 <a> 标签内
            pattern = f'(?<!<a[^>]*>)({re.escape(keyword)})(?![^<]*</a>)'
            replacement = f'<a href="{base_path}{link}">\\1</a>'
            text = re.sub(pattern, replacement, text, count=1)  # 每个关键词只替换一次
    
    return text

# 示例：为首页添加内链
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找 SEO 文本部分
seo_section_pattern = r'(<section[^>]*id="about"[^>]*>.*?<div class="container seo-block">)(.*?)(</div>\s*</section>)'
match = re.search(seo_section_pattern, content, re.DOTALL)

if match:
    before = match.group(1)
    seo_content = match.group(2)
    after = match.group(3)
    
    # 添加内链
    new_seo_content = add_links_to_text(seo_content)
    
    # 替换内容
    new_content = content.replace(match.group(0), before + new_seo_content + after)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✓ Updated index.html with internal links")
else:
    print("✗ Could not find SEO section in index.html")

