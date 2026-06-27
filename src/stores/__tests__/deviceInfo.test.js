import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import useDeviceInfo from '@/stores/deviceInfo'

// 锁定 deviceInfo 各宽度阈值 getter 的行为（#13 断点常量化前后行为应完全一致）。
describe('deviceInfo breakpoint getters (#13)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const atWidth = (w) => {
    const store = useDeviceInfo()
    store.userScreenWidth = w
    return store
  }

  it('dialogWidth: <500 占满，否则 500', () => {
    expect(atWidth(400).dialogWidth).toBe(400)
    expect(atWidth(500).dialogWidth).toBe(500)
    expect(atWidth(800).dialogWidth).toBe(500)
  })

  it('isEnglishButtonSmall: <=500', () => {
    expect(atWidth(500).isEnglishButtonSmall).toBe(true)
    expect(atWidth(501).isEnglishButtonSmall).toBe(false)
  })

  it('isPaginationmall: <500', () => {
    expect(atWidth(499).isPaginationmall).toBe(true)
    expect(atWidth(500).isPaginationmall).toBe(false)
  })

  it('isShowRightBox: >1050', () => {
    expect(atWidth(1051).isShowRightBox).toBe(true)
    expect(atWidth(1050).isShowRightBox).toBe(false)
  })

  it('isShowArticleImageInSmallScreen: >1300', () => {
    expect(atWidth(1301).isShowArticleImageInSmallScreen).toBe(true)
    expect(atWidth(1300).isShowArticleImageInSmallScreen).toBe(false)
  })

  it('isArticleShowRightBox: >1400', () => {
    expect(atWidth(1401).isArticleShowRightBox).toBe(true)
    expect(atWidth(1400).isArticleShowRightBox).toBe(false)
  })

  it('isBigScreen: >1650', () => {
    expect(atWidth(1651).isBigScreen).toBe(true)
    expect(atWidth(1650).isBigScreen).toBe(false)
  })

  it('isShowFooterComponent / isShowHeaderNavigate / isShowBottomMenu switch at 880', () => {
    const small = atWidth(800)
    small.currentPath = '/home'
    expect(small.isShowHeaderNavigate).toBe(false)
    expect(small.isShowBottomMenu).toBe(true)
    expect(small.isShowFooterComponent).toBe(false)

    const big = atWidth(1000)
    big.currentPath = '/home'
    expect(big.isShowHeaderNavigate).toBe(true)
    expect(big.isShowBottomMenu).toBe(false)
    expect(big.isShowFooterComponent).toBe(true)
  })
})
