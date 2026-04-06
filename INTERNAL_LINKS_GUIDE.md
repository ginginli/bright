# 内部链接优化指南

## 已完成
- ✅ **index.html** - 添加了 6 个内链到 SEO 文本
- ✅ **stands/index.html** - 添加了 5 个内链（fishing, corpse-part-guide, stand-abilities, discord-coordination, how-to-get-stand）
- ✅ **weapons/index.html** - 添加了 5 个内链（primary-weapons, secondary-weapons, mares-leg, weapon-mechanics, stands）
- ✅ **cards/index.html** - 添加了 5 个内链（all-cards, locations, how-to-get-cards, card-builds）
- ✅ **fishing/index.html** - 添加了 5 个内链（stands, weapons/mares-leg, locations, stands/corpse-part-guide）
- ✅ **locations/index.html** - 添加了 6 个内链（weapons, cards, horses, weapons/mares-leg, fishing, stands/corpse-part-guide, map）
- ✅ **locations/horses/index.html** - 添加了 3 个内链（locations, stands, cards/all-cards）
- ✅ **weapons/mares-leg/index.html** - 添加了 4 个内链（fishing, locations, weapon-mechanics, secondary-weapons）

## 待优化页面

### 已完成所有主要页面的内链优化！

所有主要页面的 SEO 文本区块都已添加 3-6 个相关内链。

### 1. stands/index.html
**建议添加的内链（在 SEO 文本中）：**
```html
- "Arrow Shard fishing" → <a href="how-to-get-stand/">Arrow Shard fishing</a>
- "Corpse Part KOTH" → <a href="corpse-part-guide/">Corpse Part KOTH</a>
- "Stand tier list" → <a href="stand-tier-list/">Stand tier list</a>
- "Stand abilities" → <a href="stand-abilities/">Stand abilities</a>
- "Discord coordination" → <a href="discord-coordination/">Discord coordination</a>
```

### 2. weapons/index.html
**建议添加的内链：**
```html
- "primary weapons" → <a href="primary-weapons/">primary weapons</a>
- "secondary weapons" → <a href="secondary-weapons/">secondary weapons</a>
- "Mares Leg" → <a href="mares-leg/">Mares Leg</a>
- "weapon mechanics" → <a href="weapon-mechanics/">weapon mechanics</a>
- "Tier 3 dual wield" → <a href="weapon-mechanics/">Tier 3 dual wield</a>
```

### 3. cards/index.html
**建议添加的内链：**
```html
- "how to get cards" → <a href="how-to-get-cards/">how to get cards</a>
- "card builds" → <a href="card-builds/">card builds</a>
- "all cards" → <a href="all-cards/">all cards</a>
- "Mud Witch" → <a href="../locations/">Mud Witch</a>
- "best cards for bow" → <a href="card-builds/">best cards for bow</a>
```

### 4. fishing/index.html
**建议添加的内链：**
```html
- "Arrow Shard" → <a href="../stands/how-to-get-stand/">Arrow Shard</a>
- "Mares Leg" → <a href="../weapons/mares-leg/">Mares Leg</a>
- "Tackle Bait shop" → <a href="../locations/">Tackle Bait shop</a>
- "fishing FAQ" → <a href="faq/">fishing FAQ</a>
```

### 5. locations/index.html
**建议添加的内链：**
```html
- "Mud Witch" → <a href="#special">Mud Witch</a> (页面内锚点)
- "Horse Stables" → <a href="horses/">Horse Stables</a>
- "Blacksmith" → <a href="#special">Blacksmith</a>
- "world map" → <a href="map/">world map</a>
- "Dogbane Herb" → <a href="../fishing/">Dogbane Herb</a>
```

### 6. locations/horses/index.html
**建议添加的内链：**
```html
- "Tusk Stand" → <a href="../../stands/stand-abilities/#tusk-acts">Tusk Stand</a>
- "A True Cowboy card" → <a href="../../cards/all-cards/">A True Cowboy card</a>
- "Horse Stables locations" → <a href="../">Horse Stables locations</a>
```

### 7. weapons/mares-leg/index.html
**建议添加的内链：**
```html
- "fishing" → <a href="../../fishing/">fishing</a>
- "Blacksmith" → <a href="../../locations/">Blacksmith</a>
- "secondary weapons" → <a href="../secondary-weapons/">secondary weapons</a>
- "Tier 3" → <a href="../weapon-mechanics/">Tier 3</a>
```

## 内链最佳实践

### 1. 锚文本规则
- ✅ 使用描述性文本："Arrow Shard fishing guide"
- ❌ 避免通用文本："click here", "read more"

### 2. 链接密度
- 每个页面主要内容区域：3-5 个内链
- SEO 文本段落：每段 1-2 个内链
- 避免过度链接（不超过 10%的文字是链接）

### 3. 链接相关性
- 只链接到相关内容
- 优先链接到深层页面（如 /stands/how-to-get-stand/）
- 避免所有页面都链接到首页

### 4. 链接位置
- **最佳位置：** SEO 文本段落中（自然融入）
- **次佳位置：** "Related Guides" 模块（已有）
- **避免：** 导航栏和 footer 不计入内链密度

## 快速实施步骤

### 方法 1：手动添加（推荐，更自然）
1. 打开页面的 SEO 文本部分
2. 找到关键词（如 "Arrow Shard fishing"）
3. 用 `<a href="...">关键词</a>` 包裹
4. 确保链接路径正确（相对路径）

### 方法 2：批量脚本（快速但需检查）
```python
# 使用 add_internal_links.py 脚本
# 需要为每个页面定制关键词映射
```

## 检查清单

完成后检查：
- [ ] 每个页面至少 3 个内链
- [ ] 锚文本有描述性
- [ ] 链接都能正常访问
- [ ] 没有死链（404）
- [ ] 链接相关性强
- [ ] 没有过度优化（关键词堆砌）

## 预期效果

添加内链后：
- **用户体验：** 用户更容易发现相关内容，降低跳出率
- **SEO 效果：** Google 更好地理解页面关系，提升整站权重
- **页面权重：** 深层页面获得更多内链，排名机会增加
- **爬虫效率：** Google 更快发现和索引新页面

## 数据监控

在 Google Search Console 中监控：
- 内部链接数量（Links → Internal links）
- 页面索引状态（Coverage）
- 页面排名变化（Performance）

预计 2-4 周后看到效果。
