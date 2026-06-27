import { describe, it, expect } from 'vitest'
import { base64Encode } from '@/utils/encoding'

// 原内联实现（重构前），用于回归比对：确保抽取后输出逐字一致。
function legacyBase64Encode(str) {
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    function (match, p1) {
      return String.fromCharCode('0x' + p1)
    }
  )
  return btoa(utf8Bytes)
}

describe('base64Encode', () => {
  it('encodes plain ASCII like btoa', () => {
    expect(base64Encode('hello')).toBe(btoa('hello'))
    expect(base64Encode('admin')).toBe('YWRtaW4=')
  })

  it('handles UTF-8 (中文) without throwing', () => {
    // btoa('密码') 会抛错；本实现先做 UTF-8 转换，应正常返回
    expect(() => base64Encode('密码123')).not.toThrow()
    expect(base64Encode('密码123')).toBe(legacyBase64Encode('密码123'))
  })

  it('matches the legacy inline implementation across a sample set', () => {
    const samples = ['', 'a', 'P@ssw0rd!', '用户名', '混合 mix 123', '🚀emoji']
    for (const s of samples) {
      expect(base64Encode(s)).toBe(legacyBase64Encode(s))
    }
  })

  it('is deterministic / round-trippable for ASCII via atob', () => {
    expect(atob(base64Encode('round-trip'))).toBe('round-trip')
  })
})
