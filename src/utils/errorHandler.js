/**
 * 统一错误处理工具（见 dev_docs/07-error-handling.md）
 *
 * 设计目标：
 *  1. 收敛各处自拼的 ElMessage.error，文案统一、可分级；
 *  2. 对外展示的错误信息做敏感信息脱敏（password / token / key 等）；
 *  3. 兼容三种错误来源：axios error（error.response）、原生 fetch 的 Response、
 *     普通 Error / 字符串。
 *
 * 注意：本项目真实请求层是各处原生 fetch 与零散的直接 axios 调用，
 * 并无统一的 axios 实例可挂拦截器，故以「调用方在 catch 中调用 handleError」的方式接入。
 */

import { ElMessage, ElNotification } from 'element-plus'

// HTTP 状态码 → 用户友好文案
const HTTP_STATUS_MESSAGES = {
  400: '请求参数错误，请检查输入',
  401: '登录已过期，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  422: '数据验证失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
}

// 后端业务码 → 文案
const BUSINESS_CODE_MESSAGES = {
  2004: '操作失败，请检查输入信息',
  3001: '操作太频繁了，喝口水休息一下吧~',
}

const DEFAULT_MESSAGE = '操作失败，请稍后重试'

/**
 * 对错误信息做敏感信息脱敏，并限制长度。
 * @param {*} message
 * @returns {string}
 */
export function sanitizeErrorMessage(message) {
  if (message === null || message === undefined) return ''
  let sanitized = String(message)

  const sensitivePatterns = [
    /password["':=\s]*\S+/gi,
    /passwd["':=\s]*\S+/gi,
    /token["':=\s]*\S+/gi,
    /secret["':=\s]*\S+/gi,
    /api[_-]?key["':=\s]*\S+/gi,
    /authorization["':=\s]*\S+/gi,
    /bearer\s+\S+/gi,
  ]
  sensitivePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })

  if (sanitized.length > 200) {
    sanitized = sanitized.slice(0, 200) + '...'
  }
  return sanitized
}

/**
 * 从各种错误对象中解析出适合展示的文案（脱敏前）。
 * @param {*} error
 * @returns {string}
 */
export function resolveErrorMessage(error) {
  if (!error) return DEFAULT_MESSAGE

  // 字符串错误
  if (typeof error === 'string') return error

  // axios 风格：error.response.{status,data}
  const response = error.response
  if (response) {
    const data = response.data
    if (data && typeof data === 'object') {
      if (data.message) return data.message
      if (data.code && BUSINESS_CODE_MESSAGES[data.code]) {
        return BUSINESS_CODE_MESSAGES[data.code]
      }
    }
    if (HTTP_STATUS_MESSAGES[response.status]) {
      return HTTP_STATUS_MESSAGES[response.status]
    }
  }

  // 原生 fetch 的 Response（有 status，无 response 包裹）
  if (typeof error.status === 'number' && HTTP_STATUS_MESSAGES[error.status]) {
    return HTTP_STATUS_MESSAGES[error.status]
  }

  // 业务码直接挂在错误上
  if (error.code && BUSINESS_CODE_MESSAGES[error.code]) {
    return BUSINESS_CODE_MESSAGES[error.code]
  }

  // 普通 Error
  if (error.message) return error.message

  return DEFAULT_MESSAGE
}

/**
 * 统一处理错误：解析 → 脱敏 → （可选）弹窗提示。
 * @param {*} error
 * @param {{showMessage?: boolean, message?: string|null, level?: 'error'|'warning'|'success'}} [options]
 * @returns {{message: string}}
 */
export function handleError(error, options = {}) {
  const { showMessage = true, message = null, level = 'error' } = options

  const raw = message || resolveErrorMessage(error) || DEFAULT_MESSAGE
  const safe = sanitizeErrorMessage(raw)

  if (showMessage && safe) {
    if (level === 'warning') {
      ElMessage.warning(safe)
    } else if (level === 'success') {
      ElMessage.success(safe)
    } else {
      ElMessage.error(safe)
    }
  }

  return { message: safe }
}

/**
 * 错误通知（右上角，用于较重要的错误）。
 */
export function showErrorNotification(title, message, duration = 5000) {
  ElNotification({
    title,
    message: sanitizeErrorMessage(message),
    type: 'error',
    duration,
  })
}
