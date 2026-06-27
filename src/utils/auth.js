/**
 * 鉴权辅助工具（见 dev_docs/06-token-expiry.md）
 *
 * 背景：本项目无统一 axios 拦截器，真正携带 token 的是 AI 组件的原生 fetch。
 * 组件在发送前已用 userInfo store 的 `token` getter 做客户端 JWT 过期判断
 * （0=未登录 / -1=已过期）。但 token 仍可能被服务端拒绝（撤销 / 监控触发）返回 401，
 * 此处提供统一的 401 处理：清理本地 token 并提示重新登录。
 */

import useUserInfo from '@/stores/userInfo'
import { remindReLogin } from '@/utils/remindLogin'

/**
 * 清理本地登录态（store + localStorage）。
 */
export function clearToken() {
  const userInfoStore = useUserInfo()
  userInfoStore.userToken = ''
  userInfoStore.isLogin = false
  userInfoStore.username = ''
  localStorage.removeItem('token')
}

/**
 * 判断一个 fetch Response / 错误是否为 401 未授权。
 * @param {{status?: number}} responseOrError
 * @returns {boolean}
 */
export function isUnauthorized(responseOrError) {
  return !!responseOrError && responseOrError.status === 401
}

/**
 * 统一处理 401：清理本地 token 并弹出「重新登录」提示。
 */
export function handleUnauthorized() {
  clearToken()
  remindReLogin()
}
