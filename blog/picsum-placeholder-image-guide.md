# Picsum：图片占位符的优雅解决方案

> 在开发 Web 应用或设计原型时，你是否经常需要找合适的测试图片？
> Picsum（Lorem Picsum）就是解决这个问题的完美工具！

---

## 前言

就像我们在写代码时需要 Lorem Ipsum 这样的文本占位符一样，在处理图片时，我们也需要快速、方便的占位符图片。以前可能需要到处找图片、截图、手动调整大小，现在有了 Picsum，这一切都变得简单了。

## 什么是 Picsum？

Picsum 是一个免费的图片占位符服务，被称为"图片界的 Lorem Ipsum"。它提供：

- 🎲 随机图片生成
- 📏 自定义尺寸
- 🎨 多种视觉效果（灰度、模糊）
- 📦 简单易用的 API
- 🆓 完全免费，无需注册

官网：https://picsum.photos

## 基础用法

### 最简单的示例

只需一个 URL，就能得到一张随机图片：

```html
<img src="https://picsum.photos/200/300" alt="随机图片">
```

这会生成一张 200x300 像素的随机图片。

### 固定尺寸

```html
<!-- 800x600 的图片 -->
<img src="https://picsum.photos/800/600">

<!-- 1920x1080 的图片 -->
<img src="https://picsum.photos/1920/1080">

<!-- 正方形 -->
<img src="https://picsum.photos/200">
```

### 使用固定 ID

如果需要每次都获取同一张图片（比如测试环境），可以使用 ID：

```html
<img src="https://picsum.photos/id/237/800/600">
```

## 高级功能

### 视觉效果

```html
<!-- 灰度效果 -->
<img src="https://picsum.photos/200/300?grayscale">

<!-- 模糊效果（1-10） -->
<img src="https://picsum.photos/200/300?blur=2">

<!-- 组合效果 -->
<img src="https://picsum.photos/200/300?grayscale&blur=2">
```

这些效果特别适合做背景图片或低优先级占位符。

### 防止缓存

在同一个页面显示多张不同图片时，使用 `random` 参数：

```html
<img src="https://picsum.photos/200/300?random=1">
<img src="https://picsum.photos/200/300?random=2">
<img src="https://picsum.photos/200/300?random=3">
```

### 指定格式

```html
<!-- WebP 格式（推荐，更小体积） -->
<img src="https://picsum.photos/200/300.webp">

<!-- JPG 格式 -->
<img src="https://picsum.photos/200/300.jpg">
```

## 实际应用场景

### 1. 原型设计

在快速原型阶段，用 Picsum 快速填充图片：

```html
<div class="card">
  <img src="https://picsum.photos/300/200" alt="封面">
  <h3>文章标题</h3>
  <p>文章摘要...</p>
</div>
```

### 2. 响应式图片

```html
<picture>
  <source media="(min-width: 800px)" srcset="https://picsum.photos/1920/1080.webp">
  <source media="(min-width: 400px)" srcset="https://picsum.photos/800/600.webp">
  <img src="https://picsum.photos/400/300.webp" alt="响应式图片">
</picture>
```

### 3. CSS 背景

```css
.hero {
  background-image: url('https://picsum.photos/1920/1080?grayscale&blur=3');
  background-size: cover;
  background-position: center;
}
```

### 4. Markdown 文档

```markdown
![文章配图](https://picsum.photos/800/600.webp)
```

### 5. 测试数据

在生成测试数据时，使用 Picsum：

```javascript
// 生成 10 个测试用户
const users = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  name: `用户${i}`,
  avatar: `https://picsum.photos/id/${i}/200/200`
}));
```

## API 接口

Picsum 还提供了 API 接口，可以获取图片列表：

```bash
curl https://picsum.photos/v2/list
```

返回 JSON 数据：

```json
[
  {
    "id": "0",
    "author": "Alejandro Escamilla",
    "width": 5616,
    "height": 3744,
    "url": "https://unsplash.com/...",
    "download_url": "https://picsum.photos/..."
  }
]
```

分页查询：

```bash
# 第 2 页，每页 100 条
curl https://picsum.photos/v2/list?page=2&limit=100
```

## 常用尺寸速查

| 用途 | 推荐尺寸 |
|------|---------|
| 头像 | 128x128, 200x200 |
| 缩略图 | 200x200, 300x200 |
| 文章配图 | 800x600, 1024x768 |
| Banner | 1200x400, 1920x600 |
| 全屏背景 | 1920x1080, 2560x1440 |

## 实用技巧

### 技巧 1: 开发 vs 生产

**开发环境** - 使用固定 ID 确保一致性：

```html
<img src="https://picsum.photos/id/237/800/600">
```

**生产环境** - 使用随机参数增加多样性：

```html
<img src="https://picsum.photos/800/600?random=1">
```

### 技巧 2: 批量生成

```javascript
// 生成 5 张不同图片
const images = Array.from({ length: 5 }, (_, i) =>
  `https://picsum.photos/200/300?random=${i}`
);
```

### 技巧 3: 优雅降级

```html
<picture>
  <source srcset="https://picsum.photos/800/600.webp" type="image/webp">
  <img src="https://picsum.photos/800/600.jpg" alt="降级图片">
</picture>
```

## 与其他方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Picsum** | 免费、无需注册、图片质量高 | 来自 Unsplash，可能重复 |
| Placehold.co | 可自定义文字和颜色 | 图片质量一般 |
| via.placeholder.com | 功能丰富 | 速度较慢 |
| Unsplash API | 高质量、可筛选 | 需要 API Key，有限额 |

对于大多数场景，Picsum 已经足够好了！

## 注意事项

1. **合理使用尺寸**：虽然支持大尺寸，但建议不超过 5000x5000
2. **缓存问题**：使用 `random` 参数避免缓存
3. **图片格式**：优先使用 WebP 格式
4. **HTTPS 支持**：全站支持 HTTPS
5. **免费使用**：完全免费，但请合理使用

## 代码示例

### Vue.js 示例

```vue
<template>
  <div>
    <img :src="imageUrl" alt="随机图片">
    <button @click="refresh">刷新图片</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      random: 1
    }
  },
  computed: {
    imageUrl() {
      return `https://picsum.photos/800/600?random=${this.random}`
    }
  },
  methods: {
    refresh() {
      this.random++
    }
  }
}
</script>
```

### React 示例

```jsx
import React, { useState } from 'react';

function RandomImage() {
  const [random, setRandom] = useState(1);

  return (
    <div>
      <img
        src={`https://picsum.photos/800/600?random=${random}`}
        alt="随机图片"
      />
      <button onClick={() => setRandom(random + 1)}>刷新图片</button>
    </div>
  );
}
```

### Node.js 批量生成

```javascript
const fs = require('fs');

// 生成 10 张图片的 HTML
const html = Array.from({ length: 10 }, (_, i) =>
  `<img src="https://picsum.photos/200/300?random=${i}" alt="图片 ${i}">\n`
).join('');

fs.writeFileSync('images.html', html);
console.log('已生成 images.html');
```

## 总结

Picsum 是一个问题的优雅解决方案。它的设计哲学是简单、快速、实用。无论是快速原型、测试数据，还是生产环境的占位符，Picsum 都能很好地胜任。

**核心优势**：
- ✅ 一行代码解决图片占位问题
- ✅ 无需注册，无需 API Key
- ✅ 支持丰富的自定义选项
- ✅ 图片质量高
- ✅ 免费且易用

下次需要图片占位符时，试试 Picsum 吧！

## 参考资源

- [Picsum 官网](https://picsum.photos)
- [Unsplash（图片来源）](https://unsplash.com)
- [WebP 格式介绍](https://developers.google.com/speed/webp)

---

**发布日期**: 2026-03-09
**作者**: 獭獭 🦦
**标签**: #Picsum #工具 #开发效率 #Web开发
