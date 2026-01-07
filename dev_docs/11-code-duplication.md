# 11. 代码重构 - 消除重复代码

**问题严重程度**: 🟢 低优先级  
**修复优先级**: 长期改进（持续）  
**依赖后端**: 否

---

## 问题概述

项目中存在多处代码重复，特别是base64Encode函数在多个文件中重复定义，违反DRY（Don't Repeat Yourself）原则，影响代码可维护性。

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
  - 代码维护困难
  - 一致性问题
  - 扩展性降低

---

## 修复方案

### 步骤 1: 创建编码工具

创建文件: `src/utils/encoding.js`

```javascript
export function base64Encode(str) {
  if (!str) return ''
  
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode('0x' + p1)
  )
  return btoa(utf8Bytes)
}

export function base64Decode(str) {
  if (!str) return ''
  
  return decodeURIComponent(
    atob(str).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  )
}

export function urlEncode(str) {
  return encodeURIComponent(str)
}

export function urlDecode(str) {
  return decodeURIComponent(str)
}

export function htmlEncode(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

export function htmlDecode(str) {
  const div = document.createElement('div')
  div.innerHTML = str
  return div.textContent
}
```

### 步骤 2: 替换重复代码

**替换前（DialogLogin.vue）:**

```javascript
const base64Encode = (str) => {
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode('0x' + p1)
  )
  return btoa(utf8Bytes)
}
```

**替换后:**

```javascript
import { base64Encode } from '@/utils/encoding'
```

### 步骤 3: 更新所有使用处

| 文件 | 替换内容 |
|------|---------|
| DialogLogin.vue | 内联base64Encode → 导入工具函数 |
| DialogRegister.vue | 内联base64Encode → 导入工具函数 |
| ResetPassword.vue | 内联base64Encode → 导入工具函数 |

---

## 重要补充说明

### 1. 常用工具函数清单

```javascript
// src/utils/index.js
export * from './encoding'
export * from './crypto'
export * from './sanitize'
export * from './errorHandler'
export * from './logger'
```

### 2. 组件复用模式

```javascript
// src/components/BaseDialog.vue
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    @closed="handleClosed"
  >
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>
```

### 3. 组合式函数复用

```javascript
// src/composables/useForm.js
import { ref, reactive } from 'vue'

export function useForm(options = {}) {
  const formRef = ref(null)
  const formData = reactive({})
  const rules = {}
  
  const validate = async () => {
    return new Promise((resolve, reject) => {
      formRef.value?.validate(valid => {
        valid ? resolve(true) : reject(new Error('Validation failed'))
      })
    })
  }
  
  const resetFields = () => {
    formRef.value?.resetFields()
  }
  
  return {
    formRef,
    formData,
    rules,
    validate,
    resetFields
  }
}
```

---

## 核查流程

### 1. 代码审查

- [ ] 识别所有重复代码
- [ ] 创建公共工具函数
- [ ] 更新所有使用处

### 2. 功能测试

- [ ] 验证功能一致性
- [ ] 测试边界情况
- [ ] 检查错误处理

### 3. 重构验证

- [ ] 确认代码量减少
- [ ] 验证可维护性提升
- [ ] 检查测试覆盖

---

## 预期收益

- ✅ 减少代码重复
- ✅ 提高可维护性
- ✅ 便于集中管理

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
