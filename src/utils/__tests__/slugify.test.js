import { describe, it, expect } from 'vitest'
import { slugify, makeSlugger } from '@/utils/slugify'

describe('slugify', () => {
  it('小写化并把空白转连字符', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('  Trim   Me  ')).toBe('trim-me')
  })

  it('保留中文（CJK）', () => {
    expect(slugify('安装与使用')).toBe('安装与使用')
    expect(slugify('01 Linux安装')).toBe('01-linux安装')
  })

  it('去除标点与内联 HTML 标签', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
    expect(slugify('<code>conda</code> 命令')).toBe('conda-命令')
  })

  it('折叠连续连字符并去首尾连字符', () => {
    expect(slugify('a --- b')).toBe('a-b')
    expect(slugify('-- 标题 --')).toBe('标题')
  })

  it('空或纯符号回退为 section', () => {
    expect(slugify('')).toBe('section')
    expect(slugify('***')).toBe('section')
  })
})

describe('makeSlugger 去重', () => {
  it('重复 slug 追加递增后缀', () => {
    const slug = makeSlugger()
    expect(slug('提示框')).toBe('提示框')
    expect(slug('提示框')).toBe('提示框-1')
    expect(slug('提示框')).toBe('提示框-2')
  })

  it('不同标题各自独立计数', () => {
    const slug = makeSlugger()
    expect(slug('intro')).toBe('intro')
    expect(slug('usage')).toBe('usage')
    expect(slug('intro')).toBe('intro-1')
  })

  it('新建实例从头计数（不跨文章累计）', () => {
    const a = makeSlugger()
    const b = makeSlugger()
    expect(a('x')).toBe('x')
    expect(b('x')).toBe('x')
  })
})
