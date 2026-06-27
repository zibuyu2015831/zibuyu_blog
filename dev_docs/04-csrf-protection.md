# 04. CSRF防护 - 跨站请求伪造保护

**问题严重程度**: 🟢 低（当前 token-in-header 架构基本免疫 CSRF，详见复审结论）  
**修复优先级**: 低（仅当后端改用 Cookie 会话时才需要）  
**依赖后端**: 是 - 仅在改用 Cookie 会话后才需要 token 接口

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟡 **部分成立（严重度高估）**
>
> - **关键背景**：本项目鉴权使用 `Authorization: Bearer <token>` **请求头**，token 来自前端 `userInfoStore.token`（登录后由 `DialogLogin.vue:155` 写入 `localStorage`）。逐处核对：`AiEnglishSpokenCoach.vue:231`、`AiEnglishCommonAssistant.vue:623` 用 `` `Bearer ${userInfoStore.token}` ``，`AiEnglishCommonAssistant.vue:703` 用 `requestKey.value`。鉴权**并不依赖**浏览器自动携带的 Cookie。
> - **纠正**：CSRF 的前提是「Cookie 被浏览器在跨站请求时自动附加」。本项目的 token 存在 `localStorage` 且需 JS 显式放入请求头，跨站页面无法读取并附加它，因此 **token-in-header 架构天然基本免疫 CSRF**。原文「严重」定级明显偏高。
> - **唯一的 Cookie 痕迹**：`src/server/defaultChat.js:12` 有 `withCredentials: true // 确保携带cookies`，但该文件**未被任何模块 import**（`grep -rn "defaultChat" src/` 无结果），属死代码，不构成实际 CSRF 面。`src/server/serverRequest.js` 未设置 `withCredentials`，默认不带 Cookie。
> - **结论**：当前架构下本项优先级应下调为**低**。仅当后端**改用 Cookie/Session 会话**时，才需要实施下文的 CSRF Token 方案。


## 问题概述

CSRF（Cross-Site Request Forgery，跨站请求伪造）攻击的成立前提是：服务端**用 Cookie 识别会话**，而浏览器在跨站请求时会**自动附加** Cookie。本项目当前**不满足**该前提——鉴权 token 存于 `localStorage` 并由 JS 显式写入 `Authorization` 请求头，跨站页面无法读取、也无法让浏览器自动附加它，因此当前架构基本免疫 CSRF。本文档保留为「**预案**」：仅在后端将来改用 Cookie/Session 会话时启用。

---

## 涉及文件路径

```
src/server/serverRequest.js        # 实际生效的请求封装，未设置 withCredentials（不带 Cookie）
src/server/defaultChat.js:12        # 唯一含 withCredentials: true 的文件，但未被 import，是死代码
```

> 真实鉴权注入点（供对照，说明为何免疫 CSRF）：
> `src/components/AiEnglishSpokenCoach.vue:231`、`src/components/AiEnglishCommonAssistant.vue:623`（`Bearer ${userInfoStore.token}`）、`src/components/AiEnglishCommonAssistant.vue:703`（`requestKey.value`）。

---

## 风险评估

- **风险等级**: 低（当前 token-in-header 架构下）
- **现状说明**:
  - 请求未携带可被跨站自动附加的会话 Cookie，攻击者无法伪造“带凭据”的跨站请求。
  - `defaultChat.js` 的 `withCredentials: true` 是未被引用的死代码，建议随 01 号文档一并清理。
- **何时风险升高**: 若后端改为 `Set-Cookie` 会话且未配置 `SameSite`，则需立即实施本文方案。

---

## 修复方案（仅在改用 Cookie 会话后实施）

> ⚠️ 前置判断：在动手前先确认后端是否真的用 Cookie 维持会话。若仍是 `Authorization: Bearer` 头部鉴权，**无需实施本节**，否则只是增加无用复杂度。下面的 `csrf.js`/`csrfInterceptor.js` 均为**新增预案文件**，当前仓库尚未存在。

### 步骤 1: 创建CSRF Token管理工具

创建文件: `src/utils/csrf.js`

```javascript
const CSRF_TOKEN_KEY = 'csrf_token'
const CSRF_TOKEN_EXPIRY = 'csrf_token_expiry'

export function getCsrfToken() {
  const token = localStorage.getItem(CSRF_TOKEN_KEY)
  const expiry = localStorage.getItem(CSRF_TOKEN_EXPIRY)
  
  if (!token || !expiry) {
    return null
  }
  
  if (Date.now() > parseInt(expiry)) {
    removeCsrfToken()
    return null
  }
  
  return token
}

export function setCsrfToken(token, maxAge = 3600000) {
  const expiry = Date.now() + maxAge
  localStorage.setItem(CSRF_TOKEN_KEY, token)
  localStorage.setItem(CSRF_TOKEN_EXPIRY, expiry.toString())
}

export function removeCsrfToken() {
  localStorage.removeItem(CSRF_TOKEN_KEY)
  localStorage.removeItem(CSRF_TOKEN_EXPIRY)
}

export function isCsrfTokenValid() {
  const token = getCsrfToken()
  return !!token
}
```

### 步骤 2: 创建CSRF拦截器

创建文件: `src/utils/csrfInterceptor.js`

```javascript
import axios from 'axios'
import { getCsrfToken, setCsrfToken, removeCsrfToken } from '@/utils/csrf'
import { ElMessage } from 'element-plus'

const CSRF_TOKEN_HEADER = 'X-CSRF-Token'

export function setupCsrfInterceptor(instance) {
  instance.interceptors.request.use(
    async (config) => {
      if (shouldIncludeCsrfToken(config)) {
        let token = getCsrfToken()
        
        if (!token) {
          try {
            const response = await fetchCsrfToken()
            if (response && response.csrfToken) {
              token = response.csrfToken
              setCsrfToken(token, response.maxAge || 3600000)
            }
          } catch (error) {
            console.error('Failed to fetch CSRF token:', error)
          }
        }
        
        if (token) {
          config.headers[CSRF_TOKEN_HEADER] = token
        }
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  instance.interceptors.response.use(
    (response) => {
      const newToken = response.headers[CSRF_TOKEN_HEADER.toLowerCase()]
      if (newToken) {
        setCsrfToken(newToken)
      }
      
      if (response.data && response.data.csrfToken) {
        setCsrfToken(response.data.csrfToken)
      }
      
      return response
    },
    (error) => {
      if (error.response) {
        const { status, data } = error.response
        
        if (status === 403 || (data && data.code === 403)) {
          removeCsrfToken()
          ElMessage.error('CSRF验证失败，请刷新页面重试')
        }
      }
      return Promise.reject(error)
    }
  )
}

function shouldIncludeCsrfToken(config) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(config.method?.toUpperCase())) {
    return false
  }
  
  if (config.skipCsrf) {
    return false
  }
  
  return true
}

async function fetchCsrfToken() {
  try {
    const response = await axios.get('/api/csrf/token', {
      withCredentials: true
    })
    
    if (response.data && response.data.code === 200) {
      return {
        csrfToken: response.data.data.csrfToken,
        maxAge: response.data.data.maxAge || 3600000
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    return null
  }
}
```

### 步骤 3: 在 serverRequest.js 接入拦截器（最小改动）

本仓库 `src/server/serverRequest.js` 的 `MyRequest` 构造函数当前为（第 5-17 行）：

```javascript
// 现状
constructor(baseURL, timeout = 10000) {
  this.instance = axios.create({ baseURL, timeout });
  this.commonHeaders = {
    'Authorization': 'Bearer your_token_here',   // 占位符（见 01 号文档）
    "Content-Type": "application/json",
  };
}
```

仅需在创建 `this.instance` 后挂上拦截器即可，**不需要重写 `request()`/`get()`/`post()` 等其余逻辑**：

```javascript
import { setupCsrfInterceptor } from '@/utils/csrfInterceptor'   // 顶部新增 import

constructor(baseURL, timeout = 10000) {
  this.instance = axios.create({
    baseURL,
    timeout,
    withCredentials: true,   // 改用 Cookie 会话时才需要
  });
  this.commonHeaders = {
    "Content-Type": "application/json",
  };
  setupCsrfInterceptor(this.instance)   // 新增这一行
}
```

> 说明：现有 `request()` 中 `config.headers = { ...this.commonHeaders, ...config.headers }` 的合并逻辑保持不变；CSRF 头由拦截器在请求阶段注入，不影响调用方传入的 `Authorization`。

### 步骤 4: 后端接口协调

**必须提供的API接口：**

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/csrf/token` | GET | 获取CSRF token，应在响应头或Cookie中返回token |
| `/api/csrf/refresh` | POST | 刷新CSRF token，返回新的token |

**后端接口响应要求：**

1. **获取token接口响应示例：**

```json
{
  "code": 200,
  "data": {
    "csrfToken": "xxx",
    "maxAge": 3600
  }
}
```

2. **刷新token接口响应示例：**

```json
{
  "code": 200,
  "data": {
    "csrfToken": "yyy",
    "maxAge": 3600
  }
}
```

3. **Cookie设置要求（可选，备选方案）：**

```
Set-Cookie: CSRF-Token=xxx; Path=/; HttpOnly; Secure; SameSite=Strict
```

**⚠️ 前端开发者任务清单：**

- [ ] 与后端确认CSRF token接口地址
- [ ] 确认token刷新机制（自动/手动）
- [ ] 确认哪些接口需要CSRF保护
- [ ] 测试CSRF拦截器是否正常工作
- [ ] 验证403错误处理逻辑

---

## 重要补充说明

### 1. CSRF Token生成策略

- 使用加密安全的随机数生成器
- 长度至少32字节
- 设置合理的过期时间（建议1-2小时）

### 2. SameSite Cookie配置

后端设置Cookie时应配置：

```
SameSite=Strict: 最严格，只在同一站点请求时发送
SameSite=Lax: 宽松模式，允许导航请求
SameSite=None: 允许跨站，但必须配合Secure
```

### 3. 双重提交Cookie模式

作为Token模式的补充：

```javascript
function validateDoubleSubmitCookie(req, res, next) {
  const cookieToken = req.cookies.csrf_token
  const bodyToken = req.body._csrf
  
  if (!cookieToken || !bodyToken) {
    return res.status(403).json({ error: 'CSRF token missing' })
  }
  
  if (cookieToken !== bodyToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' })
  }
  
  next()
}
```

### 4. 异常处理策略

- 检测到CSRF攻击时，记录攻击日志
- 锁定可疑账户（多次触发）
- 通知用户账户安全状态

### 5. 测试用例

```javascript
describe('CSRF Protection', () => {
  it('should include CSRF token in POST requests', async () => {
    const token = getCsrfToken()
    expect(token).to.be.a('string')
    expect(token.length).to.be.at.least(32)
  })
  
  it('should not include token in GET requests', async () => {
    const config = { method: 'GET', url: '/api/data' }
    expect(shouldIncludeCsrfToken(config)).to.be.false
  })
  
  it('should refresh token on 403 response', async () => {
    // Test token refresh logic
  })
})
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查CSRF拦截器是否正确配置
- [ ] 验证Token获取和存储逻辑
- [ ] 确认异常处理逻辑

### 2. 功能测试

- [ ] 测试正常请求流程
- [ ] 测试Token刷新机制
- [ ] 测试403错误处理

### 3. 安全测试

- [ ] 模拟CSRF攻击
- [ ] 验证Token验证机制
- [ ] 测试绕过尝试

---

## 预期收益

- ✅ 防止CSRF攻击
- ✅ 保护用户操作安全
- ✅ 提升应用安全性

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引

---

**文档版本**: 1.1（代码级复审）  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27
