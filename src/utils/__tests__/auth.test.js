import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// remindLogin.js 在模块顶层即 useDeviceInfo()（pinia 尚未激活会报错），
// 整体 mock 掉，使 auth.js 的单测保持隔离，只验证「是否调用 remindReLogin」。
const { remindReLogin } = vi.hoisted(() => ({ remindReLogin: vi.fn() }))
vi.mock('@/utils/remindLogin', () => ({
  remindReLogin,
  remindLogin: vi.fn(),
}))

import { clearToken, isUnauthorized, handleUnauthorized } from '@/utils/auth'
import useUserInfo from '@/stores/userInfo'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  remindReLogin.mockClear()
})

describe('isUnauthorized', () => {
  it('is true only for status 401', () => {
    expect(isUnauthorized({ status: 401 })).toBe(true)
    expect(isUnauthorized({ status: 403 })).toBe(false)
    expect(isUnauthorized({ status: 200 })).toBe(false)
    expect(isUnauthorized(null)).toBe(false)
    expect(isUnauthorized(undefined)).toBe(false)
  })
})

describe('clearToken', () => {
  it('clears store login state and localStorage token', () => {
    const store = useUserInfo()
    store.userToken = 'a.b.c'
    store.isLogin = true
    store.username = 'alice'
    localStorage.setItem('token', 'a.b.c')

    clearToken()

    expect(store.userToken).toBe('')
    expect(store.isLogin).toBe(false)
    expect(store.username).toBe('')
    expect(localStorage.getItem('token')).toBe(null)
  })
})

describe('handleUnauthorized', () => {
  it('clears token and prompts re-login', () => {
    const store = useUserInfo()
    store.userToken = 'x.y.z'
    localStorage.setItem('token', 'x.y.z')

    handleUnauthorized()

    expect(localStorage.getItem('token')).toBe(null)
    expect(store.userToken).toBe('')
    expect(remindReLogin).toHaveBeenCalledTimes(1)
  })
})
