# 组件系统迁移指南

## 概述
本系统将导航和页脚从每个HTML页面中抽离出来，集中维护在 `/components/` 目录中。这样可以：
- 一次更新，全局生效
- 保持设计一致性
- 减少维护工作量

## 文件结构
```
/components/
  ├── nav.html           # 导航组件
  ├── footer.html        # 页脚组件
/js/
  ├── components.js      # 组件加载器
```

## 如何迁移现有页面

### 步骤1：替换导航
将原有的 `<header>` 到 `</header>` 内容替换为：

```html
<!-- Navigation will be loaded here -->
<div id="nav-container"></div>
```

### 步骤2：替换页脚
将原有的 `<footer>` 到 `</footer>` 内容替换为：

```html
<!-- Footer will be loaded here -->
<div id="footer-container"></div>
```

### 步骤3：添加组件加载器
在页面的 `</body>` 标签前添加：

```html
<!-- Load components -->
<script src="/js/components.js"></script>
```

确保路径正确（根据页面深度调整）：
- 根目录页面：`/js/components.js`
- 子目录页面：`../js/components.js` 或 `../../js/components.js`

### 步骤4：调整导航链接
确保导航组件中的链接路径正确。组件中的链接已使用绝对路径（以 `/` 开头），适用于所有页面。

## 新页面模板

创建新页面时，使用以下结构：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题 - Bridger Western Wiki</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="页面描述">
    <meta name="keywords" content="关键词1, 关键词2, 关键词3">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="页面标题">
    <meta property="og:description" content="页面描述">
    <meta property="og:image" content="https://bridgerwestern.cc/background.png">
    
    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Guide",
        "name": "页面标题",
        "description": "页面描述",
        "url": "https://bridgerwestern.cc/页面路径/",
        "inLanguage": "en-US"
    }
    </script>
    
    <!-- CSS and Fonts -->
    <link rel="stylesheet" href="/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rye&family=Caveat:wght@600&family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="/favicon.png">
</head>
<body>
    <!-- Navigation will be loaded here -->
    <div id="nav-container"></div>

    <main class="container">
        <!-- 页面内容 -->
        <h1>页面标题</h1>
        <p>页面内容...</p>
    </main>

    <!-- Footer will be loaded here -->
    <div id="footer-container"></div>

    <!-- Load components -->
    <script src="/js/components.js"></script>
    
    <!-- Optional: Add search functionality -->
    <script src="/js/search.js"></script>
    <script>
        // Initialize search if needed
        if (typeof SearchInterface !== 'undefined') {
            const search = new SearchInterface();
        }
    </script>
</body>
</html>
```

## 迁移工具

已提供自动化迁移脚本 `migrate-components.sh`，可以批量迁移页面。

### 使用方法：
```bash
./migrate-components.sh
```

### 手动迁移步骤：
1. 备份要迁移的页面
2. 按照上述步骤替换导航和页脚
3. 测试页面功能
4. 提交更改

## 注意事项

1. **路径问题**：组件中的链接使用绝对路径，确保在所有页面都能正确工作
2. **JavaScript依赖**：页面需要JavaScript才能显示导航和页脚
3. **SEO影响**：无负面影响，组件在页面加载时立即加载
4. **浏览器兼容性**：使用现代JavaScript（ES6+），支持所有现代浏览器

## 维护指南

### 更新导航：
1. 编辑 `/components/nav.html`
2. 保存更改
3. 所有页面将自动使用新导航

### 更新页脚：
1. 编辑 `/components/footer.html`
2. 保存更改
3. 所有页面将自动使用新页脚

### 添加新导航项：
1. 在 `nav.html` 中添加新的 `<div class="nav-item">`
2. 确保链接路径正确
3. 如果需要，更新 `components.js` 中的 `setActiveNavItem()` 方法

## 故障排除

### 导航不显示：
- 检查 `components.js` 是否加载
- 检查控制台是否有错误
- 确保 `nav-container` div 存在

### 链接路径错误：
- 组件中使用绝对路径（以 `/` 开头）
- 根据页面深度调整组件加载器的路径

### 活动状态不正确：
- 检查 `setActiveNavItem()` 方法
- 确保当前URL路径匹配导航链接

## 测试页面
已创建测试页面：`/test-components.html`