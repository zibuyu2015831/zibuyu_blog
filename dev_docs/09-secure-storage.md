# 09. 安全存储方案 - 加密localStorage实现

**问题严重程度**: 🟡 中等  
**修复优先级**: 中期优化（1个月）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟡 **价值有限（不建议前端加密）**
>
> - **纠正**：对 localStorage 加密、而密钥又存于 localStorage / JS bundle，属**安全表演（security theater）**，无法抵御 XSS——能执行脚本的攻击者既能读密文也能读密钥。
> - **结论**：正解是敏感凭证改用 **HttpOnly + Secure Cookie**（需后端配合）。前端加密存储不应作为主方案，本项目内低优先级。


## 问题概述

项目使用 localStorage 明文存储 JWT Token。任何可执行 JS 的代码（含 XSS 注入脚本）都能读取该 Token 并冒用身份。原文档建议的「前端 AES 加密 localStorage」无法解决此问题，因为解密密钥同样暴露在前端，故本文将重点放在**真正有效的缓解措施**上。

---

## 涉及文件路径

经 `grep "localStorage"` 全量核对，真实读写点如下：

### Token 存取（核心敏感数据）

```
src/content/DialogLogin.vue:155      localStorage.setItem('token', data.token)   // 登录成功后明文写入
src/stores/userInfo.js:46-47         localStorage.getItem('token')                // 启动时读取并解析 JWT
src/stores/userInfo.js:33,58         localStorage.removeItem('token')             // 过期/失效时清除
src/utils/logout.js:29               localStorage.removeItem('token')             // 退出登录时清除
```

JWT 的 payload 在 `userInfo.js:28、54` 处通过 `atob(parts[1])` 解析 `exp` 判断是否过期——说明 Token 是标准 JWT，且前端能完整读取其内容。

### 带过期时间的通用封装（非敏感）

```
src/utils/uselocalStorage.js         setLocalStorageWithExpiration / getLocalStorageValueWithExpiration
src/App.vue:5、83                     读取主题 webTheme
src/plugins/themePlugin.js:3          写入主题 webTheme
```

此封装仅用于主题等非敏感偏好，无需加密。

### AI 英语自定义信息（业务数据，非凭证）

```
src/components/AiEnglishCommonAssistant.vue:73、75、122   读写 customized_infos
```

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - Token 被 XSS 脚本读取后冒用身份
  - 第三方依赖被投毒时可批量窃取 Token
- **加密无效说明**: 若引入「前端加密 localStorage」，密钥必然在 JS 运行时可得，XSS 同样能拿到，故**不降低**上述风险，只增加复杂度与误判安全的风险。

---

## 修复方案

> 核心原则：**不要试图在前端加密 Token**。下面按「投入产出比」从高到低排列。

### 方案 A（推荐，需后端配合）: 改用 HttpOnly + Secure Cookie 存放 Token

最彻底的方案。由后端在登录响应中下发 `Set-Cookie`，使 JS 无法读取 Token：

```
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=...
```

前端相应改动（本仓库已有部分基础）：
- `src/server/defaultChat.js:12` 已设置 `withCredentials: true`；可将该配置推广到 `serverRequest.js`，使所有请求自动携带 Cookie。
- 移除 `DialogLogin.vue:155` 的 `localStorage.setItem('token', ...)`；登录成功后仅在内存（Pinia `userInfo` store）保留登录态标志，Token 不再由前端持有。
- `userInfo.js` 的 `loadTokenFromLocalStorage()`、`token` getter 中对 `localStorage` 的依赖随之下线，改为「调用 `/api/account/me` 之类接口校验会话」。

> 说明：此方案依赖后端改造，属跨端协作项；在后端就绪前不要单方面删除前端逻辑。

### 方案 B（前端可独立做，降低暴露面）: 缩小 localStorage 中的敏感数据

在 Cookie 方案落地前的过渡措施：
- 不在 localStorage 中额外存放用户敏感字段（当前仅存 `token`，已较克制，保持现状即可，不要扩大）。
- 退出登录、Token 过期时确保彻底清除——核对 `logout.js:29`、`userInfo.js:33,58` 均已 `removeItem('token')`，逻辑完整。
- AI 英语 `customized_infos`（`AiEnglishCommonAssistant.vue`）属业务数据非凭证，可继续明文存储。

### 方案 C（治本，配合方案 A）: 防住 XSS 才能真正保护 Token

无论 Token 存在哪里，XSS 都是根因。重点：
- 文章正文走 `marked` 渲染并 `innerHTML` 注入（见 `Article.vue`），需确认有 XSS 过滤/白名单（参见输入与渲染安全相关文档）。
- 配置严格的 CSP 响应头，限制可执行脚本来源。

### ❌ 不推荐: 前端加密 localStorage

原文档建议的 `src/utils/secureStorage.js`（AES + 密钥存 localStorage）**不要实施**：密钥与密文同处前端，XSS 可同时读取两者，未降低任何风险，反而增加维护成本与「已加密=已安全」的误判。

---

## 重要补充说明

### 1. 存储安全建议

- 敏感凭证优先交由后端，通过 HttpOnly Cookie 下发（方案 A）
- localStorage 仅存非敏感数据（主题、UI 偏好、业务草稿）
- 登出/过期务必清除 Token（本仓库已实现）
- 敏感信息不在 URL 中传递

### 2. 为什么前端加密无效（一句话）

> 加密密钥若能被前端 JS 读到，就同样能被注入页面的 XSS 脚本读到——这等于把保险柜钥匙贴在保险柜上。

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

---

**文档版本**: 1.1  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27（代码级复审）
