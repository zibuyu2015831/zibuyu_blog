import { describe, it, expect, vi, beforeEach } from 'vitest'

// 模拟 element-plus 的 ElMessage / ElNotification，断言调用而不真正弹窗。
// 用 vi.hoisted 定义，确保 mock 工厂（被提升到顶部）能安全访问到这些引用。
const { elMessage, elNotification } = vi.hoisted(() => {
  const msg = Object.assign(vi.fn(), {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
  })
  return { elMessage: msg, elNotification: vi.fn() }
})

vi.mock('element-plus', () => ({
  ElMessage: elMessage,
  ElNotification: elNotification,
}))

import {
  sanitizeErrorMessage,
  resolveErrorMessage,
  handleError,
} from '@/utils/errorHandler'

beforeEach(() => {
  elMessage.error.mockClear()
  elMessage.warning.mockClear()
  elMessage.success.mockClear()
  elNotification.mockClear()
})

describe('sanitizeErrorMessage', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeErrorMessage(null)).toBe('')
    expect(sanitizeErrorMessage(undefined)).toBe('')
  })

  it('redacts password / token / key / authorization', () => {
    expect(sanitizeErrorMessage('password: hunter2')).toContain('[REDACTED]')
    expect(sanitizeErrorMessage('token=abc.def.ghi')).toContain('[REDACTED]')
    expect(sanitizeErrorMessage('Authorization: Bearer xyz')).toContain('[REDACTED]')
    expect(sanitizeErrorMessage('api_key=SECRET123')).toContain('[REDACTED]')
    expect(sanitizeErrorMessage('password: hunter2')).not.toContain('hunter2')
  })

  it('truncates very long messages to 200 chars + ellipsis', () => {
    const long = 'x'.repeat(500)
    const out = sanitizeErrorMessage(long)
    expect(out.length).toBe(203)
    expect(out.endsWith('...')).toBe(true)
  })

  it('leaves ordinary messages untouched', () => {
    expect(sanitizeErrorMessage('网络异常')).toBe('网络异常')
  })
})

describe('resolveErrorMessage', () => {
  it('handles string errors', () => {
    expect(resolveErrorMessage('boom')).toBe('boom')
  })

  it('maps axios response status to friendly text', () => {
    expect(resolveErrorMessage({ response: { status: 401 } })).toBe('登录已过期，请重新登录')
    expect(resolveErrorMessage({ response: { status: 500 } })).toBe('服务器内部错误')
  })

  it('prefers backend data.message', () => {
    expect(
      resolveErrorMessage({ response: { status: 400, data: { message: '邀请码错误' } } })
    ).toBe('邀请码错误')
  })

  it('maps business code 3001', () => {
    expect(resolveErrorMessage({ response: { status: 200, data: { code: 3001 } } })).toBe(
      '操作太频繁了，喝口水休息一下吧~'
    )
  })

  it('falls back to Error.message then default', () => {
    expect(resolveErrorMessage(new Error('low level'))).toBe('low level')
    expect(resolveErrorMessage(null)).toBe('操作失败，请稍后重试')
  })
})

describe('handleError', () => {
  it('shows an error ElMessage by default (sanitized)', () => {
    handleError('token=leak.me')
    expect(elMessage.error).toHaveBeenCalledTimes(1)
    expect(elMessage.error.mock.calls[0][0]).toContain('[REDACTED]')
  })

  it('respects showMessage:false', () => {
    const r = handleError(new Error('silent'), { showMessage: false })
    expect(elMessage.error).not.toHaveBeenCalled()
    expect(r.message).toBe('silent')
  })

  it('uses provided override message and level', () => {
    handleError(new Error('raw'), { message: '登录失败，请稍后重试', level: 'warning' })
    expect(elMessage.warning).toHaveBeenCalledWith('登录失败，请稍后重试')
  })
})
