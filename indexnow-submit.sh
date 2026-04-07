#!/bin/bash
# IndexNow 提交脚本
# 在每次部署后运行此脚本通知搜索引擎

# 你的网站 URL
SITE_URL="https://bridgerwestern.cc"

# IndexNow API Key
API_KEY="a1fcb8ea0d9d467cb3a148652769f105"

# 要通知的 URL 列表（更新的页面）
URLS=(
    "$SITE_URL/"
    "$SITE_URL/stands/"
    "$SITE_URL/stands/how-to-get-stand/"
    "$SITE_URL/stands/stand-abilities/"
    "$SITE_URL/stands/corpse-part-guide/"
    "$SITE_URL/stands/discord-coordination/"
    "$SITE_URL/weapons/"
    "$SITE_URL/weapons/primary-weapons/"
    "$SITE_URL/weapons/secondary-weapons/"
    "$SITE_URL/weapons/mares-leg/"
    "$SITE_URL/cards/"
    "$SITE_URL/cards/all-cards/"
    "$SITE_URL/cards/card-builds/"
    "$SITE_URL/cards/how-to-get-cards/"
    "$SITE_URL/fishing/"
    "$SITE_URL/locations/"
    "$SITE_URL/locations/horses/"
    "$SITE_URL/locations/map/"
    "$SITE_URL/items/"
)

# 提交到 Bing IndexNow
echo "🚀 Submitting URLs to IndexNow..."
echo ""

curl -X POST "https://api.indexnow.org/indexnow" \
    -H "Content-Type: application/json" \
    -d "{
        \"host\": \"bridgerwestern.cc\",
        \"key\": \"$API_KEY\",
        \"keyLocation\": \"$SITE_URL/$API_KEY.txt\",
        \"urlList\": $(printf '%s\n' "${URLS[@]}" | jq -R . | jq -s .)
    }"

echo ""
echo "✅ IndexNow submission complete!"
echo "📊 Submitted ${#URLS[@]} URLs to Bing, Yandex, and other IndexNow partners"
