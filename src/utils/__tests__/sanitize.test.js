import { describe, it, expect } from 'vitest'
import { sanitizeArticleContent, sanitizeAIResponse } from '@/utils/sanitize'

describe('sanitizeArticleContent', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeArticleContent('')).toBe('')
    expect(sanitizeArticleContent(null)).toBe('')
    expect(sanitizeArticleContent(undefined)).toBe('')
  })

  it('strips <script> tags', () => {
    const out = sanitizeArticleContent('<p>hi</p><script>alert(1)</script>')
    expect(out).toContain('<p>hi</p>')
    expect(out.toLowerCase()).not.toContain('<script')
  })

  it('removes onerror / event handlers from img', () => {
    const out = sanitizeArticleContent('<img src="x" onerror="alert(1)">')
    expect(out).not.toContain('onerror')
  })

  it('keeps code highlighting markup (pre/code/span + class)', () => {
    const html = '<pre><code class="hljs language-js"><span class="hljs-keyword">const</span></code></pre>'
    const out = sanitizeArticleContent(html)
    expect(out).toContain('<pre>')
    expect(out).toContain('<code')
    expect(out).toContain('class="hljs language-js"')
    expect(out).toContain('hljs-keyword')
  })

  it('keeps tables and links', () => {
    const out = sanitizeArticleContent('<table><tr><td>a</td></tr></table><a href="https://x.com">l</a>')
    expect(out).toContain('<table>')
    expect(out).toContain('href="https://x.com"')
  })
})

describe('sanitizeAIResponse', () => {
  it('strips scripts but keeps code blocks for AI replies', () => {
    const html = '<p>answer</p><pre><code class="hljs">x=1</code></pre><script>steal()</script>'
    const out = sanitizeAIResponse(html)
    expect(out).toContain('<pre>')
    expect(out).toContain('class="hljs"')
    expect(out.toLowerCase()).not.toContain('<script')
  })

  it('neutralizes javascript: URLs', () => {
    const out = sanitizeAIResponse('<a href="javascript:alert(1)">click</a>')
    expect(out).not.toContain('javascript:alert')
  })

  it('drops inline style and event handlers', () => {
    const out = sanitizeAIResponse('<p style="x" onmouseover="hack()">t</p>')
    expect(out).not.toContain('onmouseover')
    expect(out).not.toContain('style=')
  })
})
