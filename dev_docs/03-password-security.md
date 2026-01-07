# 03. 密码传输安全 - 加密方案实现

**问题严重程度**: 🔴 严重  
**修复优先级**: 第三优先级（需要后端配合）  
**依赖后端**: 是 - 需要后端配合解密

---

## 问题概述

项目中密码传输使用Base64编码，这并非加密方式，仅为编码格式，可被轻易解码。同时密码通过HTTP协议传输，存在被截获的风险。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
d:\06_program_code\zibuyu_blog\src\content\DialogRegister.vue
d:\06_program_code\zibuyu_blog\src\content\ResetPassword.vue
```

---

## 风险评估

- **风险等级**: 极高
- **潜在影响**:
  - 密码被截获
  - 账户被盗用
  - 用户隐私泄露

---

## ⚠️ 重要前提说明

在实施以下加密方案之前，请务必确保以下前提条件已满足：

1. **HTTPS优先原则**: 生产环境必须使用HTTPS协议传输所有数据。客户端加密无法替代传输层加密，HTTPS提供了端到端的安全保障，是密码传输安全的第一道防线。缺少HTTPS的加密方案形同虚设。

2. **密钥管理风险提示**: 前端加密的密钥同样面临泄露风险。任何存储在客户端的密钥都可以通过逆向工程手段获取。如有可能，建议在后端进行密码哈希处理（bcrypt、argon2），前端仅负责HTTPS加密传输。

---

## 修复方案

### 步骤 1: 安装加密库

```bash
npm install crypto-js jsencrypt
```

### 步骤 2: 创建加密工具

创建文件: `src/utils/crypto.js`

```javascript
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

const AES_KEY_LENGTH = 256
const IV_LENGTH = 16

function generateSecureKey() {
  return CryptoJS.lib.WordArray.random(IV_LENGTH).toString()
}

function generateIV() {
  return CryptoJS.lib.WordArray.random(IV_LENGTH)
}

export function encryptWithAES(data, key) {
  const iv = generateIV()
  const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(key), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return iv.toString() + ':' + encrypted.toString()
}

export function decryptWithAES(encryptedData, key) {
  const parts = encryptedData.split(':')
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format')
  }
  const [ivHex, cipherText] = parts
  const iv = CryptoJS.enc.Hex.parse(ivHex)
  const decrypted = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Hex.parse(key), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export function encryptWithRSA(data, publicKey) {
  const encryptor = new JSEncrypt({})
  encryptor.setPublicKey(publicKey)
  const encrypted = encryptor.encrypt(data)
  if (!encrypted) {
    throw new Error('RSA encryption failed')
  }
  return encrypted
}

export function validatePasswordStrength(password) {
  const result = {
    valid: true,
    score: 0,
    message: '',
    suggestions: []
  }
  
  if (!password) {
    result.valid = false
    result.message = '密码不能为空'
    return result
  }
  
  if (password.length < 6) {
    result.valid = false
    result.message = '密码长度至少6个字符'
    result.suggestions.push('建议使用12位以上的密码')
    return result
  }
  
  let score = 0
  const checks = [
    { condition: password.length >= 8, point: 1, tip: '长度良好' },
    { condition: password.length >= 12, point: 1, tip: '长度优秀' },
    { condition: /\d/.test(password), point: 1, tip: '包含数字' },
    { condition: /[a-z]/.test(password), point: 1, tip: '包含小写字母' },
    { condition: /[A-Z]/.test(password), point: 1, tip: '包含大写字母' },
    { condition: /[^a-zA-Z0-9]/.test(password), point: 1, tip: '包含特殊字符' }
  ]
  
  checks.forEach(check => {
    if (check.condition) {
      score += check.point
      result.suggestions.push(check.tip)
    }
  })
  
  result.score = score
  
  if (score < 3) {
    result.valid = false
    result.message = '密码强度较弱'
  } else if (score < 5) {
    result.message = '密码强度中等'
  } else {
    result.message = '密码强度良好'
  }
  
  return result
}

export function getEncryptionKey() {
  const key = localStorage.getItem('aes_key')
  if (!key) {
    const newKey = generateSecureKey()
    localStorage.setItem('aes_key', newKey)
    return newKey
  }
  return key
}
```

### 步骤 3: 更新登录组件

在 `DialogLogin.vue` 中使用新的加密方式：

```javascript
import { encryptWithAES, getEncryptionKey, validatePasswordStrength } from '@/utils/crypto'

const handleLogin = async () => {
  const passwordValidation = validatePasswordStrength(loginInfo.password)
  if (!passwordValidation.valid) {
    ElMessage.error(passwordValidation.message)
    return
  }
  
  try {
    const key = getEncryptionKey()
    const encryptedPassword = encryptWithAES(loginInfo.password, key)
    const encodedUsername = base64Encode(loginInfo.username)
    
    const response = await login({
      username: encodedUsername,
      password: encryptedPassword
    })
    
    if (response.code === 200) {
      ElMessage.success('登录成功')
      // 处理登录成功逻辑
    } else {
      ElMessage.error(response.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查网络连接')
    console.error('Login error:', error)
  }
}
```

### 步骤 4: 后端接口协调

**必须与后端确认的事项：**

| 项目 | 前端职责 | 后端职责 | 状态 |
|------|---------|---------|------|
| HTTPS配置 | 无 | ✅ 部署SSL证书，强制HTTPS | ⬜ 待确认 |
| 密码哈希 | 无 | ✅ 使用bcrypt/argon2处理密码 | ⬜ 待确认 |
| 加密方式 | 确认后端支持的加密方式 | 提供加密规范 | ⬜ 待确认 |
| 密钥管理 | 无 | ✅ 生成/存储/轮换密钥 | ⬜ 待确认 |

**如果后端支持前端加密（需与后端确认）：**

后端需要提供以下接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/encryption/public-key` | GET | 返回RSA公钥（如果有） |
| `/api/encryption/verify` | POST | 验证加密数据格式（如果有） |

**后端响应示例（如果支持前端加密）：**

```json
{
  "code": 200,
  "data": {
    "publicKey": "-----BEGIN PUBLIC KEY-----...",
    "algorithm": "RSA-OAEP-256",
    "maxEncryptSize": 446
  }
}
```

### ⚠️ 前端开发者任务清单

- [ ] 确认生产环境已启用HTTPS
- [ ] 与后端确认密码哈希方案（bcrypt/argon2）
- [ ] 如果后端不支持加密，移除前端加密代码
- [ ] 如果后端支持加密，确认公钥接口地址和算法
- [ ] 测试登录功能确保正常工作

---

## 重要补充说明

### 1. 推荐的安全方案优先级

- **第一优先级**: 确保使用HTTPS，这是最基本也是最有效的传输安全保障
- **第二优先级**: 后端使用bcrypt或argon2进行密码哈希，这是行业标准做法
- **第三优先级**: 前端加密作为额外保护层，但不能替代前两项

### 2. 前端加密的局限性

- 密钥硬编码在前端，任何人都可以获取并解密
- 无法防止中间人攻击
- 增加客户端计算负担

### 3. 如果无法使用HTTPS的应急方案

- 使用RSA非对称加密，公钥前置，私钥后端
- 每次请求使用不同的AES密钥
- 配合服务端时间戳验证防止重放攻击

### 4. 密钥轮换策略

- 定期更换AES密钥，建议每24小时更换一次
- 密钥泄露后立即更换所有历史密钥加密的数据

### 5. 密码强度要求

- 最小长度：8个字符
- 建议长度：12个字符以上
- 必须包含：大小写字母、数字、特殊字符中的至少两种

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有密码传输代码
- [ ] 确认不再使用Base64编码
- [ ] 验证加密工具正确实现

### 2. 功能测试

- [ ] 测试登录功能
- [ ] 测试注册功能
- [ ] 测试密码重置功能

### 3. 安全测试

- [ ] 抓包验证密码加密
- [ ] 测试中间人攻击防护

---

## 预期收益

- ✅ 保护用户密码安全
- ✅ 防止中间人攻击
- ✅ 提升账户安全性

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
