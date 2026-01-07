# 06. Token过期处理 - 会话管理完善

**问题严重程度**: 🟠 高危  
**修复优先级**: 短期修复（1-2周）  
**依赖后端**: 是 - 需要后端提供token刷新机制

---

## 问题概述

项目当前Token过期处理不完善，用户可能在操作过程中突然被登出，或者Token过期后没有合理的刷新和重试机制，影响用户体验和系统可用性。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\stores\aiEnglish_demo.js
d:\06_program_code\zibuyu_blog\src\server\serverRequest.js
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
```

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - 用户体验下降
  - 操作中断
  - 安全风险

---

## 修复方案

### 步骤 1: 创建Token管理工具

创建文件: `src/utils/tokenManager.js`

```javascript
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token, expiresIn = 3600) {
  const expiry = Date.now() + (expiresIn * 1000)
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getTokenExpiry() {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  return expiry ? parseInt(expiry) : null
}

export function isTokenExpired() {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  return Date.now() >= expiry
}

export function shouldRefreshToken() {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  const bufferTime = 300000
  return Date.now() >= (expiry - bufferTime)
}

export function removeTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    const data = await response.json()
    
    if (data.code === 200) {
      setAccessToken(data.data.accessToken, data.data.expiresIn)
      if (data.data.refreshToken) {
        setRefreshToken(data.data.refreshToken)
      }
      return data.data.accessToken
    } else {
      throw new Error(data.message || 'Token refresh failed')
    }
  } catch (error) {
    removeTokens()
    throw error
  }
}
```

### 步骤 2: 创建自动刷新拦截器

创建文件: `src/utils/tokenRefreshInterceptor.js`

```javascript
import axios from 'axios'
import { 
  isTokenExpired, 
  shouldRefreshToken, 
  refreshAccessToken, 
  getAccessToken,
  removeTokens 
} from '@/utils/tokenManager'
import { ElMessage } from 'element-plus'
import router from '@/router'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export function setupTokenRefreshInterceptor(instance) {
  instance.interceptors.request.use(
    async (config) => {
      const token = getAccessToken()
      
      if (token && shouldRefreshToken() && !config._retry) {
        if (!isRefreshing) {
          config._retry = true
          isRefreshing = true
          
          try {
            const newToken = await refreshAccessToken()
            config.headers['Authorization'] = `Bearer ${newToken}`
            processQueue(null, newToken)
          } catch (error) {
            processQueue(error)
            handleAuthError()
            return Promise.reject(error)
          } finally {
            isRefreshing = false
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            config.headers['Authorization'] = `Bearer ${token}`
            return config
          })
        }
      }
      
      return config
    },
    (error) => Promise.reject(error)
  )
  
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        if (!isRefreshing) {
          isRefreshing = true
          
          try {
            const newToken = await refreshAccessToken()
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            processQueue(null, newToken)
            return instance(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError)
            handleAuthError()
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return instance(originalRequest)
          })
        }
      }
      
      return Promise.reject(error)
    }
  )
}

function handleAuthError() {
  removeTokens()
  
  if (router.currentRoute.value.meta.requiresAuth) {
    ElMessage.error('登录已过期，请重新登录')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
  }
}
```

### 步骤 3: 更新serverRequest.js

```javascript
import axios from 'axios'
import { setupTokenRefreshInterceptor } from '@/utils/tokenRefreshInterceptor'
import useAiEnglish from '@/stores/aiEnglish';
import { ElMessage } from 'element-plus'

class MyRequest {
  constructor(baseURL, timeout = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout
    });

    this.commonHeaders = {
      'Content-Type': 'application/json',
    };
    
    setupTokenRefreshInterceptor(this.instance)
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
          ElMessage.error('Response data is not JSON format')
          reject('Response data is not JSON format');
          return;
        }

        if (!res.data.hasOwnProperty('code')) {
          ElMessage.error('JSON data does not contain "code" field')
          reject('JSON data does not contain "code" field');
          return;
        }

        if (res.data.code === 3001) {
          ElMessage({
            message: '操作太频繁了，喝口水休息一下吧~',
            type: 'warning',
          })
          reject('Requests are too frequent');
          return;
        }

        resolve(res.data)
      }).catch(err => {
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

### 步骤 4: 后端接口协调

**必须提供的API接口：**

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/refresh` | POST | 刷新access token，使用refresh token换取新的access token |

**刷新token接口响应示例：**

```json
{
  "code": 200,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 3600,
    "refreshToken": "new_refresh_token"
  }
}
```

**⚠️ 前端开发者任务清单：**

- [ ] 确认后端token刷新接口地址
- [ ] 确认refresh token的获取和存储方式
- [ ] 确认token过期时间
- [ ] 测试token自动刷新机制
- [ ] 测试401错误处理和重定向

---

## 重要补充说明

### 1. Token刷新策略

- 提前5分钟刷新token
- 并发请求统一刷新
- 刷新失败清除所有token并跳转登录

### 2. Token过期错误码

建议后端使用标准错误码：

| 错误码 | 说明 | 前端处理 |
|-------|------|---------|
| 40101 | Token过期 | 自动刷新 |
| 40102 | Token无效 | 跳转登录 |
| 40103 | Token缺失 | 跳转登录 |

### 3. 多Tab同步

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

const isLoggedIn = ref(!!getAccessToken())

const STORAGE_KEY = 'auth_state_change'

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    isLoggedIn.value = !!getAccessToken()
  }
})

const notifyStateChange = () => {
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
}

onUnmounted(() => {
  window.removeEventListener('storage', () => {})
})
```

### 4. 登录状态检测

```javascript
export function checkLoginStatus() {
  const token = getAccessToken()
  const expiry = getTokenExpiry()
  
  if (!token || !expiry) {
    return { loggedIn: false, reason: 'no_token' }
  }
  
  if (Date.now() >= expiry) {
    return { loggedIn: false, reason: 'token_expired' }
  }
  
  return { loggedIn: true }
}
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查Token存储和获取逻辑
- [ ] 验证自动刷新机制
- [ ] 确认错误处理逻辑

### 2. 功能测试

- [ ] 测试登录登出流程
- [ ] 测试token自动刷新
- [ ] 测试过期处理
- [ ] 测试多Tab同步

### 3. 安全测试

- [ ] 测试token劫持防护
- [ ] 测试并发刷新处理
- [ ] 测试强制登出

---

## 预期收益

- ✅ 提升用户体验
- ✅ 保障会话安全
- ✅ 减少重复登录

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
