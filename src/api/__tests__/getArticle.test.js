import { describe, it, expect } from 'vitest'
import { getArticleHeads } from '@/api/getArticle'

// 锁定目录解析行为（重构 no-cond-assign 后应保持一致）
describe('getArticleHeads', () => {
  it('builds a nested h1 > h2 > h3 hierarchy', () => {
    const md = ['# A', '## B', '### C', '## D', '# E'].join('\n')
    const toc = getArticleHeads(md)
    expect(toc).toHaveLength(2)
    expect(toc[0]).toMatchObject({ title: 'A', level: 1 })
    expect(toc[0].children).toHaveLength(2)
    expect(toc[0].children[0]).toMatchObject({ title: 'B', level: 2 })
    expect(toc[0].children[0].children[0]).toMatchObject({ title: 'C', level: 3 })
    expect(toc[1]).toMatchObject({ title: 'E', level: 1 })
  })

  it('ignores h2/h3 with no preceding parent', () => {
    const toc = getArticleHeads(['## orphan', '### orphan3', '# real'].join('\n'))
    expect(toc).toHaveLength(1)
    expect(toc[0].title).toBe('real')
  })

  it('returns empty array for content without headings', () => {
    expect(getArticleHeads('just text\nmore text')).toEqual([])
  })
})
