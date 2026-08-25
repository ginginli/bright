# 🔧 工具型网站 SEO 复用指南
## Fantasy Team Analyzer — 从 Bridger Western Wiki 策略复用

> 本指南将 Bridger Western Wiki 已验证的 SEO 策略，抽象成一套**工具型网站**可复用的方法论。
> 核心差异：内容站靠"长尾关键词矩阵"吃流量，工具站靠"解决具体问题的工具入口"吃流量，两者框架相通但重点不同。

---

## 一、工具型 vs 内容型：本质区别

| 维度 | 内容型（Bridger Western Wiki） | 工具型（Fantasy Team Analyzer） |
|------|------------------------------|-------------------------------|
| **用户意图** | 信息搜索："怎么获得 Stand" | 任务执行："分析我的队伍/预测本周得分" |
| **流量入口** | SEO 长尾关键词 | 工具功能 + 数据页 + 攻略内容 |
| **转化目标** | 广告曝光 / 停留时间 | 使用工具 / 注册 / 留存 |
| **核心页面** | 攻略、FAQ、指南 | 分析器、数据表、排名工具 |
| **Schema 重点** | Article / HowTo / FAQ | **WebApplication / SoftwareApplication / Dataset** |

**关键洞察：** 工具型网站不能只靠"描述工具"，必须靠**工具能解决的具体问题**来吸引流量。用户不会搜"fantasy team analyzer"（太泛），但会搜：
- "should I start player X this week"
- "who should I trade away in fantasy"
- "fantasy football rankings week 8"

---

## 二、可复用的核心框架（从 Bridger Western 直接套用）

### 1. 关键词矩阵表（复用，替换领域词）

Bridger Western 用 `中心词 + 机制词` 组合，工具站用 `玩家词 + 问题词` 组合：

```
中心词：fantasy football（利基主词）
机制词：analyzer / rankings / trade / start-sit / projections

组合成矩阵（每个都可能是独立页面）：
- fantasy football analyzer            → 首页/主工具
- fantasy football trade analyzer      → 交易分析工具
- fantasy football start sit tool      → 首发决策工具
- fantasy football weekly rankings     → 每周排名数据页
- fantasy football player projections  → 球员预测数据页
- fantasy football waivers pickups     → 捡漏建议页
```

**复用规则（原封不动照搬）：**
- 每个工具/数据页 = 一个 `中心词 + 一个机制词` 的组合
- 一个页面主打 1 个核心词 + 5-8 个变体词
- 避免首页堆砌所有词（要分散到子页）

---

### 2. 三层关键词阵地（复用，直接套用）

每个页面固定放三层，模板直接改关键词即可：

```html
<!-- 第1层：Meta 标签 -->
<title>【Fantasy Football Trade Analyzer】– 2026 完整指南</title>
<meta name="description" content="包含核心长尾词的描述，150-160字符">
<meta name="keywords" content="变体词1, 变体词2, 变体词3...">
<link rel="canonical" href="https://yourdomain.com/fantasy-football-trade-analyzer/">

<!-- 第2层：结构化数据（工具站改用 WebApplication！）-->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Fantasy Football Trade Analyzer",
  "applicationCategory": "SportsApplication",
  "operatingSystem": "Web",
  "description": "Analyze fantasy football trades, evaluate player value, and get start/sit recommendations.",
  "url": "https://yourdomain.com/fantasy-football-trade-analyzer/",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
</script>

<!-- 第3层：正文 SEO 文本块（500-800字，工具下方）-->
<section>
  <h2>Fantasy Football Trade Analyzer – Evaluate Trades in Seconds</h2>
  <p>第1段：<strong>核心词</strong> + 工具能解决的问题 + 差异化</p>
  <p>第2段：<strong>变体词</strong> + 具体数据/功能 + 使用方法</p>
  <p>第3段：<strong>机制词</strong> + <a>相关工具内链</a></p>
</section>
```

---

### 3. 自然关键词密度（复用公式）

**每 100 词 3-5% 密度：**
- 核心词 2-3 次
- 变体词各 1 次
- `<strong>` 强调 1-2 次
- 同义词替换避免重复

**3 段式 SEO 文本块模板（工具型改写）：**
```
第1段：核心词 × 2 + "Unlike other XX tools"（差异化）
      "Unlike other fantasy trade analyzers that only show player stats,
       our tool factors in scoring format, bye weeks, and SOS."
第2段：变体词 × 3 + 功能/数字（增强可信度）
第3段：机制词 × 2 + 2-3 个内链（连到其他工具/数据页）
```

---

### 4. 竞争词截流（复用，工具站更有效）

工具站天然适合"截流竞品工具"，写法：
```
"Unlike the official ESPN/Yahoo analyzer that requires login..."
"Better than free fantasy tools that don't account for PPR scoring..."
"100% free alternative to premium fantasy analysis platforms..."
```

---

## 三、工具型网站的专属 SEO 重点（内容站没有的）

### 1. WebApplication Schema 是核心武器

工具型网站最大的 SEO 机会是**富结果（Rich Results）**：

```json
{
  "@type": "SoftwareApplication",
  "name": "Fantasy Football Analyzer",
  "applicationCategory": "SportsApplication",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "ratingCount": "1200"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "review": {
    "@type": "Review",
    "reviewRating": { "@type": "Rating", "ratingValue": "4.5" },
    "author": { "@type": "Person", "name": "Fantasy Guru" }
  }
}
```

**收益：** Google 可能在搜索结果中直接显示**应用星级、评分、免费标识**，大幅提升点击率（CTR）。

---

### 2. 每个工具配套一个"数据页 + 攻略页"

工具型网站不能只有工具，必须围绕工具建立内容护城河：

```
工具站结构：
/tools/            → 工具中心页（列表所有工具）
/tools/trade-analyzer/    → 交易分析工具（WebApplication Schema）
/tools/start-sit/         → 首发决策工具
/rankings/         → 每周球员排名（数据页，高频更新）
/rankings/week-8/  → 单周排名（新鲜内容，重复访问）
/guides/           → 攻略内容（"如何使用交易分析器"）
```

**关键：** 数据页（rankings）是工具站的**流量引擎**，因为它：
- 每周更新 = Google 认为"新鲜"，更频繁抓取
- 用户每周都来查 = 高留存
- 每个球员 = 一个长尾关键词

---

### 3. 用 FAQ Schema 吃"工具相关问题"流量

用户搜工具相关问题时，FAQ 富结果能占据搜索页大片区域：

```html
<script type="application/ld+json">
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the fantasy trade analyzer work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our analyzer compares player value using PPR and standard scoring..."
      }
    },
    {
      "@type": "Question",
      "name": "Is the fantasy football analyzer free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all analysis tools are 100% free with no login required..."
      }
    }
  ]
}
</script>
```

---

### 4. Core Web Vitals 是生死线（工具站比内容站更严格）

工具站用户在等待时**不会等**，加载慢直接离开（高跳出率 = 排名惩罚）：
- **LCP < 2.5s**（工具本身要秒开）
- **CLS < 0.1**（工具 UI 不能跳动）
- **FID < 100ms**（交互要即时）

**建议：** 工具用独立 JS bundle 懒加载，首屏只渲染输入框。

---

### 5. LLMs.txt 对工具站的意义

AI 搜索引擎（ChatGPT、Perplexity）会被问"推荐一个免费的 fantasy analyzer"。工具站要确保：
- `llms.txt` 里清楚列出**每个工具的功能和免费特性**
- 让 AI 能理解你的工具**能解决什么问题**
- 写法示例：
```
- [Fantasy Football Trade Analyzer](https://yourdomain.com/tools/trade-analyzer/): Free tool to evaluate fantasy trades. Supports PPR/Standard, factors in bye weeks and SOS.
```

---

## 四、Fantasy Team Analyzer 落地关键词方案

### 首页（1个中心词 + 5个变体）
- 中心词：`fantasy team analyzer`
- 变体：`fantasy analyzer` / `fantasy football analyzer` / `fantasy team analysis tool` / `free fantasy analyzer` / `fantasy team optimizer`

### 工具页（每个工具 1 个核心词）
| 工具 | 核心词 | 变体词 |
|------|--------|--------|
| Trade Analyzer | fantasy trade analyzer | fantasy trade value / trade calculator / is this a fair trade |
| Start/Sit | fantasy start sit tool | who should I start / start sit decision |
| Projections | fantasy player projections | fantasy projections 2026 / QB projections |
| Rankings | fantasy football rankings | weekly rankings / fantasy rb rankings / waiver wire |

### 数据页（每周更新的流量引擎）
- `/rankings/week-8/` → `fantasy football rankings week 8`
- 每个位置独立页 → `fantasy rb rankings` / `fantasy qb rankings`

---

## 五、执行清单（按顺序）

### 第 1 周：基建
- [ ] 部署 1 个核心工具（Trade Analyzer）
- [ ] 配置 WebApplication Schema
- [ ] 创建 `robots.txt`、`sitemap.xml`、`llms.txt`
- [ ] 搭建 `rankings` 数据页框架（每周更新用）

### 第 2 周：内容
- [ ] 为工具写 500-800 字 SEO 文本块（3段式）
- [ ] 创建 FAQ Schema（5-8 个问题）
- [ ] 写 2-3 篇攻略（"如何使用分析器"）
- [ ] 建立内链：工具页 ↔ 数据页 ↔ 攻略页

### 第 3 周：验证
- [ ] Google Search Console 提交 sitemap
- [ ] Rich Results Test 验证 Schema
- [ ] PageSpeed Insights 优化 Core Web Vitals
- [ ] 设置 Google Analytics 转化追踪（工具使用次数）

### 第 4 周：扩展
- [ ] 根据搜索数据添加新工具
- [ ] 建立每周排名更新自动化
- [ ] 开始外链建设（Reddit r/fantasyfootball、Discord 社区）

---

## 六、一句话总结

> **把 Bridger Western 的"长尾关键词矩阵 + 三层关键词阵地 + 3段式文本块"框架原样搬过来，**
> **但把 Schema 从 Article 换成 WebApplication，**
> **把"攻略内容"换成"工具 + 每周更新的数据页"。**

工具站的核心是：**工具解决即时问题吸引用户，数据页每周更新吸引搜索引擎，攻略内容建立信任和深度。**
