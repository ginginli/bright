# 🚀 IndexNow 设置指南

## 📌 什么是 IndexNow？

IndexNow 是一个开放协议，允许网站立即通知搜索引擎内容更新，而不是等待爬虫发现。

### 支持的搜索引擎
- ✅ Bing（Microsoft）
- ✅ Yandex（俄罗斯最大搜索引擎）
- ✅ Seznam.cz（捷克搜索引擎）
- ✅ Naver（韩国搜索引擎）
- ⚠️ Google 不支持（但有 Google Search Console）

---

## ✅ 已完成的设置

### 1. 创建 API Key 文件 ✅
**文件：** `a1fcb8ea0d9d467cb3a148652769f105.txt`  
**内容：** `a1fcb8ea0d9d467cb3a148652769f105`  
**URL：** https://bridgerwestern.cc/a1fcb8ea0d9d467cb3a148652769f105.txt

这个文件用于验证你是网站的所有者。

### 2. 创建提交脚本 ✅
**文件：** `indexnow-submit.sh`  
**功能：** 一次性提交所有页面 URL 到 IndexNow

脚本包含 19 个主要页面：
- 首页
- Stands（5个页面）
- Weapons（4个页面）
- Cards（4个页面）
- Fishing（1个页面）
- Locations（2个页面）
- Items（1个页面）

### 3. 提交到 Git ✅
已提交到 Git，等待部署到 Vercel。

---

## 📋 下一步操作

### 步骤 1：部署到 Vercel ⏳
**操作：** 推送代码到 GitHub，Vercel 会自动部署

```bash
git push
```

**验证：** 部署完成后，访问以下 URL 确认文件可访问：
```
https://bridgerwestern.cc/a1fcb8ea0d9d467cb3a148652769f105.txt
```

应该看到：
```
a1fcb8ea0d9d467cb3a148652769f105
```

---

### 步骤 2：运行提交脚本 ⏳
**前提：** 确认 API key 文件已部署并可访问

**操作：**
```bash
chmod +x indexnow-submit.sh
./indexnow-submit.sh
```

**预期结果：**
```
🚀 Submitting URLs to IndexNow...

{"status":"success"}

✅ IndexNow submission complete!
📊 Submitted 19 URLs to Bing, Yandex, and other IndexNow partners
```

**注意：** 需要安装 `jq` 工具（JSON 处理）：
```bash
# macOS
brew install jq

# 或者使用简化版本（不需要 jq）
curl -X POST "https://api.indexnow.org/indexnow" \
    -H "Content-Type: application/json" \
    -d '{
        "host": "bridgerwestern.cc",
        "key": "a1fcb8ea0d9d467cb3a148652769f105",
        "keyLocation": "https://bridgerwestern.cc/a1fcb8ea0d9d467cb3a148652769f105.txt",
        "urlList": [
            "https://bridgerwestern.cc/",
            "https://bridgerwestern.cc/stands/",
            "https://bridgerwestern.cc/weapons/"
        ]
    }'
```

---

### 步骤 3：设置 GitHub Actions 自动化 ⏳
**目标：** 每次部署后自动提交到 IndexNow

**创建文件：** `.github/workflows/indexnow.yml`

```yaml
name: IndexNow Submission

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Wait for Vercel deployment
        run: sleep 60
      
      - name: Submit to IndexNow
        run: |
          curl -X POST "https://api.indexnow.org/indexnow" \
            -H "Content-Type: application/json" \
            -d '{
              "host": "bridgerwestern.cc",
              "key": "a1fcb8ea0d9d467cb3a148652769f105",
              "keyLocation": "https://bridgerwestern.cc/a1fcb8ea0d9d467cb3a148652769f105.txt",
              "urlList": [
                "https://bridgerwestern.cc/",
                "https://bridgerwestern.cc/stands/",
                "https://bridgerwestern.cc/weapons/",
                "https://bridgerwestern.cc/cards/",
                "https://bridgerwestern.cc/fishing/",
                "https://bridgerwestern.cc/locations/"
              ]
            }'
```

---

### 步骤 4：注册 Bing Webmaster Tools ⏳
**目标：** 监控 IndexNow 提交状态和搜索表现

**操作：**
1. 访问 https://www.bing.com/webmasters
2. 使用 Microsoft 账号登录
3. 添加网站 `bridgerwestern.cc`
4. 验证所有权（使用 IndexNow API key 文件）
5. 提交 sitemap.xml：`https://bridgerwestern.cc/sitemap.xml`
6. 查看 IndexNow 提交历史

**预期结果：**
- 可以看到所有提交的 URL
- 可以看到索引状态
- 可以看到搜索表现数据

---

## 📊 IndexNow vs Google Search Console

| 功能 | IndexNow | Google Search Console |
|------|----------|----------------------|
| 支持的搜索引擎 | Bing, Yandex, Seznam, Naver | Google |
| 提交方式 | API（即时） | Sitemap + 手动请求 |
| 索引速度 | 几分钟到几小时 | 几天到几周 |
| 批量提交 | ✅ 支持（最多 10,000 个 URL） | ❌ 不支持 |
| 自动化 | ✅ 容易（API） | ⚠️ 需要手动 |
| 监控工具 | Bing Webmaster Tools | Google Search Console |

**建议：** 两者都要设置！
- IndexNow：快速通知 Bing 和其他搜索引擎
- GSC：Google 是最大的搜索引擎，必须设置

---

## 🔍 验证 IndexNow 是否工作

### 方法 1：检查 Bing Webmaster Tools
1. 登录 Bing Webmaster Tools
2. 进入 "IndexNow" 部分
3. 查看提交历史和状态

### 方法 2：手动搜索
等待 1-2 天后，在 Bing 搜索：
```
site:bridgerwestern.cc
```

应该看到你的页面被索引。

### 方法 3：检查 API 响应
提交后，API 会返回：
```json
{
  "status": "success"
}
```

或者错误信息：
```json
{
  "error": "Invalid key"
}
```

---

## 🚨 常见问题

### Q1: IndexNow 提交后多久能看到效果？
**A:** 通常几分钟到几小时，最多 1-2 天。

### Q2: 需要每次更新都提交吗？
**A:** 是的，每次内容更新都应该提交。建议使用 GitHub Actions 自动化。

### Q3: 可以提交多少个 URL？
**A:** 单次最多 10,000 个 URL。对于小网站，一次提交所有页面即可。

### Q4: IndexNow 会影响 Google 吗？
**A:** 不会。Google 不支持 IndexNow，需要单独设置 Google Search Console。

### Q5: API Key 文件必须放在根目录吗？
**A:** 是的，必须在 `https://yourdomain.com/{key}.txt`。

### Q6: 可以使用 Cloudflare 吗？
**A:** 可以，但你使用 Vercel 部署，不需要 Cloudflare 代理。保持 DNS 设置为"仅 DNS"即可。

---

## 📈 预期效果

### 第 1 周
- ✅ Bing 索引所有提交的页面
- ✅ Yandex 开始索引
- ⏳ 在 Bing 搜索结果中出现

### 第 2-4 周
- ✅ Bing 排名开始上升
- ✅ 开始有来自 Bing 的自然流量
- ✅ Bing Webmaster Tools 显示搜索表现数据

### 长期效果
- Bing 流量通常占总流量的 5-10%
- 对于某些关键词，Bing 排名可能比 Google 更好
- Yandex 和其他搜索引擎也会带来少量流量

---

## 🎯 下一步行动计划

### 今天（2026-04-07）
1. ✅ 创建 API key 文件
2. ✅ 创建提交脚本
3. ✅ 提交到 Git
4. ⏳ 推送到 GitHub（网络问题，稍后重试）
5. ⏳ 等待 Vercel 部署

### 明天（2026-04-08）
1. ⏳ 验证 API key 文件可访问
2. ⏳ 运行提交脚本
3. ⏳ 注册 Bing Webmaster Tools
4. ⏳ 提交 sitemap.xml

### 本周内（2026-04-07 - 2026-04-13）
1. ⏳ 设置 GitHub Actions 自动化
2. ⏳ 监控 Bing 索引状态
3. ⏳ 设置 Google Search Console（下一个任务）

---

## 📚 相关资源

### 官方文档
- [IndexNow 官网](https://www.indexnow.org/)
- [IndexNow API 文档](https://www.indexnow.org/documentation)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Cloudflare IndexNow 博客](https://blog.cloudflare.com/cloudflare-now-supports-indexnow/)

### 工具
- [IndexNow API 测试工具](https://www.indexnow.org/tools)
- [Bing URL Inspection Tool](https://www.bing.com/webmasters/url-inspection)

---

**创建时间：** 2026-04-07  
**最后更新：** 2026-04-07  
**状态：** 🟡 进行中（等待部署和验证）

