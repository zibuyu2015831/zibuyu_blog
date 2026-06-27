# 11. 代码重构 - 消除重复代码

**问题严重程度**: 🟢 低优先级  
**修复优先级**: 长期改进（持续）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟢 **完全成立（推荐优先实施）**
>
> - **属实**：`base64Encode` 在 `DialogLogin.vue:43`、`DialogRegister.vue:17`、`ResetPassword.vue:17` **三处逐字重复定义**，行号、函数体均经源码核对一致。
> - **追加发现**：`src/server/serverRequest.js` 与 `src/server/customizedChat copy.js` 是**几乎逐行相同**的 `MyRequest` 类；`deviceInfo.js` 中存在重复的「屏宽 < 500」判断逻辑。
> - **结论**：抽取 `base64Encode` 到 `src/utils/encoding.js` 是**低风险、高收益**的重构，建议优先落地；server 层重复建议合并；屏宽常量重复可顺带收敛。


## 问题概述

项目中存在多处代码重复，违反 DRY（Don't Repeat Yourself）原则，影响可维护性。最典型的是 `base64Encode` 函数在三个登录相关组件中**逐字复制**：一旦编码逻辑需要调整（如换用原生 `TextEncoder`），需同步修改 3 处，极易遗漏。此外 server 请求层与设备屏宽判断也存在重复。

---

## 涉及文件路径

经逐文件 Read 核对，重复点如下：

### 重复点 1：`base64Encode`（强证据，推荐优先处理）

```
src/content/DialogLogin.vue:43-53     function base64Encode(str) { ... }
src/content/DialogRegister.vue:17-27  function base64Encode(str) { ... }
src/content/ResetPassword.vue:17-27   function base64Encode(str) { ... }
```

三处函数体完全一致：

```javascript
function base64Encode(str) {
  // 将字符串转换为UTF-8编码的二进制数据
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    function (match, p1) {
      return String.fromCharCode("0x" + p1);
    }
  );
  // 使用btoa进行Base64编码
  return btoa(utf8Bytes);
}
```

调用位置：
- `DialogLogin.vue:107-108`（`encodedUsername` / `encodedPassword`）
- `DialogRegister.vue:76-77`
- `ResetPassword.vue:77`（仅对密码编码）

### 重复点 2：axios 请求封装类（追加发现）

```
src/server/serverRequest.js          class MyRequest（含 JSON 校验 + code===3001 限流提示）
src/server/customizedChat copy.js    class MyRequest（与上者几乎逐行相同，仅缺第 2 行的 useAiEnglish 导入）
src/server/defaultChat.js            class ChatRequest（精简变体：withCredentials、无 JSON 校验、仅 post）
```

`serverRequest.js` 与 `customizedChat copy.js` 的 `request/get/post` 方法体完全一致，属应删除的复制残留（文件名带 "copy" 也印证了这一点）。

### 重复点 3：设备屏宽判断（追加发现）

```
src/stores/deviceInfo.js:69-75   dialogWidth         —— userScreenWidth < 500
src/stores/deviceInfo.js:77-79   isEnglishButtonSmall —— userScreenWidth <= 500
src/stores/deviceInfo.js:138-140 isPaginationmall    —— userScreenWidth < 500
```

「500」「880」「1300」「1400」「1650」等阈值散落在多个 getter 中（魔法数字），无统一常量。

---

## 风险评估

- **风险等级**: 低
- **潜在影响**:
  - 代码维护困难
  - 一致性问题
  - 扩展性降低

---

## 修复方案

### 步骤 1（推荐优先）: 抽取 `base64Encode` 到公共工具

新建 `src/utils/encoding.js`，保持与现有实现**逐字一致**的逻辑（避免行为变化）：

```javascript
// src/utils/encoding.js

/**
 * 将字符串按 UTF-8 编码后做 Base64 编码（与登录/注册/改密原内联实现一致）
 * @param {string} str
 * @returns {string}
 */
export function base64Encode(str) {
  // 将字符串转换为UTF-8编码的二进制数据
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    function (match, p1) {
      return String.fromCharCode("0x" + p1);
    }
  );
  // 使用btoa进行Base64编码
  return btoa(utf8Bytes);
}
```

> 注意：原实现未对空串/非字符串做防御，此处保持原样以确保后端收到的报文不变；如需加 `if (!str) return ''` 等防御，应作为独立改动并配合联调。

### 步骤 2: 三个组件改为导入

各文件删除内联的 `base64Encode` 定义，并在 `<script setup>` 顶部新增导入：

| 文件 | 删除 | 新增导入 |
|------|------|---------|
| `src/content/DialogLogin.vue` | 第 43-53 行内联定义 | `import { base64Encode } from "@/utils/encoding";` |
| `src/content/DialogRegister.vue` | 第 17-27 行内联定义 | `import { base64Encode } from "@/utils/encoding";` |
| `src/content/ResetPassword.vue` | 第 17-27 行内联定义 | `import { base64Encode } from "@/utils/encoding";` |

调用处（`DialogLogin.vue:107-108`、`DialogRegister.vue:76-77`、`ResetPassword.vue:77`）无需改动，函数名不变。

### 步骤 3: 验证报文不变

`base64Encode` 的输出直接拼进登录/注册/改密请求体（如 `${encodedUsername}${splitChar}${encodedPassword}`）。重构后务必：
- 用同一组用户名/密码对比重构前后请求体字符串是否完全一致；
- 跑通登录、注册、改密三条链路。

### 步骤 4（可选）: 合并 server 层重复

- 删除 `src/server/customizedChat copy.js`（与 `serverRequest.js` 重复的复制残留），确认无 import 引用后移除。
- 若 `defaultChat.js`（`ChatRequest`，带 `withCredentials`）与 `serverRequest.js`（`MyRequest`，带 JSON 校验与 `code===3001` 限流提示）需共存，可让二者继承同一基类，仅在子类覆盖差异点（`withCredentials`、响应校验）。

### 步骤 5（可选）: 收敛屏宽魔法数字

在 `deviceInfo.js` 的 `state` 中已有 `ScreenWidthLimit: 880`。可补充其余阈值常量，供各 getter 复用，消除 `dialogWidth`/`isEnglishButtonSmall`/`isPaginationmall` 中重复的「500」判断：

```javascript
// state 内追加
breakpoints: { dialogFull: 500, hideArticleImg: 1300, articleRight: 1400, bigScreen: 1650 },
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

---

**文档版本**: 1.1  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27（代码级复审）
