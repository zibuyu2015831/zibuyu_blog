# 06. Token过期处理 - 会话管理完善

**问题严重程度**: 🟠 高危  
**修复优先级**: 短期修复（1-2周）  
**依赖后端**: 是 - 需要后端提供token刷新机制

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟢 **方向成立（重度依赖后端）**
>
> - **属实**：当前**无 token 刷新 / 静默续期机制**，也**无统一的 401 响应拦截器**。前端仅做客户端 JWT 过期判断。
> - **真实现状（原文未写清）**：token 以 `localStorage('token')` + Pinia `userInfo` store 的 `userToken` 双份保存；`userInfo.js` 的 `token` getter 已在本地解码 JWT 的 `exp` 做过期判断，过期即清空并返回 `-1`（见下文）。token 并非由 `serverRequest.js` 统一注入——该文件的 `Authorization: 'Bearer your_token_here'` 是**写死的占位符**，真实 token 由各 AI 组件用 `fetch` 手动拼接。
> - **结论**：合理改进，但需后端提供 `refresh token` 接口配合。**本仓库当前不存在任何 refresh / 续期端点**，刷新机制无法在纯前端落地；中优先级恰当，非紧急。


## 问题概述

项目当前Token过期处理不完善，用户可能在操作过程中突然被登出，或者Token过期后没有合理的刷新和重试机制，影响用户体验和系统可用性。

---

## 涉及文件路径

> ⚠️ 复审修正后的真实清单（逐一 Read 核对）。

```
src/stores/userInfo.js          # token 真正的存放与过期判断处（getter `token` + action `loadTokenFromLocalStorage`）
src/content/DialogLogin.vue:148  # 登录成功：userInfoStore.userToken = data.token
src/content/DialogLogin.vue:155  # 登录成功：localStorage.setItem('token', data.token)
src/utils/logout.js:15           # POST /api/account/logout/，成功后 removeItem('token') 并清空 store
src/utils/remindLogin.js         # remindLogin / remindReLogin 弹窗（未登录 / token 失效时提示重新登录）
src/server/serverRequest.js:14   # Authorization 为写死占位符 'Bearer your_token_here'（并未注入真实 token）
src/components/AiEnglishCommonAssistant.vue:623  # fetch 手动拼 Authorization: `Bearer ${userInfoStore.token}`
src/components/AiEnglishSpokenCoach.vue:231      # 同上，手动拼 Bearer
```

### 当前真实 token 流（复审实测）

1. **登录写入**：`DialogLogin.vue` 拿到响应后 `userInfoStore.userToken = data.token`（line 148）并 `localStorage.setItem('token', data.token)`（line 155）。token 为标准三段式 JWT。
2. **启动恢复**：`userInfo.js` 的 action `loadTokenFromLocalStorage()` 从 `localStorage` 读回 token，解码 `parts[1]` 取 `payload.exp` 与当前秒级时间比较，**已过期则直接丢弃**，否则写入 `userToken` 并置 `isLogin = true`。
3. **读取与过期判断**：组件通过 getter `token` 取值——
   - `userToken === ''` → 返回 `0`（无 token）；
   - JWT 段数 ≠ 3 → 返回 `0`；
   - `payload.exp < 当前时间` → 清空 `userToken`、`removeItem('token')`，返回 `-1`（已过期）；
   - 否则返回 token 字符串。
   AI 组件据此判断：如 `AiEnglishCommonAssistant.vue:525` 判 `token == 0`（未登录）、`:530` 判 `token == -1`（过期）后触发提示。
4. **请求携带**：**没有统一拦截器**。`serverRequest.js`（axios 封装）的公共头里 `Authorization` 是占位符，真实需要鉴权的 AI 接口由各组件直接用原生 `fetch` 拼 `Bearer ${userInfoStore.token}`（`AiEnglishCommonAssistant.vue:623`、`AiEnglishSpokenCoach.vue:231`），并自行处理 `response.ok === false`。
5. **登出**：`logout.js` 调 `POST /api/account/logout/`，`code === 0` 时清 `localStorage` 与 store。

### 401 / 刷新需要触碰的位置

- **拦截层缺位**：`serverRequest.js` 的 `request()` 目前只在 `then` 里检查业务 `code`（如 `3001` 限流），`catch` 仅 `reject(err)`，**未对 HTTP 401 做处理**。要做统一 401 处理，需在此处的 axios 实例上加 `response` 拦截器；但走原生 `fetch` 的 AI 接口不经过 axios，需另行在各 `fetch` 处补 `response.status === 401` 分支。
- **过期判断已在前端**：续期/刷新若要落地，依赖后端新增 refresh 端点 —— **本仓库现无此端点**。

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - 用户体验下降（token 过期后下次操作才被发现，无静默续期）
  - 操作中断
  - 安全风险

---

## 修复方案

> ⚠️ **落地前提**：下方步骤 1/2 的 `refreshAccessToken()` 与拦截器依赖一个**后端 refresh 端点**（示例用 `/api/auth/refresh`）。**本仓库当前不存在该端点，也无 refresh_token 概念**（登录响应只返回单一 `data.token`，见 `DialogLogin.vue:148/155`）。因此：
> - 在后端提供 refresh 接口之前，**步骤 1/2 仅作为目标设计**，不能直接启用。
> - **可立即落地的最小改进**：① 把现状中分散在各组件的「客户端 JWT 过期判断」收敛复用 `userInfo.js` 的 getter `token`（已实现，避免重复解码逻辑）；② 在 `serverRequest.js` 的 axios 响应拦截 / `catch` 中统一处理 HTTP 401，触发 `remindReLogin()`（`src/utils/remindLogin.js` 已有此函数）并清理 token；③ 修掉 `serverRequest.js:14` 写死的 `Bearer your_token_here`，改为请求拦截器里注入 `userInfoStore.token`，使 axios 路径也能自动带 token（当前仅 AI 组件的 `fetch` 手动带）。

### 步骤 1: 创建Token管理工具（依赖后端 refresh，暂为目标设计）

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

### 步骤 3: 改造 `src/server/serverRequest.js`（可立即落地的部分）

**当前真实文件**（`src/server/serverRequest.js`）关键点：构造函数里 `commonHeaders.Authorization = 'Bearer your_token_here'`（line 14，写死占位符）；`request()` 在 `then` 内校验 `res.data` 是否为对象、是否含 `code`、`code === 3001` 限流提示；`catch` 仅 `reject(err)`，**对 401 无任何处理**。

改造目标（两步，均不依赖 refresh 端点）：

1. **请求拦截注入真实 token**，替换写死的占位符：

```javascript
import axios from 'axios'
import useUserInfo from '@/stores/userInfo'
import { remindReLogin } from '@/utils/remindLogin'
import { ElMessage } from 'element-plus'

class MyRequest {
  constructor(baseURL, timeout = 10000) {
    this.instance = axios.create({ baseURL, timeout });
    this.commonHeaders = { 'Content-Type': 'application/json' }; // ← 删除写死的 Authorization

    // 请求拦截器：动态注入当前 token（getter 已含过期判断，过期返回 -1）
    this.instance.interceptors.request.use((config) => {
      const userInfoStore = useUserInfo();
      const token = userInfoStore.token; // 0=未登录 / -1=已过期 / string=有效
      if (typeof token === 'string') {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });
  }
```

2. **响应/异常里统一处理 401**（在现有 `catch` 中补分支）：

```javascript
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          const userInfoStore = useUserInfo();
          userInfoStore.userToken = '';
          localStorage.removeItem('token');
          remindReLogin();           // src/utils/remindLogin.js 已有
        }
        reject(err)
      })
```

> 现有 `then` 内对 `res.data` 结构和 `code === 3001` 限流的处理**保持不变**。
> 注意：走原生 `fetch` 的 AI 接口（`AiEnglishCommonAssistant.vue:623`、`AiEnglishSpokenCoach.vue:231`）**不经过本 axios 实例**，其 401 处理需在各自 `fetch` 的 `if (!response.ok)` 分支内单独补 `response.status === 401` → `remindReLogin()`。

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

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
