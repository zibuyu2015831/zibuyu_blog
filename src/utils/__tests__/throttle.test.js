import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { throttle } from '@/utils/throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes immediately on first call (leading edge)', () => {
    const fn = vi.fn()
    const t = throttle(fn, 100)
    t()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('suppresses calls within the wait window', () => {
    const fn = vi.fn()
    const t = throttle(fn, 100)
    t() // runs
    t() // suppressed
    t() // suppressed
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows another call after the window elapses', () => {
    const fn = vi.fn()
    const t = throttle(fn, 100)
    t()
    vi.advanceTimersByTime(100)
    t()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('forwards arguments and this-context', () => {
    const fn = vi.fn(function (a) {
      return this.base + a
    })
    const t = throttle(fn, 100)
    const ctx = { base: 10, t }
    ctx.t(5)
    expect(fn).toHaveBeenCalledWith(5)
    expect(fn.mock.instances[0]).toBe(ctx)
  })
})
