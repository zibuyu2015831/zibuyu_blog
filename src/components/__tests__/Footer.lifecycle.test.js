import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '@/components/Footer.vue'

// 验证 #05 内存泄漏修复：Footer 的运行时长 setInterval 在卸载时被 clearInterval 清理。
describe('Footer.vue timer cleanup (#05)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const mountFooter = () =>
    mount(Footer, {
      global: {
        stubs: { 'el-row': true, 'el-col': true, 'el-backtop': true },
      },
    })

  it('starts the runtime timer on mount', () => {
    const setSpy = vi.spyOn(global, 'setInterval')
    const wrapper = mountFooter()
    // onMounted 内启动 1s 定时器
    expect(setSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    wrapper.unmount()
  })

  it('clears the interval on unmount (no leak)', () => {
    const clearSpy = vi.spyOn(global, 'clearInterval')
    const wrapper = mountFooter()
    expect(clearSpy).not.toHaveBeenCalled()
    wrapper.unmount()
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})
