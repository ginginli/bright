# 🎯 SEO 优化检查清单

## ✅ 已完成的优化

### 1. 基础 SEO 设置
- ✅ 所有页面有完整的 Title 标签（包含 "Wiki & Trello"）
- ✅ 所有页面有 Meta Description（150-160 字符）
- ✅ 所有页面有 Meta Keywords
- ✅ 所有页面有 Canonical URL
- ✅ 网站使用 HTTPS
- ✅ 有 robots.txt 文件
- ✅ 有 sitemap.xml 文件
- ✅ 有 llms.txt 和 llms-full.txt（AI 爬虫）

### 2. Open Graph 标签
- ✅ 所有页面有 og:type
- ✅ 所有页面有 og:url
- ✅ 所有页面有 og:title（带 emoji）
- ✅ 所有页面有 og:description
- ✅ 所有页面有 og:image（1200x630）
- ✅ 所有页面有 og:site_name
- ✅ 所有页面有 og:locale

### 3. Twitter Card 标签
- ✅ 所有页面有 twitter:card
- ✅ 所有页面有 twitter:title
- ✅ 所有页面有 twitter:description
- ✅ 所有页面有 twitter:image

### 4. 结构化数据（Schema.org）
- ✅ 首页有 WebSite 结构化数据
- ✅ 首页有 Organization 结构化数据
- ✅ 部分页面有 BreadcrumbList
- ✅ FAQ 页面有 FAQPage 结构化数据
- ✅ 教程页面有 HowTo 结构化数据
- ⚠️ 部分子页面缺少 BreadcrumbList（待补全）

### 5. 内部链接优化
- ✅ 首页有 6 个内链
- ✅ stands/index.html 有 5 个内链
- ✅ weapons/index.html 有 5 个内链
- ✅ cards/index.html 有 5 个内链
- ✅ fishing/index.html 有 5 个内链
- ✅ locations/index.html 有 6 个内链
- ✅ locations/horses/index.html 有 3 个内链
- ✅ weapons/mares-leg/index.html 有 4 个内链
- ✅ 所有内链使用描述性锚文本
- ✅ 所有内链相关性强

### 6. 移动端优化
- ✅ 响应式设计（viewport meta tag）
- ✅ 移动端导航菜单
- ⚠️ 需要在真实设备测试

### 7. 性能优化
- ✅ Google Fonts 使用 font-display:swap
- ✅ 使用 preconnect 预连接
- ✅ Google Analytics 异步加载
- ✅ Ahrefs Analytics 异步加载
- ⚠️ 图片未优化为 WebP 格式
- ⚠️ 未使用图片懒加载

### 8. 分析工具
- ✅ Google Analytics (G-FQ74EMR38G)
- ✅ Ahrefs Analytics
- ✅ Google Search Console（需要手动验证）

---

## 🔴 高优先级待办事项

### 1. 结构化数据补全
- [ ] 为所有子页面添加 BreadcrumbList
  - [ ] stands/how-to-get-stand/
  - [ ] stands/stand-abilities/
  - [ ] stands/corpse-part-guide/
  - [ ] stands/discord-coordination/
  - [ ] weapons/primary-weapons/
  - [ ] weapons/secondary-weapons/
  - [ ] weapons/weapon-mechanics/
  - [ ] cards/all-cards/
  - [ ] cards/card-builds/
  - [ ] cards/how-to-get-cards/
  - [ ] items/
  - [ ] 其他子页面...

### 2. Google Search Console 设置
- [ ] 访问 search.google.com/search-console
- [ ] 添加域名 bridgerwestern.cc
- [ ] 验证域名所有权（DNS TXT 记录）
- [ ] 提交 sitemap.xml
- [ ] 手动请求索引首页

### 3. 移动端测试
- [ ] 在 iPhone 上测试所有页面
- [ ] 在 Android 上测试所有页面
- [ ] 检查按钮是否可点击
- [ ] 检查文字是否可读
- [ ] 检查导航菜单是否正常

---

## 🟡 中优先级待办事项

### 4. 图片优化
- [ ] 将所有 PNG 图片转换为 WebP 格式
- [ ] 为所有图片添加 width 和 height 属性
- [ ] 为所有图片添加 alt 属性
- [ ] 实现图片懒加载（loading="lazy"）

### 5. Core Web Vitals 优化
- [ ] 测试 LCP（Largest Contentful Paint）
- [ ] 测试 FID（First Input Delay）
- [ ] 测试 CLS（Cumulative Layout Shift）
- [ ] 优化加载速度到 < 2.5 秒

### 6. 内容优化
- [ ] 为每个 Stand 创建独立页面
- [ ] 为每个武器创建独立页面
- [ ] 为每个卡牌创建独立页面
- [ ] 扩展长尾关键词覆盖

---

## 🟢 低优先级待办事项

### 7. 外链建设
- [ ] 提交到 Roblox 游戏导航站
- [ ] 在 Discord 社区分享
- [ ] 在 Reddit r/roblox 分享
- [ ] 与其他 Roblox wiki 交换友链
- [ ] 提交到 Hacker News

### 8. 高级 SEO 功能
- [ ] 添加 FAQ Schema 到更多页面
- [ ] 添加 VideoObject Schema（如果有视频）
- [ ] 添加 Article Schema 到教程页面
- [ ] 实现 AMP（Accelerated Mobile Pages）
- [ ] 添加 PWA（Progressive Web App）功能

### 9. 国际化
- [ ] 添加 hreflang 标签（如果有多语言版本）
- [ ] 考虑创建中文版本
- [ ] 考虑创建西班牙语版本

---

## 📊 监控和迭代

### 每周检查
- [ ] Google Search Console 数据
  - 展示次数
  - 点击次数
  - 平均排名
  - 索引状态
- [ ] Google Analytics 数据
  - 自然搜索流量
  - 页面停留时间
  - 跳出率
  - 转化率

### 每月检查
- [ ] 关键词排名变化
- [ ] 竞争对手分析
- [ ] 内容更新需求
- [ ] 技术 SEO 问题

### 每季度检查
- [ ] 全站 SEO 审计
- [ ] 内容策略调整
- [ ] 外链建设进展
- [ ] ROI 分析

---

## 🎯 关键指标目标

### 第 1 个月
- [ ] Google 收录所有页面
- [ ] 首页排名进入前 50 名
- [ ] 自然搜索流量 > 100 次/月

### 第 3 个月
- [ ] 首页排名进入前 20 名
- [ ] 长尾关键词排名 > 50 个
- [ ] 自然搜索流量 > 500 次/月

### 第 6 个月
- [ ] 首页排名进入前 10 名
- [ ] 长尾关键词排名 > 200 个
- [ ] 自然搜索流量 > 2000 次/月
- [ ] 月收入 > $100（如果有广告）

---

## 📚 SEO 资源

### 学习资源
- [Google SEO 指南](https://developers.google.com/search/docs)
- [Moz SEO 学习中心](https://moz.com/learn/seo)
- [Ahrefs SEO 博客](https://ahrefs.com/blog/)
- [Backlinko SEO 教程](https://backlinko.com/hub/seo)

### 工具
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [Ahrefs](https://ahrefs.com/)
- [SEMrush](https://www.semrush.com/)
- [Screaming Frog](https://www.screamingfrog.co.uk/)

### 测试工具
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)

---

**最后更新：** 2026-04-06  
**下次审查：** 2026-04-13（1 周后）
