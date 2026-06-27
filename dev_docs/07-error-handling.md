# 07. 错误处理改进 - 统一错误管理

**问题严重程度**: 🟠 高危  
**修复优先级**: 短期修复（1-2周）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟢 **成立**
>
> - **属实**：错误处理分散于各组件 / store / api，提示不统一。`catch` 分布于 11 个文件（grep 实测），`ElMessage` 调用分布于 11 个文件。`serverRequest.js` 在 `then` 内直接 `ElMessage.error('Response data is not JSON format')` 等原始英文信息；`getNews.js`、AI 组件 `fetch` 的 `catch` 多为 `console.log` 吞错。
> - **结论**：统一 `errorHandler` 封装合理，建议采纳（敏感信息脱敏部分价值较高）。具体散落点见下方「涉及文件路径」。


## 问题概述

项目当前错误处理机制不完善，存在以下问题：错误信息显示过于详细可能导致敏感信息泄露，错误处理逻辑分散且不统一，用户体验不一致。

---

## 涉及文件路径

> ⚠️ 复审修正后的真实散落清单（按 `grep "catch"` / `grep "ElMessage"` 实测）。

**网络/请求层（最值得收敛）：**

```
src/server/serverRequest.js      # then 内多处 ElMessage.error 原始英文信息（'Response data is not JSON format' 等）；catch 仅 reject，未分级
src/api/getNews.js:24            # .catch 内 console.log('请求新闻时出现了错误： ', error) 并返回 []，错误被吞
```

**鉴权/账户组件（手写 try/catch + ElMessage，模式各异）：**

```
src/content/DialogLogin.vue:164      # .catch 内 ElMessage + console.error，文案各自硬编码
src/content/DialogRegister.vue        # 同型：1 处 catch，10 处 ElMessage
src/content/ResetPassword.vue         # 同型：1 处 catch，11 处 ElMessage
src/utils/logout.js:46                # catch 内 ElMessage.error + console.error
```

**AI 对话组件（原生 fetch，错误处理最薄弱）：**

```
src/components/AiEnglishSpokenCoach.vue   # 4 处 catch、6 处 ElMessage；流式解析 catch 内仅 console.log(jsonLine) 吞错（约 line 302）
src/components/AiEnglishCommonAssistant.vue  # 6 处 catch、15 处 ElMessage；fetch !response.ok 时仅写入 'AI回复获取失败0.0' 文案
```

**其它：**

```
src/content/DialogReward.vue          # 2 处 ElMessage、3 处 console.*
src/utils/remindLogin.js              # ElMessageBox 弹窗（重新登录提示），属正常交互不算错误处理
```

> 共性问题：① 各处自行拼 `ElMessage.error(原始信息)`，无统一文案/分级；② `serverRequest.js` 直接把后端/解析层英文报错弹给用户；③ AI 组件的 `fetch` 错误多被 `console.log` 吞掉，用户侧无反馈或仅一句通用提示；④ 无敏感信息脱敏。

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

创建文件: `src/utils/errorHandler.js`（仓库当前 `src/utils/` 下无此文件，需新建）

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

### 步骤 2: 接入 `src/server/serverRequest.js`

**现状对照**：当前文件第 2 行 `import useAiEnglish from '@/stores/aiEnglish'` 实际**并未在文件内使用**（且真实 store 文件名为 `aiEnglish_demo.js`），可顺手删除该无用 import。`then` 内三处 `ElMessage.error(...)` 改为抛 `AppError` 交由统一处理；`catch` 内统一 `handleError(err)`。下方为改造后形态：

```javascript
import axios from 'axios'
import { handleError, AppError } from '@/utils/errorHandler'
// 删除原第 2 行无用 import：useAiEnglish from '@/stores/aiEnglish'

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

### 步骤 4: 各散落点接入清单（按真实文件）

| 文件 | 当前写法 | 改造为 |
|------|---------|--------|
| `src/server/serverRequest.js` | `then` 内 `ElMessage.error('Response data is not JSON format')` 等；`catch` 仅 `reject` | 抛 `AppError`；`catch` 调 `handleError(err)` |
| `src/api/getNews.js:24` | `.catch` 内 `console.log(...)` 并 `return []` | `handleError(error, { showMessage: false })` 后再 `return []`（保持降级返回空数组的行为） |
| `src/content/DialogLogin.vue:164` | `.catch` 内自拼 `ElMessage` + `console.error` | `handleError(error, { message: '登录失败，请稍后重试' })` |
| `src/content/DialogRegister.vue` / `ResetPassword.vue` | 多处硬编码 `ElMessage` | 同上，统一经 `handleError` |
| `src/utils/logout.js:46` | `catch` 内 `ElMessage.error` + `console.error` | `handleError(error, { message: '退出登录失败，请稍后重试' })` |
| `src/components/AiEnglishSpokenCoach.vue`（约 line 302） | 流式解析 `catch` 内仅 `console.log(jsonLine)` 吞错 | 静默项可保留 `console`（属流式协议噪声），但 `fetch` 的 `!response.ok` 分支应改为 `handleError` 给出统一提示 |
| `src/components/AiEnglishCommonAssistant.vue` | `!response.ok` 仅写入 `'AI回复获取失败0.0'` | 经 `handleError` 输出统一文案，并保留占位内容 |

> 优先级：先接 `serverRequest.js`（覆盖所有 axios 请求），再统一账户类组件文案，最后处理 AI `fetch` 分支。

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

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
