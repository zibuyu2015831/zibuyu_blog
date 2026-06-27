import { describe, it, expect } from 'vitest'

// 冒烟测试：确认 Vitest 测试体系本身可用（jsdom 环境 + 断言）。
describe('test harness smoke test', () => {
  it('runs assertions', () => {
    expect(1 + 1).toBe(2)
  })

  it('has a jsdom document', () => {
    expect(typeof document).toBe('object')
    expect(typeof window).toBe('object')
  })
})
