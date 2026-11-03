---
name: seo-internal-link-hub
description: Builds three-layer SEO internal link networks for content categories. Use when the user asks to improve internal linking, add hub pages, build Related Guides sections, or construct cross-category link networks. Do not use for one-off link additions or broken-link fixing alone.
---

# SEO Internal Link Hub

构建 **三层漏斗型内链网络**（Layer 1 Hub → Layer 2 枢纽 → Layer 3 叶子页）来提升 SEO 权重流动。适用于有多分类内容库的静态站点。

## 执行步骤

### 1. 盘点分类结构

```bash
# 扫描分类 → 叶子页映射
for dir in stands weapons cards locations items guides fishing; do
  echo "=== $dir ==="; ls $dir/*/index.html 2>/dev/null | wc -l
done
```

对每个分类确定：
- **Layer 1 Hub**：`category/index.html`（入口权重汇集）
- **Layer 2 枢纽页**：按主题分的子页面（如 `stand-tier-list/`、`stand-abilities/`）
- **Layer 3 叶子页**：具体条目详情页（如 `stands/the-world/`、`stands/d4c/`）

### 2. 插入 Related Guides 模块（核心动作）

在每个 Hub 页和 Layer 2 页的 `<!-- Footer -->` 或 `</div><!-- end page-toc-layout -->` **之前**，插入 6 张卡片的 Related Guides section：

```html
<!-- Related {Category} Guides (Internal Link Hub) -->
<section id="related-guides" style="background: rgba(43,28,17,0.04); margin-top: 40px;">
    <div class="container">
        <h2 class="section-title">📚 Related {Site Name} {Category} Guides</h2>
        <div class="grid-3">
            <!-- 同分类内链 3-4 张 -->
            <a href="../other-hub/" class="sketch-card article-card">
                <span class="article-tag verified">Database</span>
                <h3>{Title with SEO keyword}</h3>
                <p>{Desc with <strong>exact search phrase</strong>}</p>
                <span class="read-more">{CTA} →</span>
            </a>
            <!-- Cross-class 外链 2-3 张 -->
            <a href="../../other-category/" class="sketch-card article-card">
                <span class="article-tag strategy">Cross-Class</span>
                <h3>{Title}</h3>
                <p>{Why they're related}</p>
                <span class="read-more">{CTA} →</span>
            </a>
        </div>
    </div>
</section>
```

**锚文本规则**：必须包含完整长尾关键词（如 `<strong>how to win Corpse Part KOTH events</strong>`），不是页面标题本身。

### 3. 叶子页相似推荐

对 Layer 3 叶子页的 footer "Other X" 列，使用**规则系统**批量生成：
- 同一稀有度/标签 → 权重 +3
- 同一类型 → 权重 +2
- 共享 tags → 权重 +1/个（上限 +3）
- 特殊进化链（如 Star Platinum ↔ SPTW）→ 强制配对

使用 `scripts/update-stand-related.js` 作为模式参考，替换 STAND_DATA 字典即可适配新分类。

### 4. Cross-Class 互联

每个分类的 Related Guides 必须包含 **2-3 张跨分类卡片**：

| 分类 | 应该链到 |
|------|---------|
| Stands | Weapons（Stands 降低枪伤）、Items（Arrow Shard 获取） |
| Weapons | Cards（Card buff 武器）、Stands（PvP Stand meta） |
| Cards | Weapons（Card + Weapon 构建）、Locations（Mud Witch NPC） |
| Locations | Stands（Corpse Part spawn）、Weapons（Red Corner PvP） |
| Items | Weapons（Crafting → 武器升级）、Fishing（Arrow Shard） |

### 5. Footer `<span>` 修复

检查 Hub 页 footer 是否有 `<span>` 代替 `<a>` 来展示条目名 — 这是权重流失点，必须改为真正的链接。

### 6. 死链验证

完成所有改动后，运行验证脚本：

```bash
python3 scripts/validate-links.py
# OK: 171 / MISS: 0 才是正确状态
```

## 反模式

- ❌ 所有卡片链回同一个 Hub — 权重不扩散
- ❌ 锚文本用页面标题本身（如 "Stand Tier List"）— 错失长尾词
- ❌ SPTW/D4C 等热门条目霸占所有 "相似推荐" 位置
- ❌ 忘记 Cross-class — 分类形成孤岛
- ❌ 跳过死链验证 — 可能引入 404
