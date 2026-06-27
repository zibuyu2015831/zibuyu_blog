# 12. 输入验证加强 - 数据校验完善

**问题严重程度**: 🟢 低优先级  
**修复优先级**: 长期改进（持续）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟢 **成立（低优先级渐进改进）**
>
> - **属实**：登录/注册/改密**仅在提交函数内做手动空值与少量长度判断**，无统一规则、无实时校验。
> - **纠正**：表单虽用了 `<el-form :model="...">`，但**未绑定 `:rules` 也未持有 `ref` 调用 `validate()`**，故 Element Plus 的校验能力当前完全未启用。
> - **注意**：本项目注册/登录**没有邮箱字段**（用的是用户名 + 邀请码 / 授权码），原文档的 `validateEmail` 与真实表单不符，应替换为「邀请码/授权码 32 位」校验。


## 问题概述

各表单的校验逻辑分散写在提交函数里（`commitLogin`/`commitRegister`/`commitResetPassword`），以连续 `if (!xxx)` + `ElMessage` 的形式实现，存在三个问题：规则不统一、无法实时反馈、未利用 Element Plus 的 `el-form` 校验机制。

---

## 涉及文件路径

经逐文件 Read 核对，各表单现有校验如下：

```
src/content/DialogLogin.vue:89-104     commitLogin —— 仅判断 username/password 非空
src/content/DialogRegister.vue:37-73   commitRegister —— 非空、inviteCode 长度===32、username 长度≤50、两次密码一致
src/content/ResetPassword.vue:36-75    commitResetPassword —— 非空、authenticateCode 长度===32、两次密码一致
src/content/postSuggestion.vue:42-66   submitUserSuggestion —— 仅判断 note 非空（contact 选填）
src/content/InputBar.vue:62-85         聊天输入 —— 无校验（Enter 直接提交，允许空串）
```

**共性缺口**：
- 五个表单都用了 `<el-form :model="...">`，但**没有一个绑定 `:rules` 或通过 `formRef.validate()` 校验**——Element Plus 表单校验形同虚设。
- 无密码强度、用户名字符集等约束。
- 无实时（`blur`/`input`）反馈，错误只在点击提交后弹出。

> 真实字段说明：注册表单字段为 `username / password / again_password / inviteCode`（无 email）；改密表单为 `password / again_password / authenticateCode`。请勿照搬通用「邮箱校验」。

---

## 风险评估

- **风险等级**: 低
- **潜在影响**:
  - 数据完整性问题
  - 用户体验下降
  - 潜在安全风险

---

## 修复方案

推荐方案：**用 Element Plus `el-form` 自带的 `:rules` + `formRef.validate()` 收口**，而不是另起一套 `validate*` 工具函数。表单已经是 `el-form`，改造成本低、与现有 UI 一致，且能实时（`blur`）反馈。

### 步骤 1: 为登录表单接入 rules（以 `DialogLogin.vue` 为例）

当前 `commitLogin`（第 89-104 行）只手动判空。改为绑定 `ref` 与 `rules`：

```vue
<script setup>
import { ref, reactive } from "vue";
// ...原有 import 保持不变

const loginFormRef = ref(null);

const loginRules = reactive({
  username: [
    { required: true, message: "请填写用户名！", trigger: "blur" },
    { max: 50, message: "用户名太长了", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请填写登录密码！", trigger: "blur" },
  ],
});

async function commitLogin() {
  if (!loginFormRef.value) return;
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;
  // ...原有的 base64 编码与 fetch 逻辑保持不变
}
</script>

<template>
  <el-form
    ref="loginFormRef"
    :model="loginInfo"
    :rules="loginRules"
    :label-position="'top'"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="loginInfo.username" autofocus />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="loginInfo.password" type="password" show-password />
    </el-form-item>
  </el-form>
</template>
```

关键点：给每个 `<el-form-item>` 加 `prop`，并在 `el-form` 上加 `ref` + `:rules`，提交时 `await formRef.validate()`。

### 步骤 2: 注册表单（`DialogRegister.vue`）按真实字段写规则

字段为 `username / password / again_password / inviteCode`。把现有第 37-73 行的手动判断改为规则，其中「两次密码一致」「邀请码 32 位」用自定义校验器：

```javascript
const registerRules = reactive({
  username: [
    { required: true, message: "请填写用户名", trigger: "blur" },
    { max: 50, message: "用户名太长了", trigger: "blur" },
  ],
  password: [{ required: true, message: "请填写密码", trigger: "blur" }],
  again_password: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: (rule, value, cb) =>
        value === registerInfo.password
          ? cb()
          : cb(new Error("两次密码输入不一致，请检查")),
      trigger: "blur",
    },
  ],
  inviteCode: [
    { required: true, message: "请填写邀请码", trigger: "blur" },
    { len: 32, message: "【邀请码】格式错误，请检查", trigger: "blur" },
  ],
});
```

### 步骤 3: 改密表单（`ResetPassword.vue`）同理

字段为 `password / again_password / authenticateCode`，规则与注册表单类似，把 `inviteCode` 换成 `authenticateCode`（同样 `len: 32`），两次密码一致用自定义 `validator`。

### 步骤 4: 输入类组件补最小校验

- `postSuggestion.vue:42`：已判 `note` 非空，可补 `note` 长度上限（如 `max: 500`）避免超长提交。
- `InputBar.vue:62-85`：聊天发送当前允许空串。建议在 `Submit()` / `handleKeyDown` 提交前加 `if (!inputContent.value.trim()) return;`。

---

## 重要补充说明

### 1. 安全边界提醒（重要）

前端校验只为**用户体验**，不能替代后端校验。本项目用户名/密码经 `base64Encode` 后拼接发往 `/api/account/*`，真正的合法性、唯一性、强度策略**必须由后端兜底**。

### 2. 实时密码强度（可选增强）

如需密码强度条，可用 `computed` 基于 `password` 实时计算并配合 `el-progress` 展示，不必引入额外库。

### 3. 自定义校验器写法

Element Plus 规则支持 `validator(rule, value, callback)`：校验通过调 `callback()`，失败调 `callback(new Error('提示'))`。上文「两次密码一致」即用此方式，无需另写工具函数。

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

---

**文档版本**: 1.1  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27（代码级复审）
