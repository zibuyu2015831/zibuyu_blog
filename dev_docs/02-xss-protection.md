# 02. XSS防护 - 跨站脚本攻击修复

**问题严重程度**: 🟠 中-高（AI 回复渲染处优先级最高，详见复审结论）  
**修复优先级**: 第一优先级（可独立完成）  
**依赖后端**: 否（前端可独立引入 DOMPurify）

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟢 **成立（严重度按场景下调）**
>
> - **属实**：全仓库 `v-html` 恰好 3 处，行号经 `grep` + 逐文件核对：`src/views/Article.vue:222`、`src/components/AiEnglishSpokenCoach.vue:387`、`src/components/AiEnglishCommonAssistant.vue:830`。
> - **背景**：`Article.vue` 中 `article`（第 47 行 `ref("")`）由 `marked.parse(markdownTEXT)`（第 132 行，`markdownTEXT` 来自 `getArticle(132156)`）生成；两处 AI 组件渲染 `item.content`，即大模型流式输出。`marked`（v13）默认**不做** HTML 净化。
> - **依赖现状**：`package.json` 依赖里**没有** `dompurify`，需新增安装。
> - **结论**：DOMPurify 净化建议**合理**；个人博客（作者自写文章 + 固定文章 ID）场景下文章渲染严重度可由「极高」下调为「中」，而两处 **AI 回复渲染模型输出，是真正的 XSS 高危点**，应优先处理。


## 问题概述

项目中多处使用 `v-html` 渲染用户生成的内容，存在被XSS（跨站脚本攻击）漏洞的风险。攻击者可以通过注入恶意脚本代码窃取用户信息或执行恶意操作。

---

## 涉及文件路径

```
src/views/Article.vue:222                     # v-html="article"（marked.parse 输出）
src/components/AiEnglishSpokenCoach.vue:387    # v-html="item.content"（AI 回复，高危）
src/components/AiEnglishCommonAssistant.vue:830 # v-html="item.content"（AI 回复，高危）
```

> 以上为全仓库**仅有的** 3 处 `v-html`（`grep -rn "v-html" src/` 已确认）。`package.json` 当前依赖：`axios`、`element-plus`、`marked`、`marked-highlight`、`highlight.js`、`pinia`、`vue`、`vue-router` 等，**未含 `dompurify`**。

---

## 具体问题位置

### 1. Article.vue:222 - 文章内容渲染

```vue
<div v-html="article" class="markdown-body article_body" :class="webTheme"></div>
```

`article` 的赋值链（同文件）：`const article = ref("")`（第 47 行）→ `article.value = marked.parse(markdownTEXT)`（第 132 行），其中 `markdownTEXT = await getArticle(132156)`（第 131 行，来自 `@/api/getArticle`）。`marked` 实例（第 49 行 `new Marked()`）启用了 `markedHighlight` 代码高亮，但**未配置任何 HTML 净化**，原始 Markdown 中的内联 `<script>`/`onerror` 等会被原样输出。

### 2. AiEnglishSpokenCoach.vue:387 - AI回复内容渲染

```vue
v-html="item.content"
```

### 3. AiEnglishCommonAssistant.vue:830 - AI回复内容渲染

```vue
v-html="item.content"
```

---

## 风险评估

- **风险等级**: 中-高（按场景分级）
  - **Article.vue:222（中）**：文章来源是作者自写、固定文章 ID（`getArticle(132156)`），攻击面取决于后端文章内容是否可被他人写入；纯个人博客场景下风险较低。
  - **两处 AI 组件（高）**：`item.content` 是大模型流式输出，内容不可控，若模型回复或被注入的提示词产生 `<img onerror=...>`、`<script>` 等，会直接在 `v-html` 中执行——这是真正应优先修复的 XSS 点。
- **潜在影响**:
  - 由于本项目鉴权 token 存于 `localStorage`（`localStorage.setItem('token', ...)`，见 DialogLogin.vue:155），注入脚本可读取并外传 token，造成会话劫持。
  - 恶意操作执行、页面钓鱼/木马植入。

---

## 修复方案

### 步骤 1: 安装DOMPurify

```bash
npm install dompurify
```

### 步骤 2: 创建HTML净化工具

创建文件: `src/utils/sanitize.js`

```javascript
import DOMPurify from 'dompurify'

export function sanitizeHtml(html, options = {}) {
  const defaultOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span',
      'a', 'img', 'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'class', 'id', 'style',
      'title', 'target', 'rel', 'width', 'height'
    ],
    REMOVE_COMMENTS: true,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
  }

  const mergedOptions = { ...defaultOptions, ...options }
  return DOMPurify.sanitize(html, mergedOptions)
}

export function sanitizeArticleContent(content) {
  if (!content) return ''
  
  return sanitizeHtml(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span',
      'a', 'img', 'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'div', 'span', 'hr',
      'figure', 'figcaption', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'class', 'id', 'style',
      'title', 'target', 'rel', 'width', 'height',
      'data-*'
    ]
  })
}

export function sanitizeAIResponse(content) {
  if (!content) return ''
  
  return sanitizeHtml(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span',
      'code', 'pre', 'blockquote',
      'ul', 'ol', 'li'
    ],
    ALLOWED_ATTR: ['class', 'id', 'style']
  })
}
```

### 步骤 3: 更新Article.vue

```vue
<script setup>
import { computed } from 'vue'
import { sanitizeArticleContent } from '@/utils/sanitize'

const sanitizedArticle = computed(() => {
  return sanitizeArticleContent(article.value)
})
</script>

<template>
  <div 
    v-html="sanitizedArticle" 
    class="markdown-body article_body" 
    :class="webTheme"
  ></div>
</template>
```

### 步骤 4: 更新AiEnglishSpokenCoach.vue（已是 `<script setup>`）

第 387 行当前为 `v-html="item.content"`，在 `<script setup>` 中新增净化函数并改用它：

```vue
<script setup>
import { sanitizeAIResponse } from '@/utils/sanitize'

const formatContent = (content) => sanitizeAIResponse(content)
</script>

<template>
  <!-- 第 387 行 -->
  <div
    v-html="formatContent(item.content)"
    :class="{ hidden_text: item.role === 'assistant' && item.isHidden }"
    @click="showText($event, index)"
  ></div>
</template>
```

### 步骤 5: 更新AiEnglishCommonAssistant.vue（已是 `<script setup>`）

第 830 行结构与上面完全一致（同样的 `v-html="item.content"` + `hidden_text` class + `@click="showText"`），改法相同：

```vue
<script setup>
import { sanitizeAIResponse } from '@/utils/sanitize'

const formatContent = (content) => sanitizeAIResponse(content)
</script>

<template>
  <!-- 第 830 行 -->
  <div
    v-html="formatContent(item.content)"
    :class="{ hidden_text: item.role === 'assistant' && item.isHidden }"
    @click="showText($event, index)"
  ></div>
</template>
```

> 注意：`sanitizeAIResponse` 的 `ALLOWED_TAGS` 需保留 `marked` 输出的代码块标签（`pre`、`code`）与 `markedHighlight` 注入的高亮 `span`/`class`，否则会破坏 AI 回复中代码块的样式。上面 `src/utils/sanitize.js` 的 `sanitizeAIResponse` 已包含 `code`/`pre` 及 `class` 属性。

---

## 重要补充说明

### 1. URL安全验证

```javascript
export function sanitizeUrl(url) {
  const allowedProtocols = ['http:', 'https:', 'mailto:']
  const urlObj = new URL(url, window.location.origin)
  
  if (!allowedProtocols.includes(urlObj.protocol)) {
    return null
  }
  
  return urlObj.href
}
```

### 2. 内容安全策略（CSP）

在index.html中添加：

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.your-domain.com;">
```

### 3. HTML实体编码

对于纯文本输出，使用HTML实体编码：

```javascript
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有v-html使用
- [ ] 确认已添加净化逻辑
- [ ] 验证ALLOWED_TAGS配置合理

### 2. 安全测试

- [ ] 测试XSS payloads防护
- [ ] 验证恶意脚本被清除
- [ ] 检查URL验证逻辑

### 3. 功能测试

- [ ] 确认正常HTML渲染正常
- [ ] 测试Markdown渲染
- [ ] 验证AI回复显示正确

---

## 预期收益

- ✅ 消除XSS攻击风险
- ✅ 保护用户数据安全
- ✅ 提升应用安全性

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引

---

**文档版本**: 1.1（代码级复审）  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27
