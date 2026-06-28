import { describe, it, expect } from 'vitest'
import { Marked } from 'marked'
import { mermaidExtension } from '@/utils/mermaid'

function make() {
  const m = new Marked()
  m.use({ extensions: [mermaidExtension] })
  return m
}

describe('mermaidExtension（marked 占位阶段）', () => {
  it('把 ```mermaid 块转为 pre.mermaid-src 纯文本占位', () => {
    const html = make().parse('```mermaid\nflowchart TD\nA-->B\n```')
    expect(html).toContain('class="mermaid-src"')
    expect(html).toContain('flowchart TD')
    expect(html).toContain('A--&gt;B') // 源码经 HTML 转义
  })

  it('不影响普通代码块', () => {
    const html = make().parse('```js\nconst a = 1\n```')
    expect(html).not.toContain('mermaid-src')
  })

  it('容忍前导空格', () => {
    const html = make().parse('  ```mermaid\n  graph LR\n  ```')
    expect(html).toContain('class="mermaid-src"')
  })
})
