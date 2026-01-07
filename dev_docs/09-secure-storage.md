# 09. 安全存储方案 - 加密localStorage实现

**问题严重程度**: 🟡 中等  
**修复优先级**: 中期优化（1个月）  
**依赖后端**: 否

---

## 问题概述

项目使用localStorage存储敏感信息，包括Token、用户信息等，这些数据未加密，任何可以访问浏览器的用户都可以读取，存在信息泄露风险。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
d:\06_program_code\zibuyu_blog\src\content\DialogRegister.vue
d:\06_program_code\zibuyu_blog\src\stores\aiEnglish_demo.js
```

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - Token被盗用
  - 用户信息泄露
  - XSS攻击风险增加

---

## 修复方案

### 步骤 1: 安装加密库

```bash
npm install crypto-js
```

### 步骤 2: 创建安全存储工具

创建文件: `src/utils/secureStorage.js`

```javascript
import CryptoJS from 'crypto-js'

const STORAGE_KEY = 'app_secure_key'
const ENCRYPTION_ENABLED_KEY = 'encryption_enabled'

function getEncryptionKey() {
  let key = localStorage.getItem(STORAGE_KEY)
  if (!key) {
    key = generateSecureKey()
    localStorage.setItem(STORAGE_KEY, key)
  }
  return key
}

function generateSecureKey() {
  return CryptoJS.lib.WordArray.random(256 / 8).toString()
}

function isEncryptionEnabled() {
  return localStorage.getItem(ENCRYPTION_ENABLED_KEY) === 'true'
}

function enableEncryption() {
  localStorage.setItem(ENCRYPTION_ENABLED_KEY, 'true')
}

function disableEncryption() {
  localStorage.removeItem(ENCRYPTION_ENABLED_KEY)
}

export function encryptData(data) {
  if (!isEncryptionEnabled()) {
    return data
  }
  
  const key = getEncryptionKey()
  const iv = CryptoJS.lib.WordArray.random(128 / 8)
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  
  return iv.toString() + ':' + encrypted.toString()
}

export function decryptData(encryptedData) {
  if (!isEncryptionEnabled() || typeof encryptedData !== 'string') {
    return encryptedData
  }
  
  if (!encryptedData.includes(':')) {
    return encryptedData
  }
  
  try {
    const key = getEncryptionKey()
    const [ivHex, cipherText] = encryptedData.split(':')
    const iv = CryptoJS.enc.Hex.parse(ivHex)
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

export const secureStorage = {
  getItem(key) {
    const encryptedValue = localStorage.getItem(key)
    return decryptData(encryptedValue)
  },
  
  setItem(key, value) {
    const encryptedValue = encryptData(value)
    localStorage.setItem(key, encryptedValue)
  },
  
  removeItem(key) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  },
  
  enableEncryption() {
    enableEncryption()
    const existingData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== STORAGE_KEY && key !== ENCRYPTION_ENABLED_KEY) {
        const value = localStorage.getItem(key)
        if (value && !value.includes(':')) {
          existingData[key] = value
        }
      }
    }
    Object.entries(existingData).forEach(([key, value]) => {
      this.setItem(key, value)
    })
  },
  
  disableEncryption() {
    const existingData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== STORAGE_KEY && key !== ENCRYPTION_ENABLED_KEY) {
        const value = this.getItem(key)
        if (value !== null) {
          existingData[key] = value
        }
      }
    }
    disableEncryption()
    Object.entries(existingData).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
  }
}
```

### 步骤 3: 替换localStorage使用

**替换前：**

```javascript
localStorage.setItem('token', response.data.token)
const token = localStorage.getItem('token')
```

**替换后：**

```javascript
import { secureStorage } from '@/utils/secureStorage'

secureStorage.setItem('token', response.data.token)
const token = secureStorage.getItem('token')
```

### 步骤 4: 更新登录组件

```javascript
import { secureStorage } from '@/utils/secureStorage'

const handleLogin = async () => {
  try {
    const response = await login({
      username: base64Encode(loginInfo.username),
      password: base64Encode(loginInfo.password)
    })
    
    if (response.code === 200) {
      secureStorage.setItem('token', response.data.token)
      secureStorage.setItem('userInfo', response.data.user)
      secureStorage.enableEncryption()
      
      ElMessage.success('登录成功')
      dialogVisible.value = false
      fetchUserInfo()
    } else {
      ElMessage.error(response.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查网络连接')
  }
}
```

---

## 重要补充说明

### 1. 存储安全建议

- 敏感信息尽量存储在后端
- 使用HttpOnly Cookie存储Token
- 定期清理localStorage
- 敏感信息不在URL中传递

### 2. 加密密钥管理

```javascript
function rotateEncryptionKey() {
  const currentKey = getEncryptionKey()
  const existingData = {}
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = secureStorage.getItem(key)
    if (value !== null) {
      existingData[key] = value
    }
  }
  
  localStorage.removeItem(STORAGE_KEY)
  const newKey = generateSecureKey()
  localStorage.setItem(STORAGE_KEY, newKey)
  
  Object.entries(existingData).forEach(([key, value]) => {
    secureStorage.setItem(key, value)
  })
}
```

### 3. 安全存储清单

| 数据类型 | 是否应存储 | 加密建议 | 替代方案 |
|---------|----------|---------|---------|
| Access Token | 短期 | ✅ 必须加密 | HttpOnly Cookie |
| Refresh Token | 短期 | ✅ 必须加密 | HttpOnly Cookie |
| 用户信息 | 短期 | ✅ 建议加密 | 不存储敏感字段 |
| 偏好设置 | 长期 | ⚠️ 可选 | - |
| 缓存数据 | 短期 | ⚠️ 可选 | SessionStorage |

---

## 核查流程

### 1. 代码审查

- [ ] 替换所有localStorage调用
- [ ] 确认敏感信息已加密
- [ ] 检查密钥管理逻辑

### 2. 功能测试

- [ ] 测试存储读写功能
- [ ] 测试加密解密功能
- [ ] 测试数据迁移

### 3. 安全测试

- [ ] 验证加密效果
- [ ] 测试密钥泄露场景
- [ ] 检查解密失败处理

---

## 预期收益

- ✅ 保护敏感数据
- ✅ 降低XSS攻击影响
- ✅ 提升数据安全性

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
