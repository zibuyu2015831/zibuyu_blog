# 12. 输入验证加强 - 数据校验完善

**问题严重程度**: 🟢 低优先级  
**修复优先级**: 长期改进（持续）  
**依赖后端**: 否

---

## 问题概述

项目用户输入验证不充分，可能导致异常行为或潜在安全问题。需要在客户端进行更严格的输入验证，提升数据完整性和用户体验。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
d:\06_program_code\zibuyu_blog\src\content\DialogRegister.vue
d:\06_program_code\zibuyu_blog\src\content\ResetPassword.vue
```

---

## 风险评估

- **风险等级**: 低
- **潜在影响**:
  - 数据完整性问题
  - 用户体验下降
  - 潜在安全风险

---

## 修复方案

### 步骤 1: 创建验证工具

创建文件: `src/utils/validation.js`

```javascript
export function validateUsername(username) {
  if (!username || username.trim() === '') {
    return { valid: false, message: '用户名不能为空' }
  }
  
  const length = username.length
  if (length < 3 || length > 50) {
    return { valid: false, message: '用户名长度应在3-50个字符之间' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }
  
  if (/^[0-9]/.test(username)) {
    return { valid: false, message: '用户名不能以数字开头' }
  }
  
  return { valid: true }
}

export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: '邮箱不能为空' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '邮箱格式不正确' }
  }
  
  if (email.length > 100) {
    return { valid: false, message: '邮箱长度不能超过100个字符' }
  }
  
  return { valid: true }
}

export function validatePassword(password) {
  if (!password || password === '') {
    return { valid: false, message: '密码不能为空' }
  }
  
  const length = password.length
  if (length < 6 || length > 50) {
    return { valid: false, message: '密码长度应在6-50个字符之间' }
  }
  
  const checks = [
    { regex: /[a-z]/, message: '密码必须包含小写字母' },
    { regex: /[A-Z]/, message: '密码必须包含大写字母' },
    { regex: /[0-9]/, message: '密码必须包含数字' },
    { regex: /[^a-zA-Z0-9]/, message: '密码必须包含特殊字符' }
  ]
  
  const failedChecks = checks.filter(check => !check.regex.test(password))
  
  if (failedChecks.length > 0) {
    return { valid: false, message: failedChecks[0].message }
  }
  
  return { valid: true }
}

export function validateConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  return { valid: true }
}

export function validateForm(formData, rules) {
  const errors = {}
  let isValid = true
  
  Object.entries(rules).forEach(([field, validateFn]) => {
    const result = validateFn(formData[field])
    if (!result.valid) {
      errors[field] = result.message
      isValid = false
    }
  })
  
  return { valid: isValid, errors }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}
```

### 步骤 2: 更新登录组件

```vue
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { validateUsername, validatePassword } from '@/utils/validation'
import useAiEnglish from '@/stores/aiEnglish';

const loginInfo = ref({
  username: '',
  password: ''
})

const validateLoginForm = () => {
  const usernameResult = validateUsername(loginInfo.value.username)
  if (!usernameResult.valid) {
    ElMessage.error(usernameResult.message)
    return false
  }
  
  const passwordResult = validatePassword(loginInfo.value.password)
  if (!passwordResult.valid) {
    ElMessage.error(passwordResult.message)
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validateLoginForm()) {
    return
  }
  
  try {
    const response = await login({
      username: base64Encode(loginInfo.value.username),
      password: base64Encode(loginInfo.value.password)
    })
    
    if (response.code === 200) {
      ElMessage.success('登录成功')
      dialogVisible.value = false
      fetchUserInfo()
    } else {
      ElMessage.error(response.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查网络连接')
    console.error('Login error:', error)
  }
}
</script>
```

### 步骤 3: 更新注册组件

```vue
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validation'

const registerInfo = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateRegisterForm = () => {
  const usernameResult = validateUsername(registerInfo.value.username)
  if (!usernameResult.valid) {
    ElMessage.error(usernameResult.message)
    return false
  }
  
  const emailResult = validateEmail(registerInfo.value.email)
  if (!emailResult.valid) {
    ElMessage.error(emailResult.message)
    return false
  }
  
  const passwordResult = validatePassword(registerInfo.value.password)
  if (!passwordResult.valid) {
    ElMessage.error(passwordResult.message)
    return false
  }
  
  const confirmResult = validateConfirmPassword(
    registerInfo.value.password,
    registerInfo.value.confirmPassword
  )
  if (!confirmResult.valid) {
    ElMessage.error(confirmResult.message)
    return false
  }
  
  return true
}
</script>
```

---

## 重要补充说明

### 1. 实时验证

```javascript
import { computed } from 'vue'
import { validatePassword } from '@/utils/validation'

const password = ref('')
const passwordValidation = computed(() => validatePassword(password.value))

const passwordStrength = computed(() => {
  const result = validatePassword(password.value)
  if (!result.valid) return 'weak'
  if (password.value.length >= 12) return 'strong'
  return 'medium'
})
```

### 2. 表单验证规则

```javascript
export const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在3-50个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在6-50个字符之间', trigger: 'blur' }
  ]
}
```

### 3. 自定义验证器

```javascript
export function createValidator(rules) {
  return (value, callback) => {
    for (const rule of rules) {
      const result = rule.test(value)
      if (!result.valid) {
        callback(new Error(result.message))
        return
      }
    }
    callback()
  }
}
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有用户输入
- [ ] 确认验证规则完整
- [ ] 验证错误提示

### 2. 功能测试

- [ ] 测试有效输入
- [ ] 测试无效输入
- [ ] 测试边界情况

### 3. 安全测试

- [ ] 测试注入防护
- [ ] 测试特殊字符处理
- [ ] 测试长度边界

---

## 预期收益

- ✅ 提高数据完整性
- ✅ 防止异常输入
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
