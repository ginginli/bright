# 🔍 Bridger Western Wiki - 搜索功能说明

## 功能概述

全站搜索功能已成功集成到 Bridger Western Wiki 中，提供快速、准确的模糊搜索体验。

## ✨ 主要特性

### 1. 搜索入口
- **位置**: Header 右侧，导航栏和汉堡菜单之间
- **桌面端**: 显示为 `🔍 Search wiki...` 按钮
- **移动端**: 收起为 `🔍` 图标

### 2. 快捷键
- **Ctrl + K** (Windows/Linux) 或 **Cmd + K** (Mac) - 快速打开搜索
- **ESC** - 关闭搜索弹窗
- **↑ / ↓** - 在搜索结果中导航
- **Enter** - 跳转到选中的页面

### 3. 搜索功能
- **实时搜索**: 输入即搜，无需点击按钮
- **模糊匹配**: 支持拼写错误和部分匹配
- **分类展示**: 按 Stands、Guides、Weapons 等分类显示结果
- **智能排序**: 根据相关度自动排序
- **最少输入**: 输入 2 个字符即可开始搜索

### 4. 搜索范围
当前索引包含：
- 主页
- 所有 Stands 相关页面
- 所有 Stand 名称（The World, D4C, Killer Queen 等）
- 未来会自动扩展到新页面

## 📁 文件结构

```
bridgerwestern.cc/
├── search-index.json       # 搜索索引数据
├── js/
│   └── search.js          # 搜索逻辑
├── style.css              # 包含搜索样式
├── index.html             # 已集成搜索
└── stands/
    └── index.html         # 已集成搜索
```

## 🔧 如何添加新页面到搜索索引

编辑 `search-index.json`，添加新条目：

```json
{
  "title": "页面标题",
  "url": "/path/to/page.html",
  "category": "分类名称",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "description": "页面简短描述",
  "icon": "🎯"
}
```

### 字段说明：
- **title**: 页面标题（必填）
- **url**: 页面 URL（必填）
- **category**: 分类（Stands, Guides, Weapons 等）
- **keywords**: 搜索关键词数组
- **description**: 页面描述（显示在搜索结果中）
- **icon**: Emoji 图标（可选）

## 🎨 样式定制

搜索样式位于 `style.css` 的 "搜索功能样式" 部分，可以自定义：

- 搜索框颜色和边框
- 弹窗大小和位置
- 结果项样式
- 动画效果

## 📱 响应式设计

- **桌面端 (>768px)**: 显示完整搜索框
- **移动端 (≤768px)**: 收起为图标，点击后全屏展开

## 🚀 性能优化

- **懒加载**: 搜索索引在首次使用时加载
- **防抖处理**: 输入 300ms 后才执行搜索
- **结果限制**: 最多显示 20 条结果
- **文件大小**: 
  - Fuse.js: ~12KB (gzipped)
  - search.js: ~3KB
  - search-index.json: ~5KB

## 🔍 搜索示例

### 搜索 Stand 名称
输入: `the world`
结果: The World Stand 页面

### 搜索功能
输入: `how to get`
结果: How to Get a Stand 指南

### 搜索关键词
输入: `corpse part`
结果: 所有包含 Corpse Part 的页面

## 🐛 故障排除

### 搜索不工作
1. 检查浏览器控制台是否有错误
2. 确认 `search-index.json` 文件可访问
3. 确认 Fuse.js CDN 已加载

### 搜索结果不准确
1. 检查 `search-index.json` 中的关键词
2. 调整 `search.js` 中的 `threshold` 值（0-1，越小越精确）

### 样式问题
1. 清除浏览器缓存
2. 检查 CSS 是否正确加载
3. 检查是否有 CSS 冲突

## 📝 待办事项

- [ ] 添加搜索历史记录
- [ ] 添加热门搜索推荐
- [ ] 添加搜索结果高亮
- [ ] 添加拼音搜索支持
- [ ] 自动生成索引脚本

## 🎯 使用建议

1. **定期更新索引**: 每次添加新页面时更新 `search-index.json`
2. **优化关键词**: 添加用户可能搜索的关键词
3. **测试搜索**: 定期测试常见搜索词
4. **收集反馈**: 了解用户搜索习惯，优化索引

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. 网络请求是否成功
3. 文件路径是否正确

---

**版本**: 1.0.0  
**最后更新**: 2026-04-04  
**兼容性**: 所有现代浏览器（Chrome, Firefox, Safari, Edge）
