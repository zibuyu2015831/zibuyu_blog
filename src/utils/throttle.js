/**
 * 轻量节流（leading edge），见 dev_docs/10-performance.md
 *
 * 用于 resize / scroll 等高频事件回调，限制单位时间内最多触发一次，
 * 降低对 Pinia store 的高频写入与重排。无需引入 lodash。
 *
 * @param {Function} fn 实际执行的函数
 * @param {number} [wait=100] 时间窗口（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, wait = 100) {
  // 用 -Infinity 而非 0 初始化，确保首次调用一定执行（不依赖 Date.now() 的绝对值）
  let last = -Infinity
  return function throttled(...args) {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      return fn.apply(this, args)
    }
  }
}
