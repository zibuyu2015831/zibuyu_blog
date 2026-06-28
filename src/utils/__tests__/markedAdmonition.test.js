import { describe, it, expect } from 'vitest'
import { Marked } from 'marked'
import { admonitionExtension } from '@/utils/markedAdmonition'

function make() {
  const m = new Marked()
  m.use({ extensions: [admonitionExtension] })
  return m
}

describe('admonitionExtension', () => {
  it('把 ::: tip 渲染为 .custom-block.tip 并带默认中文标题', () => {
    const html = make().parse('::: tip\n内容\n:::')
    expect(html).toContain('class="custom-block tip"')
    expect(html).toContain('class="custom-block-title"')
    expect(html).toContain('提示')
    expect(html).toContain('内容')
  })

  it('支持自定义标题', () => {
    const html = make().parse('::: warning 小心\n注意事项\n:::')
    expect(html).toContain('class="custom-block warning"')
    expect(html).toContain('小心')
  })

  it('details 渲染为可折叠 <details><summary>', () => {
    const html = make().parse('::: details 展开\n隐藏内容\n:::')
    expect(html).toContain('<details class="custom-block details">')
    expect(html).toContain('<summary>展开</summary>')
    expect(html).toContain('隐藏内容')
  })

  it('容器内支持嵌套 markdown（列表、强调）', () => {
    const html = make().parse('::: info\n- 一项\n- **加粗**\n:::')
    expect(html).toContain('<li>一项</li>')
    expect(html).toContain('<strong>加粗</strong>')
  })

  it('未知类型不接管，按普通文本/段落处理', () => {
    const html = make().parse('::: unknowntype\n文本\n:::')
    expect(html).not.toContain('custom-block')
  })

  it('容忍前导空格（CommonMark ≤3 空格缩进）', () => {
    const html = make().parse('  ::: tip\n  内容\n  :::')
    expect(html).toContain('class="custom-block tip"')
  })
})
