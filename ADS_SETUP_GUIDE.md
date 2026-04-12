# 动态广告系统设置指南

## 🎯 概述

本文档介绍如何在现有页面中插入广告代码。我们推荐使用**动态广告系统**而不是静态插入广告代码。

## 📊 两种方案对比

### 方案A：静态插入广告代码 (不推荐)
- **方式**：直接在HTML文件中插入广告代码
- **缺点**：
  - 广告代码重复出现在每个页面
  - 难以管理和更新
  - 代码冗余，维护困难
  - 与现有动态系统冲突

### 方案B：动态广告系统 (推荐✅)
- **方式**：通过JavaScript动态加载广告
- **优点**：
  - 集中配置，一处修改，全局生效
  - 灵活控制广告位置和开关
  - 干净的HTML代码
  - 更好的性能和用户体验

## 🚀 快速开始

### 方法1：使用Make命令（推荐）

```bash
# 先预览将会做什么更改（安全）
make enable-dynamic-ads-dry

# 确认无误后执行
make enable-dynamic-ads
```

### 方法2：直接运行脚本

```bash
# 预览模式
node scripts/enable-dynamic-ads.js --dry-run

# 执行模式
node scripts/enable-dynamic-ads.js
```

### 方法3：手动添加

如果你只需要为单个页面添加，可以手动添加以下代码：

```html
<!-- 在 </body> 标签前添加 -->
<!-- Advertising configuration -->
<script src="/js/ads-config.js"></script>

<!-- Ad manager (loads after other scripts) -->
<script src="/js/ads-manager.js"></script>
```

## 🔧 广告位置配置

动态广告系统支持以下位置：

### 当前已启用的位置：
1. **页眉广告** (header) - 页面顶部
2. **中间内容广告** (middle) - 内容区域中间
3. **页脚广告** (footer) - 页面底部

### 配置位置：
编辑 `/js/ads-config.js` 文件：

```javascript
placements: {
    header: {
        enabled: true,   // ✅ 开启页眉广告
        containerId: 'ad-header',
        priority: 'high'
    },
    middle: {
        enabled: true,   // ✅ 开启中间内容广告
        containerId: 'ad-middle',
        priority: 'medium'
    },
    footer: {
        enabled: true,   // ✅ 开启页脚广告
        containerId: 'ad-footer',
        priority: 'low'
    }
}
```

## 🎨 广告样式

系统自动应用以下CSS样式：

- **`.ad-container`** - 通用广告容器
- **`.ad-header`** - 页眉广告样式
- **`.ad-middle`** - 中间内容广告样式（带虚线边框）
- **`.ad-footer`** - 页脚广告样式

## 📋 批量处理流程

### 步骤1：预览更改
```bash
make enable-dynamic-ads-dry
# 或
node scripts/enable-dynamic-ads.js --dry-run
```

这会显示：
- 哪些页面将被修改
- 将添加哪些脚本
- 不会实际修改文件

### 步骤2：执行更改
```bash
make enable-dynamic-ads
# 或
node scripts/enable-dynamic-ads.js
```

### 步骤3：验证结果
脚本会显示处理摘要：
- 处理的页面数量
- 跳过的页面（已包含动态广告）
- 添加的脚本引用

## 🔍 检查是否成功

### 方法1：查看页面源码
打开页面，查看源码中是否包含：
```html
<script src="/js/ads-config.js"></script>
<script src="/js/ads-manager.js"></script>
```

### 方法2：控制台检查
打开浏览器的开发者工具（F12），在控制台中输入：
```javascript
// 检查广告管理器是否已加载
typeof window.adManager !== 'undefined'
// 应该返回 true

// 检查广告配置
window.AdConfig.placements
// 应该显示配置的位置
```

### 方法3：视觉检查
刷新页面后，应该能看到：
1. 页眉位置的广告容器
2. 中间内容区域的广告容器
3. 页脚位置的广告容器

## 🛠️ 故障排除

### 问题1：广告未显示
**检查步骤：**
1. 确认脚本已正确添加
2. 检查浏览器控制台是否有错误
3. 确认 `ads-config.js` 中的 `enabled: true`

### 问题2：重复的广告
**原因：** 可能同时存在静态广告代码和动态广告
**解决：** 删除HTML文件中的静态广告代码，只保留动态系统

### 问题3：位置不正确
**解决：** 修改 `ads-manager.js` 中的插入逻辑

## ⚙️ 高级配置

### 修改广告代码
编辑 `/js/ads-config.js`：
```javascript
mainAd: {
    script: '你的广告脚本URL',
    containerId: '你的容器ID'
}
```

### 添加新的广告位置
1. 在 `ads-config.js` 的 `placements` 中添加新位置
2. 在 `ads-manager.js` 的 `insertAdContainer()` 方法中添加处理逻辑
3. 在CSS中添加对应的样式

### 广告加载延迟
```javascript
settings: {
    loadDelay: 1000,  // 延迟1秒加载广告
    respectDNT: true, // 尊重"请勿追踪"设置
    loadAfterContent: true // 内容加载后加载广告
}
```

## 📈 监控和优化

### 1. 性能监控
- 广告脚本是否影响页面加载速度
- 广告容器是否正确渲染

### 2. 效果监控
- 广告展示次数
- 点击率（如果需要）

### 3. 用户反馈
- 广告是否干扰用户体验
- 位置是否合适

## 🎉 完成后的好处

### 对于开发者：
- ✅ 一处配置，全局生效
- ✅ 易于维护和更新
- ✅ 代码整洁，无重复
- ✅ 灵活的广告控制

### 对于用户：
- ✅ 一致的广告体验
- ✅ 加载性能更好
- ✅ 尊重用户隐私（支持DNT）
- ✅ 非侵入式的广告位置

## 📞 支持

如果遇到问题：
1. 查看控制台错误信息
2. 检查脚本路径是否正确
3. 确保文件权限正常
4. 验证HTML结构是否支持广告插入

---

**推荐使用动态广告系统！** 它提供了更好的可维护性、灵活性和用户体验。