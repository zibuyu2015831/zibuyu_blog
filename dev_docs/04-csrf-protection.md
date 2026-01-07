# 04. CSRF防护 - 跨站请求伪造保护

**问题严重程度**: 🔴 严重  
**修复优先级**: 第三优先级（需要后端配合）  
**依赖后端**: 是 - 需要后端提供token接口

---

## 问题概述

项目目前缺乏CSRF（Cross-Site Request Forgery，跨站请求伪造）保护机制，攻击者可以诱导已登录用户在不知情的情况下执行非授权操作。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\server\serverRequest.js
d:\06_program_code\zibuyu_blog\src\server\defaultChat.js
```

---

## 风险评估

- **风险等级**: 高
- **潜在影响**:
  - 账户被恶意操作
  - 数据被篡改
  - 执行未授权的请求

---

## 修复方案

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

### 步骤 3: 更新 serverRequest.js

```javascript
import axios from 'axios'
import { setupCsrfInterceptor } from '@/utils/csrfInterceptor'
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
    
    setupCsrfInterceptor(this.instance)
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
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
