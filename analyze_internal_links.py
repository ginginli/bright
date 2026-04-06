import re
import os
from collections import defaultdict

def count_internal_links(filepath):
    """统计页面内的内部链接数量"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 排除导航栏和 footer 的链接
    # 只统计主要内容区域的链接
    main_content = content
    
    # 移除 header/nav 部分
    main_content = re.sub(r'<header>.*?</header>', '', main_content, flags=re.DOTALL)
    # 移除 footer 部分
    main_content = re.sub(r'<footer>.*?</footer>', '', main_content, flags=re.DOTALL)
    
    # 查找所有内部链接
    internal_links = re.findall(r'<a href="(?:\.\./|\./)([^"#]+)"[^>]*>([^<]+)</a>', main_content)
    
    return len(internal_links), internal_links

# 检查主要页面
pages_to_check = [
    'index.html',
    'stands/index.html',
    'weapons/index.html',
    'cards/index.html',
    'fishing/index.html',
    'items/index.html',
    'locations/index.html',
    'locations/horses/index.html',
    'weapons/mares-leg/index.html',
]

print("内部链接统计（不含导航和footer）：\n")
print(f"{'页面':<40} {'内链数量':<10}")
print("-" * 50)

for page in pages_to_check:
    if os.path.exists(page):
        count, links = count_internal_links(page)
        print(f"{page:<40} {count:<10}")
        if count < 3:
            print(f"  ⚠️  内链不足！建议添加")
    else:
        print(f"{page:<40} 文件不存在")

