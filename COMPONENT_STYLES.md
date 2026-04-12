# 组件样式指南

本文档说明导航和页脚组件如何正确引用CSS样式。

## CSS文件位置
- 主样式文件：`/style.css` (项目根目录)
- 组件位于：`/components/` 目录
- 组件加载器：`/js/components.js`

## 导航组件样式 (`/components/nav.html`)

导航组件使用以下CSS类名：

### 主要结构类
- `.main-nav` - 主导航容器 (flex布局)
- `.nav-item` - 导航项目容器 (相对定位)
- `.nav-link` - 导航链接
- `.nav-dropdown` - 下拉菜单
- `.nav-toggle` - 移动端导航切换按钮

### CSS样式细节
1. **桌面端样式** (768px以上):
   - `.main-nav`: flex布局，水平排列
   - `.nav-link`: 悬停时颜色变化
   - `.nav-dropdown`: 悬停在`.nav-item`上时显示，有动画效果
   - `.nav-dropdown a`: 每个下拉项有分隔线

2. **移动端响应式** (768px以下):
   - `.nav-toggle`: 显示切换按钮
   - `.main-nav`: 默认隐藏，`.main-nav.open`时显示为垂直布局
   - `.nav-link`: 全宽显示，有边框分隔
   - `.nav-dropdown`: 静态定位，左侧边框指示器
   - `.nav-item.active .nav-dropdown`: 点击时显示下拉

3. **活动状态**:
   - `.nav-link.active`: 当前页面导航项高亮显示
   - 由JavaScript组件加载器自动设置

## 页脚组件样式 (`/components/footer.html`)

页脚组件使用以下CSS类名：

### 主要结构类
- `footer` - 页脚容器
- `.footer-links` - 页脚链接容器
- `.footer-links a` - 页脚链接

### CSS样式细节
1. **基础样式**:
   - `footer`: 深色背景，浅色文字，居中文本
   - `.footer-links`: 顶部边距，链接间距
   - `.footer-links a`: 浅色链接，悬停时更明显

2. **响应式设计**:
   - 自动适配移动端
   - 链接在移动端保持可点击尺寸

## 如何使用组件

### 1. 在HTML页面中引用
```html
<!DOCTYPE html>
<html>
<head>
    <!-- 必须引用CSS -->
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <!-- 导航容器 -->
    <div id="nav-container"></div>
    
    <!-- 页面内容 -->
    <main>...</main>
    
    <!-- 页脚容器 -->
    <div id="footer-container"></div>
    
    <!-- 组件加载器 -->
    <script src="/js/components.js"></script>
</body>
</html>
```

### 2. CSS路径注意事项
- **根目录页面** (`index.html`): `href="style.css"`
- **子目录页面** (`/stands/index.html`): `href="../style.css"` 或使用绝对路径 `href="/style.css"`
- **推荐使用绝对路径** `/style.css` 以确保一致性

### 3. CSS覆盖和自定义
如果需要自定义样式，可以在主CSS文件之后添加额外样式：
```html
<link rel="stylesheet" href="/style.css">
<style>
    /* 自定义覆盖样式 */
    .nav-link.active {
        border-bottom: 2px solid #8a7360;
    }
</style>
```

## 已实现的CSS功能

### 1. 视觉设计系统
- 使用CSS变量定义颜色主题
- 西部风格字体 (Rye, Lora, Caveat)
- 牛皮纸背景与墨水色文字
- 手绘风格边框和阴影

### 2. 交互效果
- 导航悬停效果
- 下拉菜单动画
- 移动端触摸友好设计
- 按钮点击反馈

### 3. 响应式设计
- 移动端优先的断点设计
- 触摸目标尺寸优化 (最小44px)
- 字体大小和间距适配

## 故障排除

### 常见问题

1. **导航不显示下拉菜单**
   - 检查CSS是否加载正确
   - 确认`.nav-item:hover .nav-dropdown`样式存在

2. **移动端切换按钮不工作**
   - 确认`.nav-toggle`元素存在
   - 检查JavaScript是否正确设置点击事件
   - 验证`.main-nav.open`样式是否定义

3. **样式在不同页面不一致**
   - 确保所有页面使用相同的CSS路径
   - 推荐使用绝对路径 `/style.css`

4. **组件加载后样式丢失**
   - CSS路径可能是相对路径问题
   - 尝试使用绝对路径引用CSS
   - 检查CSS文件是否可访问

### 调试建议
1. 使用浏览器开发者工具检查元素应用的样式
2. 查看控制台是否有404错误 (CSS加载失败)
3. 检查网络面板确认CSS文件是否正确加载
4. 验证CSS类名是否与HTML中的类名匹配

## 更新和维护

当需要更新导航或页脚时：
1. 编辑 `/components/nav.html` 或 `/components/footer.html`
2. 所有页面将自动使用更新后的组件
3. 无需手动更新每个HTML文件

如需更改样式：
1. 编辑 `/style.css` 文件
2. 样式将应用于所有页面
3. 确保不破坏现有布局