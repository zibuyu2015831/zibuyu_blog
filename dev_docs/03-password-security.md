# 03. 密码传输安全 - 加密方案实现

**问题严重程度**: 🟡 中（取决于生产是否已启用 HTTPS，详见复审结论）  
**修复优先级**: 第三优先级（需要后端配合）  
**依赖后端**: 是 - 真正的安全保障在后端（HTTPS + 哈希）

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟡 **观察成立，但首选方案需调整**
>
> - **属实**：登录/注册/改密确实仅用各文件内自带的 `base64Encode`（`btoa` 包装，编码≠加密）。逐文件核对：
>   - `DialogLogin.vue:43` 定义 `base64Encode`；`:107-108` `base64Encode(loginInfo.username/password)`，再用 `generateRandomString(10)` 生成随机分隔符（`:106`），按 `isDigitOdd` 结果拼成 `用户名+分隔符+密码` 或反序（`:113-117`）。
>   - `DialogRegister.vue:17` 定义；`:76-77` 同样 base64 编码用户名/密码。
>   - `ResetPassword.vue:17` 定义；`:77` `base64Encode(userInfo.password)`，POST 到 `/api/account/reset_pwd/`（`:86`）。
> - **纠正**：原文“首选”的「前端 AES，密钥存 `localStorage`」属**安全表演**——`getEncryptionKey()` 把密钥写进 `localStorage`，与密文同处，攻击者可同时读到密钥和密文，等于没加密。原文末尾「局限性」已自认这一点。
> - **补充**：随机分隔符 + base64 拼接只是**轻度混淆**，不是加密，任何人 base64 解码即得明文密码。
> - **结论**：正确优先级为 **① 全站 HTTPS → ② 后端 bcrypt/argon2 哈希**；前端加密不可替代前两者。严重度取决于生产环境是否已启用 HTTPS（已启用则为低-中，未启用则为高）。


## 问题概述

项目中密码传输使用Base64编码，这并非加密方式，仅为编码格式，可被轻易解码。同时密码通过HTTP协议传输，存在被截获的风险。

---

## 涉及文件路径

```
src/content/DialogLogin.vue:43,107-108     # base64Encode 定义 + 登录密码编码
src/content/DialogRegister.vue:17,76-77    # base64Encode 定义 + 注册密码编码
src/content/ResetPassword.vue:17,77        # base64Encode 定义 + 改密密码编码
```

> 三个文件各自**重复定义**了一份完全相同的 `base64Encode`（`btoa` + UTF-8 处理），存在代码重复（参见 11-code-duplication.md）。`btoa` 是 Base64 编码，可逆，**不是加密**。

---

## 风险评估

- **风险等级**: 中（前提：生产环境若已启用 HTTPS，则 base64 明文在传输层已被 TLS 保护，风险降为低；若仍走 HTTP，则为高）
- **当前真实行为**:
  - 密码经 `base64Encode`（`btoa`）编码后，与用户名按随机分隔符拼接（登录/注册）或单独编码（改密）发送，**全程可逆，等同明文**。
  - 是否安全完全取决于**传输层是否为 HTTPS** 与**后端是否做哈希存储**。
- **潜在影响**:
  - 若传输为 HTTP，密码可被中间人 base64 解码后直接获取。
  - 若后端明文/可逆存储密码，数据库泄露即等于密码泄露。

---

## ⚠️ 重要前提说明

在实施以下加密方案之前，请务必确保以下前提条件已满足：

1. **HTTPS优先原则**: 生产环境必须使用HTTPS协议传输所有数据。客户端加密无法替代传输层加密，HTTPS提供了端到端的安全保障，是密码传输安全的第一道防线。缺少HTTPS的加密方案形同虚设。

2. **密钥管理风险提示**: 前端加密的密钥同样面临泄露风险。任何存储在客户端的密钥都可以通过逆向工程手段获取。如有可能，建议在后端进行密码哈希处理（bcrypt、argon2），前端仅负责HTTPS加密传输。

---

## 修复方案

> **正确优先级（务必按此顺序）：**
> 1. **全站强制 HTTPS**（后端 / 部署层）——这是密码传输安全的根本，能覆盖本文绝大部分风险。
> 2. **后端 bcrypt / argon2 哈希存储**——杜绝可逆存储。
> 3. **（可选）前端 RSA 公钥加密**——仅当确有“防止运维/日志侧看到明文”这类额外诉求，且后端提供公钥时才做。
>
> ⚠️ **不要采用「前端 AES + 密钥存 localStorage」方案**：密钥与密文同处客户端，可被一并读取，属于安全表演（本文步骤 2 的 `getEncryptionKey()`/`localStorage` 写法即为反例，仅作演示，**不建议落地**）。

### 步骤 0（首选，最重要）: 确认 HTTPS 与后端哈希

- 与运维/后端确认生产环境已部署 SSL 证书并将 HTTP 强制跳转 HTTPS。
- 与后端确认登录/注册接口对收到的密码使用 bcrypt 或 argon2 哈希后存储。
- 完成这两点后，本文后续“前端加密”步骤即非必需。前端可保留现有 `base64Encode`（或直接发送明文由 HTTPS 保护），重点应放在后端。

### 步骤 1: （仅在确需前端加密时）安装加密库

```bash
npm install crypto-js jsencrypt
```

### 步骤 2: （演示/可选）创建加密工具

> 以下 `crypto.js` 仅作参考。其中 `getEncryptionKey()` 把 AES 密钥写入 `localStorage`，**是反例**，落地时应改为后端下发的 RSA **公钥**加密（私钥仅后端持有），不要使用对称密钥本地存储方案。

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

### 步骤 3: 与真实代码对齐（DialogLogin.vue 的 `commitLogin`）

本仓库登录逻辑在 `src/content/DialogLogin.vue` 的 `commitLogin()`（第 89 行起）。当前实现：

```javascript
// DialogLogin.vue:106-117（现状）
const splitChar = generateRandomString(10);
const encodedUsername = base64Encode(loginInfo.username);
const encodedPassword = base64Encode(loginInfo.password);

const user_data = ref("");
const check_result = isDigitOdd(splitChar);
if (check_result) {
  user_data.value = `${encodedUsername}${splitChar}${encodedPassword}`;
} else {
  user_data.value = `${encodedPassword}${splitChar}${encodedUsername}`;
}
```

**推荐做法（在 HTTPS 已就绪的前提下）：** 不必引入前端加密，保持现有 `base64Encode` 拼接逻辑即可，安全由 TLS + 后端哈希保证。若要前端做密码强度校验，可在 `commitLogin` 的 `if (!loginInfo.password)` 校验（第 98-104 行）之后插入 `validatePasswordStrength(loginInfo.password)`。

**若后端确认支持 RSA 公钥加密：** 仅把 `encodedPassword` 改为对密码做一次 RSA 公钥加密（`encryptWithRSA(loginInfo.password, publicKey)`，公钥从后端接口拉取），再按现有 `splitChar` 拼接规则组装 `user_data`，**不要**使用 `getEncryptionKey()`/`encryptWithAES`（本地密钥方案）。`DialogRegister.vue:76-77`、`ResetPassword.vue:77` 同理调整。

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

---

**文档版本**: 1.1（代码级复审）  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27
