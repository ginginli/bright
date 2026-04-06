#!/bin/bash

echo "正在为主要页面添加内部链接..."

# 提交当前更改
git add index.html
git commit -m "Add internal links to homepage SEO section

- Added 6 contextual internal links in SEO text
- Links to: stands, fishing, locations, cards, horses
- Using descriptive anchor text for better SEO"

echo "✓ 首页内链已添加并提交"
echo ""
echo "接下来需要手动为以下页面添加内链："
echo "- stands/index.html"
echo "- weapons/index.html"  
echo "- cards/index.html"
echo "- fishing/index.html"
echo "- locations/index.html"
echo ""
echo "建议在每个页面的 SEO 文本中添加 3-5 个相关内链"

