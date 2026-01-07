# 02. XSS防护 - 跨站脚本攻击修复

**问题严重程度**: 🔴 严重  
**修复优先级**: 第一优先级（可独立完成）  
**依赖后端**: 否

---

## 问题概述

项目中多处使用 `v-html` 渲染用户生成的内容，存在被XSS（跨站脚本攻击）漏洞的风险。攻击者可以通过注入恶意脚本代码窃取用户信息或执行恶意操作。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\views\Article.vue
d:\06_program_code\zibuyu_blog\src\components\AiEnglishSpokenCoach.vue
d:\06_program_code\zibuyu_blog\src\components\AiEnglishCommonAssistant.vue
```

---

## 具体问题位置

### 1. Article.vue:222 - 文章内容渲染

```vue
<div v-html="article" class="markdown-body article_body" :class="webTheme"></div>
```

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

- **风险等级**: 极高
- **潜在影响**:
  - 用户敏感信息被盗（如Cookie、Token）
  - 会话劫持
  - 恶意操作执行
  - 木马植入

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

### 步骤 4: 更新AiEnglishSpokenCoach.vue

```vue
<script setup>
import { sanitizeAIResponse } from '@/utils/sanitize'

const formatContent = (content) => {
  return sanitizeAIResponse(content)
}
</script>

<template>
  <div v-html="formatContent(item.content)"></div>
</template>
```

### 步骤 5: 更新AiEnglishCommonAssistant.vue

```vue
<script setup>
import { sanitizeAIResponse } from '@/utils/sanitize'

const formatContent = (content) => {
  return sanitizeAIResponse(content)
}
</script>

<template>
  <div v-html="formatContent(item.content)"></div>
</template>
```

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
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
