# 物联网平台 UI 设计规范

## 概述

本规范定义了物联网平台的视觉设计系统，包含深色和浅色两套主题方案，确保产品体验的一致性和专业性。

---

## 1. 色彩系统

### 1.1 主色调 - 科技蓝

**浅色模式**
| 色值 | Hex | 用途 |
|------|-----|------|
| Primary-50 | #E3F2FF | 最浅背景 |
| Primary-100 | #BAE0FF | 悬停背景 |
| Primary-200 | #91CAFF | 边框 |
| Primary-300 | #68B3FF | 次要元素 |
| Primary-400 | #3F9DFF | 次要按钮 |
| **Primary-500** | **#1687FF** | **主色 - 主要按钮/链接** |
| Primary-600 | #1274E6 | 悬停状态 |
| Primary-700 | #0F61CC | 激活状态 |
| Primary-800 | #0C4EB3 | 强调 |
| Primary-900 | #093B99 | 文字 |

**深色模式**
| 色值 | Hex | 用途 |
|------|-----|------|
| Primary-50 | #0A1633 | 最深背景 |
| Primary-100 | #0F2155 | 卡片背景 |
| Primary-200 | #142C77 | 边框 |
| Primary-300 | #193799 | 次要元素 |
| Primary-400 | #1E42BB | 次要按钮 |
| **Primary-500** | **#234DDD** | **主色 - 主要按钮/链接** |
| Primary-600 | #3A61FF | 悬停状态 |
| Primary-700 | #5275FF | 激活状态 |
| Primary-800 | #6989FF | 强调 |
| Primary-900 | #809DFF | 文字 |

### 1.2 功能指示色

#### 设备状态
| 状态 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| 成功/在线 | #28A745 | #3DDC84 | 设备在线、操作成功 |
| 危险/离线 | #DC3545 | #FF5252 | 设备离线、操作失败 |
| 警告/待机 | #FFC107 | #FFD54F | 设备待机、警告提示 |
| 信息/未知 | #17A2B8 | #4DD0E1 | 设备未知状态 |

#### 告警级别
| 级别 | 色值 | 背景色 | 边框色 | 用途 |
|------|------|--------|--------|------|
| 紧急 (Critical) | #FF0000 | rgba(255,0,0,0.15) | #CC0000 | 紧急告警 |
| 重要 (Major) | #FF6600 | rgba(255,102,0,0.15) | #CC5200 | 重要告警 |
| 次要 (Minor) | #FFCC00 | rgba(255,204,0,0.15) | #CCA300 | 次要告警 |
| 提示 (Warning) | #0066CC | rgba(0,102,204,0.15) | #0052A3 | 提示告警 |

### 1.3 中性色

**浅色模式**
```css
--color-bg-primary: #FFFFFF      /* 主背景 */
--color-bg-secondary: #F8F9FA    /* 次级背景 */
--color-bg-tertiary: #E9ECEF     /* 第三级背景 */
--color-bg-hover: #F1F3F4        /* 悬停背景 */
--color-bg-active: #E2E6EA       /* 激活背景 */

--color-border-light: #DEE2E6    /* 浅边框 */
--color-border: #CED4DA          /* 普通边框 */
--color-border-dark: #ADB5BD     /* 深边框 */

--color-text-primary: #212529    /* 主文字 */
--color-text-secondary: #6C757D  /* 次级文字 */
--color-text-tertiary: #ADB5BD   /* 第三级文字 */
--color-text-disabled: #CED4DA   /* 禁用文字 */
```

**深色模式**
```css
--color-bg-primary: #0A0E1A      /* 主背景 */
--color-bg-secondary: #151A2A    /* 次级背景 */
--color-bg-tertiary: #1F2638     /* 第三级背景 */
--color-bg-hover: #252D42        /* 悬停背景 */
--color-bg-active: #2F3852       /* 激活背景 */

--color-border-light: #2F3852    /* 浅边框 */
--color-border: #3D4661          /* 普通边框 */
--color-border-dark: #4A5473     /* 深边框 */

--color-text-primary: #F8F9FA    /* 主文字 */
--color-text-secondary: #B0B3C7  /* 次级文字 */
--color-text-tertiary: #6C7089   /* 第三级文字 */
--color-text-disabled: #4A506B   /* 禁用文字 */
```

---

## 2. 字体系统

### 2.1 字体系列
```css
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                    'Helvetica', 'Arial', sans-serif
--font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace
```

### 2.2 字体大小
| 名称 | 大小 | 用途 |
|------|------|------|
| xs | 11px | 辅助文字 |
| sm | 13px | 次要文字 |
| md | 14px | 常规文字 |
| base | 16px | 基础文字 |
| lg | 18px | 小标题 |
| xl | 20px | 标题 |
| 2xl | 24px | 大标题 |
| 3xl | 30px | 超大标题 |
| 4xl | 36px | 特大标题 |

### 2.3 字重
| 名称 | 值 | 用途 |
|------|-----|------|
| normal | 400 | 常规文字 |
| medium | 500 | 中等字重 |
| semibold | 600 | 半粗体 |
| bold | 700 | 粗体 |

### 2.4 行高
| 名称 | 值 | 用途 |
|------|-----|------|
| none | 1 | 无行高 |
| tight | 1.25 | 紧凑 |
| normal | 1.5 | 常规 |
| relaxed | 1.625 | 宽松 |
| loose | 2 | 最宽松 |

---

## 3. 间距系统

基于 4px 网格系统：

```css
--spacing-0: 0
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
```

---

## 4. 圆角系统

| 名称 | 大小 | 用途 |
|------|------|------|
| sm | 4px | 小按钮、标签 |
| md | 8px | 按钮、输入框 |
| lg | 12px | 卡片 |
| xl | 16px | 大卡片 |
| full | 9999px | 圆形、徽章 |

---

## 5. 阴影系统

**浅色模式**
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)
```

**深色模式**
深色模式阴影强度增加，以在深色背景上提供足够的层次感。

---

## 6. 组件样式规范

### 6.1 按钮

**主要按钮**
- 背景色：`var(--color-primary-500)`
- 文字色：`var(--color-text-inverse)`
- 悬停：`var(--color-primary-600)`
- 激活：`var(--color-primary-700)`

**次要按钮**
- 背景色：`var(--color-bg-secondary)`
- 文字色：`var(--color-text-primary)`
- 边框：`var(--color-border)`

**尺寸**
- Small: padding 8px 16px, font-size 11px
- Default: padding 12px 24px, font-size 13px
- Large: padding 16px 32px, font-size 16px

### 6.2 卡片

**标准卡片**
- 背景：`var(--color-bg-primary)`
- 边框：`var(--color-border)`
- 圆角：`var(--radius-lg)`
- 阴影：`var(--shadow-sm)`
- 内边距：`var(--spacing-6)`

**设备卡片**
- 顶部状态条：3px 高度
- 在线：绿色 `var(--color-success)`
- 离线：红色 `var(--color-danger)`
- 警告：黄色 `var(--color-warning)`

### 6.3 状态指示器

**状态点**
- 尺寸：8px × 8px
- 在线：绿色 + 脉动动画
- 离线：红色 + 无动画
- 警告：黄色 + 快速脉动

**状态徽章**
- 内边距：4px 12px
- 圆角：`var(--radius-full)`
- 背景：功能色背景 (透明度 10%)

### 6.4 输入框

**标准输入框**
- 高度：36px
- 背景：`var(--color-bg-primary)`
- 边框：`var(--color-border)`
- 圆角：`var(--radius-md)`
- 聚焦：`var(--color-primary-400)` + 外发光

### 6.5 表格

**表头**
- 背景：`var(--color-bg-secondary)`
- 文字：`var(--color-text-primary)`
- 字重：`var(--font-weight-semibold)`

**表格行**
- 悬停背景：`var(--color-bg-hover)`
- 边框：`var(--color-border)`
- 内边距：16px 20px

---

## 7. 主题切换

### 7.1 切换控件

位置：顶部导航栏右侧，用户信息左侧

功能：
- 浅色模式
- 深色模式
- 跟随系统

### 7.2 实现方式

使用 CSS 变量和 `data-theme` 属性：

```html
<html data-theme="light">  <!-- 或 "dark" -->
```

### 7.3 本地存储

用户偏好存储在 `localStorage`：
```javascript
localStorage.setItem('theme', 'dark')
```

---

## 8. 响应式设计

### 8.1 断点

```css
--breakpoint-sm: 640px    /* 手机横屏 */
--breakpoint-md: 768px    /* 平板 */
--breakpoint-lg: 1024px   /* 小屏电脑 */
--breakpoint-xl: 1280px   /* 桌面 */
--breakpoint-2xl: 1536px  /* 大屏 */
```

### 8.2 移动端适配

- 导航栏高度：64px → 56px
- 内边距：24px → 16px
- 字体大小：按比例缩小
- 操作栏：垂直布局

---

## 9. 可访问性

### 9.1 焦点管理

所有可交互元素必须有清晰的焦点样式：
```css
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### 9.2 减少动画

支持系统级减少动画偏好：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.3 高对比度

支持系统级高对比度模式：
```css
@media (prefers-contrast: high) {
  :root {
    --color-border: var(--color-text-primary);
    --shadow-sm: none;
  }
}
```

---

## 10. 使用示例

### 10.1 HTML 结构

```html
<!-- 设备状态卡片 -->
<div class="iot-card iot-device-card" data-status="online">
  <div class="iot-card__header">
    <div>
      <h3 class="iot-card__title">温度传感器 A-001</h3>
      <p class="iot-card__subtitle">生产车间 - 区域 A</p>
    </div>
    <div class="iot-status">
      <span class="iot-status__dot iot-status__dot--online"></span>
      <span class="iot-status__label">运行中</span>
    </div>
  </div>
  <div class="iot-card__body">
    <div class="iot-device-card__stats">
      <div class="iot-device-card__stat">
        <span class="iot-device-card__stat-label">当前温度</span>
        <span class="iot-device-card__stat-value">24.5°C</span>
      </div>
      <div class="iot-device-card__stat">
        <span class="iot-device-card__stat-label">湿度</span>
        <span class="iot-device-card__stat-value">65%</span>
      </div>
    </div>
  </div>
  <div class="iot-card__footer">
    <button class="iot-btn iot-btn--secondary iot-btn--small">查看详情</button>
    <button class="iot-btn iot-btn--primary iot-btn--small">控制设备</button>
  </div>
</div>
```

### 10.2 CSS 使用

```css
/* 使用 CSS 变量 */
.custom-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

/* 响应式 */
@media (min-width: 768px) {
  .custom-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-6);
  }
}
```

---

## 11. 文件结构

```
src/styles/
├── variables.css          # CSS 变量定义
├── main.css               # 主样式文件
└── components/
    ├── button.css         # 按钮组件
    ├── card.css          # 卡片组件
    ├── input.css         # 输入组件
    ├── table.css         # 表格组件
    ├── alert.css         # 告警组件
    ├── navigation.css    # 导航组件
    ├── status.css        # 状态指示器
    └── dashboard.css     # 仪表板组件
```

---

## 12. 最佳实践

### 12.1 使用 CSS 变量

✅ 推荐：
```css
color: var(--color-text-primary);
background: var(--color-bg-primary);
```

❌ 不推荐：
```css
color: #212529;
background: #FFFFFF;
```

### 12.2 使用间距系统

✅ 推荐：
```css
padding: var(--spacing-4);
margin: var(--spacing-6);
```

❌ 不推荐：
```css
padding: 16px;
margin: 24px;
```

### 12.3 语义化类名

✅ 推荐：
```html
<button class="iot-btn iot-btn--primary">提交</button>
```

❌ 不推荐：
```html
<button class="blue-button">提交</button>
```

---

## 13. 更新日志

### v1.0.0 - 2025-01-01
- ✨ 初始版本发布
- ✨ 完整的浅色和深色主题支持
- ✨ 主题切换功能
- ✨ 响应式设计
- ♿ 可访问性支持

---

**最后更新**: 2025-01-01
**维护者**: 物联网平台设计团队
