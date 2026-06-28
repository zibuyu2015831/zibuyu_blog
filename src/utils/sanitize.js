/**
 * HTML 净化工具（见 dev_docs/02-xss-protection.md）
 *
 * 项目用 marked 把 Markdown / 大模型流式输出转成 HTML，再经 v-html 渲染。
 * marked v13 默认不做 HTML 净化，因此 `<script>`、`onerror=` 等会被原样输出执行。
 * 真正高危的是两处 AI 回复渲染（模型输出不可控），文章渲染为作者自有内容，风险较低，
 * 这里统一用 DOMPurify 兜底，保留代码高亮所需的 pre/code/span/class。
 */

import DOMPurify from 'dompurify'

// 文章正文：允许较丰富的标签（表格、标题、图片等）
const ARTICLE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'hr', 'span', 'div', 'a', 'img',
    'strong', 'em', 'u', 'i', 'b', 'del', 's', 'mark', 'sub', 'sup',
    'code', 'pre', 'blockquote', 'kbd',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'figure', 'figcaption',
    'details', 'summary', // 提示框 ::: details 可折叠容器
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'style',
    'target', 'rel', 'width', 'height', 'colspan', 'rowspan',
    'open', // <details> 展开态
  ],
  // 禁止危险协议（javascript:）等由 DOMPurify 默认处理；这里额外强制移除事件属性
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'],
}

// AI 回复：相对收敛，但必须保留 marked + markedHighlight 产生的 pre/code/span/class
const AI_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'a',
    'strong', 'em', 'u', 'i', 'b', 'del', 's',
    'code', 'pre', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'style'],
}

/**
 * 净化文章正文 HTML。
 * @param {string} html
 * @returns {string}
 */
export function sanitizeArticleContent(html) {
  if (!html) return ''
  return DOMPurify.sanitize(html, ARTICLE_CONFIG)
}

/**
 * 净化 AI 回复 HTML（高危场景，模型输出不可控）。
 * @param {string} html
 * @returns {string}
 */
export function sanitizeAIResponse(html) {
  if (!html) return ''
  return DOMPurify.sanitize(html, AI_CONFIG)
}
