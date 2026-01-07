# 07. 错误处理改进 - 统一错误管理

**问题严重程度**: 🟠 高危  
**修复优先级**: 短期修复（1-2周）  
**依赖后端**: 否

---

## 问题概述

项目当前错误处理机制不完善，存在以下问题：错误信息显示过于详细可能导致敏感信息泄露，错误处理逻辑分散且不统一，用户体验不一致。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\server\serverRequest.js
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
d:\06_program_code\zibuyu_blog\src\content\DialogRegister.vue
d:\06_program_code\zibuyu_blog\src\views\Article.vue
d:\06_program_code\zibuyu_blog\src\stores\aiEnglish_demo.js
d:\06_program_code\zibuyu_blog\src\components\AiEnglishSpokenCoach.vue
d:\06_program_code\zibuyu_blog\src\components\AiEnglishCommonAssistant.vue
```

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - 敏感信息泄露
  - 用户体验不一致
  - 问题排查困难

---

## 修复方案

### 步骤 1: 创建统一错误处理工具

创建文件: `src/utils/errorHandler.js`

```javascript
import { ElMessage, ElNotification, ElDialog } from 'element-plus'

const ERROR_CODE_MESSAGES = {
  400: '请求参数错误，请检查输入',
  401: '登录已过期，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  422: '数据验证失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
}

const BUSINESS_ERROR_MESSAGES = {
  1001: '用户名或密码错误',
  1002: '账户已被禁用',
  1003: '验证码错误',
  1004: '验证码已过期',
  2001: 'Token无效',
  2002: 'Token已过期',
  3001: '操作过于频繁'
}

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN', details = null, level = 'error') {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.level = level
    this.timestamp = new Date().toISOString()
  }
}

export function handleError(error, options = {}) {
  const {
    showMessage = true,
    message = null,
    level = 'error'
  } = options
  
  let errorMessage = message
  let errorCode = 'UNKNOWN'
  let errorDetails = null
  
  if (error instanceof AppError) {
    errorCode = error.code
    errorMessage = error.message
    errorDetails = error.details
  } else if (error.response) {
    errorCode = error.response.status
    errorDetails = error.response.data
    
    if (error.response.data?.message) {
      errorMessage = error.response.data.message
    } else if (ERROR_CODE_MESSAGES[errorCode]) {
      errorMessage = ERROR_CODE_MESSAGES[errorCode]
    } else if (error.response.data?.code && BUSINESS_ERROR_MESSAGES[error.response.data.code]) {
      errorCode = error.response.data.code
      errorMessage = BUSINESS_ERROR_MESSAGES[errorCode]
    }
  } else if (error.message) {
    errorMessage = error.message
  }
  
  const sanitizedMessage = sanitizeErrorMessage(errorMessage)
  
  if (showMessage && sanitizedMessage) {
    if (level === 'warning') {
      ElMessage.warning(sanitizedMessage)
    } else if (level === 'success') {
      ElMessage.success(sanitizedMessage)
    } else {
      ElMessage.error(sanitizedMessage)
    }
  }
  
  if (level === 'error' || error.level === 'error') {
    console.error('[AppError]', {
      code: errorCode,
      message: sanitizedMessage,
      details: errorDetails,
      stack: error.stack
    })
  } else if (level === 'warning') {
    console.warn('[AppWarning]', {
      code: errorCode,
      message: sanitizedMessage,
      details: errorDetails
    })
  }
  
  return {
    code: errorCode,
    message: sanitizedMessage,
    details: errorDetails
  }
}

function sanitizeErrorMessage(message) {
  if (!message) return null
  
  const sensitivePatterns = [
    /password[:\s]*\S+/gi,
    /token[:\s]*\S+/gi,
    /key[:\s]*\S+/gi,
    /secret[:\s]*\S+/gi,
    /Authorization[:\s]*/gi
  ]
  
  let sanitized = message
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })
  
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200) + '...'
  }
  
  return sanitized
}

export function showErrorNotification(title, message, duration = 5000) {
  ElNotification({
    title,
    message: sanitizeErrorMessage(message),
    type: 'error',
    duration
  })
}

export function showSuccessNotification(title, message, duration = 3000) {
  ElNotification({
    title,
    message,
    type: 'success',
    duration
  })
}

export function createErrorHandler(options = {}) {
  return (error) => {
    handleError(error, options)
    return Promise.reject(error)
  }
}

export function wrapAsync(fn, errorHandler = null) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (errorHandler) {
        errorHandler(error)
      } else {
        handleError(error)
      }
      throw error
    }
  }
}
```

### 步骤 2: 更新serverRequest.js

```javascript
import axios from 'axios'
import { handleError, AppError } from '@/utils/errorHandler'
import useAiEnglish from '@/stores/aiEnglish';

class MyRequest {
  constructor(baseURL, timeout = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout
    });

    this.commonHeaders = {
      'Content-Type': 'application/json',
    };
  }

  request(config) {
    if (config.headers && config.headers.Authorization) {
      config.headers = {
        ...this.commonHeaders,
        ...config.headers
      };
    } else {
      config.headers = this.commonHeaders;
    }

    return new Promise((resolve, reject) => {
      this.instance.request(config).then(res => {
        if (typeof res.data !== 'object' || res.data === null) {
          reject(new AppError('Response data is not JSON format', 'PARSE_ERROR'));
          return;
        }

        if (!res.data.hasOwnProperty('code')) {
          reject(new AppError('JSON data does not contain "code" field', 'INVALID_RESPONSE'));
          return;
        }

        if (res.data.code === 3001) {
          reject(new AppError('操作太频繁了，喝口水休息一下吧~', 'RATE_LIMIT'));
          return;
        }

        resolve(res.data)
      }).catch(err => {
        handleError(err)
        reject(err)
      })
    })
  }

  get(config) {
    return this.request({ ...config, method: "get" })
  }

  post(config) {
    return this.request({ ...config, method: "post" })
  }
}

export default new MyRequest(SERVER_URL)
```

### 步骤 3: 创建错误边界组件

创建文件: `src/components/ErrorBoundary.vue`

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)
const errorInfo = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info
  console.error('Error captured by boundary:', err)
  return false
})

const handleReload = () => {
  window.location.reload()
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>出错了</h2>
      <p>抱歉，发生了错误。请尝试刷新页面。</p>
      <button @click="handleReload">刷新页面</button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  padding: 40px;
}

button {
  padding: 10px 20px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

---

## 重要补充说明

### 1. 错误分级处理

```javascript
const ERROR_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4
}

export function logError(error, level = ERROR_LEVELS.ERROR) {
  const logMethods = {
    [ERROR_LEVELS.DEBUG]: console.debug,
    [ERROR_LEVELS.INFO]: console.info,
    [ERROR_LEVELS.WARNING]: console.warn,
    [ERROR_LEVELS.ERROR]: console.error,
    [ERROR_LEVELS.CRITICAL]: console.error
  }
  
  logMethods[level]?.('[Error]', error)
}
```

### 2. 错误上报

```javascript
export function reportError(error, context = {}) {
  const reportData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context
  }
  
  if (process.env.NODE_ENV === 'production') {
    // 上报到错误追踪服务
    console.log('[Error Report]', reportData)
  }
}
```

### 3. 用户友好错误消息

```javascript
export function getUserFriendlyMessage(code) {
  const messages = {
    NETWORK_ERROR: '网络连接不稳定，请检查网络后重试',
    TIMEOUT_ERROR: '请求超时，请稍后重试',
    SERVER_ERROR: '服务器暂时无法响应，请稍后重试',
    UNKNOWN_ERROR: '发生未知错误，请刷新页面重试'
  }
  return messages[code] || messages.UNKNOWN_ERROR
}
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有catch块
- [ ] 确认错误处理工具已正确使用
- [ ] 验证敏感信息已被过滤

### 2. 功能测试

- [ ] 测试各类错误场景
- [ ] 验证错误消息显示
- [ ] 检查错误边界组件

### 3. 安全测试

- [ ] 检查生产环境错误日志
- [ ] 验证敏感信息已过滤
- [ ] 测试错误信息泄露

---

## 预期收益

- ✅ 统一错误处理
- ✅ 防止信息泄露
- ✅ 提升用户体验

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
