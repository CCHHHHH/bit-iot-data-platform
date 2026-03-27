# 主题系统快速开始指南

## 🚀 立即体验主题切换

### 步骤 1: 刷新页面

打开应用，您会看到顶部导航栏右侧有一个**太阳/月亮图标**的按钮。

### 步骤 2: 切换主题

点击主题切换按钮，选择您喜欢的模式：

- ☀️ **浅色模式** - 明亮清新的视觉效果
- 🌙 **深色模式** - 护眼舒适的深色主题
- 💻 **跟随系统** - 自动匹配您的系统主题

### 步骤 3: 查看效果

切换主题后，整个应用会立即响应，所有组件的颜色都会自动调整！

---

## 🎨 使用新的样式组件

### 卡片组件

```vue
<template>
  <div class="iot-card">
    <div class="iot-card__header">
      <h3 class="iot-card__title">卡片标题</h3>
      <p class="iot-card__subtitle">副标题</p>
    </div>
    <div class="iot-card__body">
      卡片内容
    </div>
    <div class="iot-card__footer">
      <el-button>操作</el-button>
    </div>
  </div>
</template>
```

### 按钮组件

```vue
<template>
  <div>
    <button class="iot-btn iot-btn--primary">主要按钮</button>
    <button class="iot-btn iot-btn--secondary">次要按钮</button>
    <button class="iot-btn iot-btn--success">成功按钮</button>
    <button class="iot-btn iot-btn--danger">危险按钮</button>
    <button class="iot-btn iot-btn--warning">警告按钮</button>
  </div>
</template>
```

### 状态指示器

```vue
<template>
  <div class="iot-status">
    <span class="iot-status__dot iot-status__dot--online"></span>
    <span class="iot-status__label">在线</span>
  </div>
  
  <!-- 状态徽章 -->
  <span class="iot-status-badge iot-status-badge--online">在线</span>
  <span class="iot-status-badge iot-status-badge--offline">离线</span>
  <span class="iot-status-badge iot-status-badge--warning">警告</span>
</template>
```

---

## 🎯 常用 CSS 变量

### 颜色

```css
/* 主色 */
var(--color-primary-500)     /* 科技蓝 */

/* 背景 */
var(--color-bg-primary)      /* 主背景 */
var(--color-bg-secondary)    /* 次级背景 */

/* 文字 */
var(--color-text-primary)    /* 主文字 */
var(--color-text-secondary)  /* 次级文字 */

/* 功能色 */
var(--color-success)         /* 成功/在线 */
var(--color-danger)          /* 危险/离线 */
var(--color-warning)         /* 警告 */
var(--color-info)            /* 信息 */
```

### 间距

```css
var(--spacing-1)  /* 4px */
var(--spacing-2)  /* 8px */
var(--spacing-3)  /* 12px */
var(--spacing-4)  /* 16px */
var(--spacing-6)  /* 24px */
var(--spacing-8)  /* 32px */
```

### 圆角

```css
var(--radius-sm)    /* 4px */
var(--radius-md)    /* 8px */
var(--radius-lg)    /* 12px */
var(--radius-xl)    /* 16px */
var(--radius-full)  /* 圆形 */
```

---

## 📱 响应式设计

使用断点变量：

```css
/* 平板及以上 */
@media (min-width: 768px) {
  .my-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面及以上 */
@media (min-width: 1024px) {
  .my-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## ♿ 可访问性

### 焦点样式

所有可交互元素都有清晰的焦点样式，使用键盘 Tab 键即可看到。

### 减少动画

如果系统设置了"减少动画"，应用会自动减少不必要的动画效果。

### 高对比度

支持系统级高对比度模式，确保所有用户都能清晰查看内容。

---

## 🛠️ 自定义主题

### 修改主色调

编辑 `src/styles/variables.css`：

```css
:root {
  /* 浅色模式主色 */
  --color-primary-500: #1687FF;  /* 修改这里 */
}

[data-theme='dark'] {
  /* 深色模式主色 */
  --color-primary-500: #234DDD;  /* 修改这里 */
}
```

### 添加新颜色

```css
:root {
  --color-custom: #XXXXXX;
}

[data-theme='dark'] {
  --color-custom: #XXXXXX;
}
```

---

## 📚 完整文档

- **UI 设计规范**: `docs/UI_DESIGN_SPEC.md`
- **实现总结**: `docs/THEME_IMPLEMENTATION.md`

---

## ❓ 常见问题

### Q: 主题切换后为什么有些元素没有变化？

A: 确保使用了 CSS 变量而不是硬编码颜色值。

### Q: 如何禁用主题切换？

A: 可以在 App.vue 中移除 ThemeToggle 组件。

### Q: 主题偏好存储在哪里？

A: 存储在 localStorage 中，键名为 'theme'。

### Q: 如何让新页面支持主题切换？

A: 使用 CSS 变量定义颜色，主题会自动应用。

---

## 🎉 开始使用

现在您已经了解了基础知识，开始使用新的主题系统吧！

1. 刷新页面查看当前效果
2. 点击主题切换按钮尝试不同主题
3. 在新的页面中使用新的样式组件
4. 参考完整文档了解更多细节

祝您使用愉快！
