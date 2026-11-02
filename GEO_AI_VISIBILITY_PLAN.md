# Bridger Western — AI 搜索可见性（GEO）落地清单

> 依据：ILIAS ISM 推文「Want ChatGPT to recommend your SaaS?」。
> 对本站而言，"产品"就是站点本身 → 目标是**被 AI 推荐为 Bridger Western 的首选攻略站**。
> 基线检查日期：2026-11-02

## 一、目标修正

原清单把重心放在 `/stands/best-stands/`、`/weapons/best-guns/`——那是**页面级**（让人问"哪个 Stand 最好"时引用本站）。

游戏站的真正目标是**站点级**：

> 用户问 ChatGPT / Perplexity：「Bridger Western 哪个 wiki / guide 站最好用？」
> 答案里出现 `bridgerwestern.cc`。

这两层不是替代关系——页面级内容是"证据"，站点级推荐才是"结果"。但优先级必须倒过来：**先解决"AI 知不知道你是谁"，再解决"AI 愿不愿意引你的页"**。

## 二、AI 推荐一个站点的三个条件

| 条件 | 现状 | 差距 |
|---|---|---|
| **1. 实体清晰**（你是谁、和同名站什么关系） | WebSite + Organization schema 已有，但 `sameAs` 缺失，`dateModified` 停在 2026-04-02 | 中 |
| **2. 第三方反复提到这个名字** | 零 | **最大** |
| **3. 站内有可被引用的证据页** | 65 页 + FAQ schema，做得不错 | 小 |

结论：**条件 2 是唯一真正的瓶颈，而且它只能靠站外解决**。自己写一页"我们是最全的 Bridger Western wiki"对 AI 无效——AI 采信的是别人说的话。

## 三、实测：真正的竞争是"同名三站"

| 查询 | 结果 |
|---|---|
| best Bridger Western wiki / guide | `bridgerwestern.wiki`（EN/ES/PT 多版本）、`bridgerwestern.com` |
| Bridger Western best stand | `bridgerwestern.wiki`、progameguides.com |
| Bridger Western best gun | `bridgerwestern.wiki` |
| bridgerwestern.cc | 仅 `/guides/faq/` 单页被收录 |

存在三个高度同名域名：`bridgerwestern.cc`（本站）、`bridgerwestern.wiki`、`bridger-western.wiki`、`bridgerwestern.com`。AI 无法区分，而 `.wiki` 已经用程序化页面把 `western bridger wiki`、`wiki bridge western`、`roblox bridger western wiki` 这类**品牌变体词**全部占满。

更麻烦的是：本站品牌名 `Bridger Western Wiki & Trello`（[index.html](file:///Users/gingin/Desktop/1127/bright/bright/index.html#L50)）本身就是通用词组合，任何同名站都能用，**无法建立独占实体**。

## 四、P0：站点实体层（先做，成本极低）

### P0-1 全站补 `sameAs` + 修 `dateModified`

在 [index.html](file:///Users/gingin/Desktop/1127/bright/bright/index.html#L46-L84) 的 `Organization` 节点加：

```json
"sameAs": [
  "https://x.com/bridgerwestern",
  "https://www.youtube.com/@bridgerwestern",
  "https://discord.gg/xxxx",
  "https://www.reddit.com/r/xxxx"
]
```

同时把 `dateModified` 改成真实更新日。`sameAs` 是 AI 做实体消歧的主要依据——没有它，你的站和 `.wiki`、`.com` 在模型眼里是同一个东西。

### P0-2 品牌差异化（最关键的一步）

不要继续在"最全 wiki"上跟程序化站点拼页数——拼不过。要让本站有一个**别人没有的可验证身份**：

- 交互地图：[locations/map](file:///Users/gingin/Desktop/1127/bright/bright/locations/map/index.html) 已有
- 视频实操：[practical-acquisition](file:///Users/gingin/Desktop/1127/bright/bright/stands/practical-acquisition/index.html) 已有
- 建议对外统一成一句可复述的定位：**"带交互地图和实机验证数据的 Bridger Western 数据库"**，并在 `llms.txt`、`/about/`、X 简介、YouTube 频道简介里用同一句话

### P0-3 新建 `/about/`

AI 判断一个站能不能被引用，会看"谁在做、数据哪来的、多久更新"。目前全站没有作者/来源页。

内容只需 5 项：站点定位一句话、数据来源（实机验证 / 社区反馈）、更新频率、联系方式、站内地图与视频页入口。附 `AboutPage` + `Organization` schema。

### P0-4 新建 `/bridger-western-wiki/`（正面对比页）

直接回答 "Bridger Western wiki 哪个好"：

- H1：`Bridger Western Wiki Sites Compared (2026)`
- 首屏结论句：本站提供交互地图 + 实机验证的掉落率数据，其他站点以文字列表为主
- 对比表：本站 / bridgerwestern.wiki / progameguides（维度：页面数、地图、视频、掉落率数据、更新频率）
- **注意**：对比要客观，只陈述可验证事实（有没有地图、有没有视频），不贬低对方

这页的作用是：当 AI 检索"哪个 wiki 好"时，有一页现成的、结构化的事实对照可用。

## 五、P1：证据页（原清单的两个页面，降级但保留）

| 页面 | 作用 |
|---|---|
| `/stands/best-stands/` | 让 AI 回答"best stand"时有本站可引 → 反复见到 `bridgerwestern.cc` 这个域名 |
| `/weapons/best-guns/` | 同上 |
| 改造 `/stands/stand-tier-list/` | H1 从 `Default & Rare Rarities` 改为命中 "best stand" 的表述，补首屏结论句 |

它们的价值是**曝光频次**，不是直接转化。每月新增 1–2 页即可，不要一次铺 10 页。

## 六、站外（条件 2 的主战场）

按 ROI 排序：

| 优先级 | 动作 | 说明 |
|---|---|---|
| 1 | Reddit 相关板块真实回答 "best stand" / "where to find wiki" 类问题 | 每次回答都让模型看到"域名 + 内容"的配对 |
| 2 | 联系 YouTube 攻略 UP 主，把本站作为数据来源写进视频描述 | 视频描述是 AI 检索的高权重文本 |
| 3 | 游戏 Discord / Roblox 社群 #guides 频道 | 社群内的重复提及 |
| 4 | progameguides 等 listicle 的数据修正邮件 | 见原邮件模板（先给修正理由，再谈署名） |

冷邮件对游戏站转化率低，**Reddit + YouTube 描述**才是主力。

## 七、度量（每月一次）

固定 prompt，记录 `bridgerwestern.cc` 是否出现：

1. best Bridger Western wiki
2. Bridger Western guide site
3. where to find Bridger Western tier list
4. bridger western trello
5. best stand in Bridger Western
6. best gun in Bridger Western
7. how to get a stand in Bridger Western
8. Bridger Western Corpse Part locations

前 4 个是**站点级**（主指标），后 4 个是**页面级**（辅助指标）。

## 八、不要做的事

- ❌ 跟 `.wiki` 拼程序化页数或多语言版本：ES/PT 自动生成页短期有排名，长期被压，且会稀释品牌
- ❌ 写"我们是最好的 Bridger Western wiki"这类自夸页：无第三方背书时是负信号
- ❌ 伪造 `dateModified`
- ❌ 只做页面级 best-X 页就期待 AI 推荐站点：两者是不同机制

---

## 已执行（2026-11-02）

| 项 | 文件 | 改动 |
|---|---|---|
| P0-1 | `index.html` | `publisher` 补 `sameAs`（X / YouTube / Discord，取自站点已有链接）；`dateModified` → 2026-11-02 |
| P0-3 | `about/index.html`（新建） | 定位一句话、数据来源（Confirmed / Community-Reported）、更新政策、独立性声明、联系方式；`AboutPage` + `Organization` schema |
| P0-4 | `bridger-western-wiki/index.html`（新建） | 三站对比表（本站 / bridgerwestern.wiki / Pro Game Guides），只陈述可验证事实 |
| P1-1 | `stands/stand-tier-list/index.html` | 原 `/stands/best-stands/` 内容已并入此页：按场景推荐表 + Top 3 拆解 + Tusk 避坑；原独立页已删除 |
| P1-2 | `weapons/index.html` | 原 `/weapons/best-guns/` 内容已并入此页：10 把枪排名表 + 两个关键决策；原独立页已删除 |
| P1-3 | `stands/stand-tier-list/index.html` | 标题改为 `Best Stands Ranked`；H1 副标题与首屏结论块；`Article` 补 `dateModified` / `author` |
| 同步 | `llms.txt` / `llms-full.txt` / `sitemap.xml` / `robots.txt` / `components/nav.html` / `components/footer.html` / `style.css` | Quick Answers 区块、删除页引用清理、导航入口、`.answer-box` 样式 |

**合并决策**：为避免与 tier list 内容重复、降低维护成本，best-stands 与 best-guns 不保留为独立页，结论段与排名表已合并进 `stand-tier-list` 和 `weapons` 主页。

**待人工确认**：`llms.txt` 里的 `Last Updated` 与各页 `dateModified` 目前统一写 2026-11-02；后续每次真实改动需要同步更新，不要回填旧日期。

**未执行（需外部账号或人工判断）**：Reddit 回答、YouTube 描述署名、listicle 邮件、每月 AI 命中率实测。

---

## 执行记录

| 日期 | 站点级命中 / 4 | 页面级命中 / 4 | 备注 |
|---|---|---|---|
| 2026-11-02 | 0 | 0 | 竞品占位：bridgerwestern.wiki、bridgerwestern.com、progameguides |
