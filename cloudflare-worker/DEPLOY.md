# Cloudflare Worker 部署步骤

## 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

## 2. 登录 Cloudflare

```bash
wrangler login
```
浏览器会打开，用你的 Cloudflare 账号登录（没有账号去 cloudflare.com 免费注册）。

## 3. 进入 worker 目录部署

```bash
cd cloudflare-worker
wrangler deploy
```

部署成功后会显示你的 Worker URL，格式是：
`https://bridger-western-chat.YOUR_SUBDOMAIN.workers.dev`

## 4. 设置 API Key（安全方式，不写在代码里）

```bash
wrangler secret put GEMINI_API_KEY
```
然后粘贴你的 Gemini API key，回车确认。

## 5. 更新前端 Worker URL

打开 `js/chat.js`，把第 9 行的 URL 改成你的实际 Worker URL：

```js
const WORKER_URL = 'https://bridger-western-chat.YOUR_SUBDOMAIN.workers.dev';
```

## 6. 在网站页面引入聊天组件

在任意页面的 `</body>` 前加一行：

```html
<script src="/js/chat.js" defer></script>
```

或者加到所有页面共用的 components.js 里统一加载。

## 完成！

聊天按钮会出现在页面右下角 🤠
