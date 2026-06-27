# 前端安全优化方案文档

本文档是项目前端安全优化方案的总览索引，将完整的安全审计报告拆分为13个独立的优化点，便于逐个查阅和实施。

## 📋 优化点列表

> 📌 **复审说明（2026-06-27）**：下表「优先级」一列已根据真实源码核查结果修正，与各文档顶部的「🔍 复审结论」一致。原索引中 07–13 的文件名有误，已对齐到磁盘实际文件。

| 编号 | 优化点 | 原定级 | 复审后优先级 | 文件 |
|-----|--------|--------|------|------|
| 01 | 敏感信息管理 | 🔴 高 | 🟡 中（占位符非真实密钥，按工程规范处理） | [01-sensitive-info.md](./01-sensitive-info.md) |
| 02 | XSS攻击防护 | 🔴 高 | 🟠 中-高（AI 回复渲染处优先） | [02-xss-protection.md](./02-xss-protection.md) |
| 03 | 密码传输安全 | 🔴 高 | 🟠 中-高（依赖 HTTPS+后端哈希，非前端加密） | [03-password-security.md](./03-password-security.md) |
| 04 | CSRF攻击防护 | 🔴 高 | 🟢 低（Bearer 头鉴权天然较少受 CSRF 影响） | [04-csrf-protection.md](./04-csrf-protection.md) |
| 05 | 内存泄漏修复 | 🟡 中 | 🟡 中（文件清单已重写：Footer/Header/About/Test） | [05-memory-leak.md](./05-memory-leak.md) |
| 06 | Token 过期处理 | 🟡 中 | 🟡 中（依赖后端 refresh 接口） | [06-token-expiry.md](./06-token-expiry.md) |
| 07 | 错误处理改进 | 🟡 中 | 🟢 推荐（统一封装，低风险） | [07-error-handling.md](./07-error-handling.md) |
| 08 | 调试代码清理 | 🔴 高 | 🟢 推荐（注意需安装 terser） | [08-debug-code.md](./08-debug-code.md) |
| 09 | 安全存储方案 | 🟢 低 | ⚪ 不建议（前端加密属安全表演） | [09-secure-storage.md](./09-secure-storage.md) |
| 10 | 性能优化 | 🟢 低 | 🟢 低（按需选用） | [10-performance.md](./10-performance.md) |
| 11 | 代码重构（去重） | 🟢 低 | ✅ 优先（低风险高收益） | [11-code-duplication.md](./11-code-duplication.md) |
| 12 | 输入验证加强 | 🟡 中 | 🟢 低（渐进改进） | [12-input-validation.md](./12-input-validation.md) |
| 13 | 响应式设计优化 | 🟢 低 | ⚪ 谨慎（原方案有 CSS 语法错误与架构错配） | [13-responsive-design.md](./13-responsive-design.md) |

## 🚀 快速开始

### 环境准备

```bash
# 1. 克隆项目并切换到项目目录
cd zibuyu_blog

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 复制示例环境变量文件并修改
cp .env.example .env.local
```

### 实施顺序建议（已按复审结论重排）

**第一阶段：低风险高收益，建议先做**

1. [11-code-duplication.md](./11-code-duplication.md) - 抽取重复的 `base64Encode` 到 `utils/encoding.js`
2. [08-debug-code.md](./08-debug-code.md) - 生产构建移除 console（注意需安装 `terser`）
3. [07-error-handling.md](./07-error-handling.md) - 统一错误处理封装
4. [01-sensitive-info.md](./01-sensitive-info.md) - 接口地址改为环境变量（工程规范）

**第二阶段：安全加固（部分依赖后端/HTTPS）**

5. [02-xss-protection.md](./02-xss-protection.md) - 对 `v-html`（尤其 AI 回复）做 DOMPurify 净化
6. [03-password-security.md](./03-password-security.md) - 确认 HTTPS + 后端哈希（前端加密非首选）
7. [06-token-expiry.md](./06-token-expiry.md) - Token 续期（需后端 refresh 接口）
8. [12-input-validation.md](./12-input-validation.md) - 完善表单输入校验

**第三阶段：按需/谨慎**

9. [05-memory-leak.md](./05-memory-leak.md) - 清理 Footer/Header/About/Test 的 `setInterval`
10. [10-performance.md](./10-performance.md) - 防抖节流 / 懒加载（按需）
11. [04-csrf-protection.md](./04-csrf-protection.md) - ⚠️ 当前 Bearer 头鉴权，优先级低
12. [09-secure-storage.md](./09-secure-storage.md) - ⚠️ 不建议前端加密存储
13. [13-responsive-design.md](./13-responsive-design.md) - ⚠️ 原方案有 CSS 语法错误，谨慎

## 📁 文档结构说明

### 文档模板

每个优化点文档包含以下结构：

1. **问题描述** - 详细说明当前存在的安全风险
2. **影响范围** - 明确受影响的组件和功能
3. **解决方案** - 提供具体的技术实现方案
4. **代码示例** - 包含可复用的代码片段
5. **实施步骤** - 详细的操作指南
6. **验证方法** - 如何验证修复是否成功
7. **注意事项** - 实施过程中需要关注的风险点

### 依赖关系

部分优化点之间存在依赖关系，实施时请注意：

```
01-sensitive-info.md (环境变量配置)
    │
    └──► 06-token-expiry.md / 02-xss-protection.md 共用 API 基础地址配置

11-code-duplication.md (utils/encoding.js)
    │
    └──► 03-password-security.md / 12-input-validation.md 复用编码与校验工具

07-error-handling.md (统一错误处理)
    │
    └──► 06-token-expiry.md 的 401 处理复用同一错误通道
```

## 🔧 配套工具文件

> 📌 **复审说明（2026-06-27）**：下表已按真实代码复审结论调整。✅ 为推荐新建、与现网代码直接对接的工具；⚠️ 为原方案建议、但复审认定价值有限或属「安全表演」的工具（仅在后端方案确定后按需创建，切勿作为主要安全手段）。

| 文件路径 | 用途 | 相关优化点 | 复审建议 |
|---------|------|-----------|---------|
| `src/utils/encoding.js` | 抽取重复的 `base64Encode` | 11 代码去重 | ✅ 优先（三处重复，低风险高收益） |
| `src/utils/errorHandler.js` | 统一错误处理 | 07 错误处理 | ✅ 推荐 |
| `src/utils/sanitize.js` | HTML 净化（DOMPurify 封装） | 02 XSS 防护 | ✅ 推荐（重点用于 AI 回复渲染处） |
| `src/utils/crypto.js` | 加密解密工具 | 03 密码传输 | ⚠️ 不首选（应依赖 HTTPS + 后端哈希） |
| `src/utils/secureStorage.js` | 安全存储封装 | 09 缓存安全 | ⚠️ 不建议（密钥存前端 = 安全表演） |
| `src/utils/csrf.js` / `csrfInterceptor.js` | CSRF token 管理 | 04 CSRF 防护 | ⚠️ 暂不需要（当前 Bearer 头鉴权） |

## 🧪 测试验证

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 运行代码规范检查与自动修复
npm run lint
```

### 安全测试要点

1. **敏感信息检查**
   ```bash
   # 使用grep搜索可能的硬编码敏感信息
   grep -r "password\|secret\|key" src/ --include="*.js" --include="*.vue"
   ```

2. **XSS防护测试**
   ```javascript
   // 测试用例
   const maliciousInput = '<img src=x onerror=alert(1)>'
   sanitizeHtml(maliciousInput) // 应返回安全的HTML
   ```

3. **HTTPS配置检查**
   ```javascript
   // 确保所有API请求都使用HTTPS
   console.log(import.meta.env.VITE_API_BASE_URL) // 应以 https:// 开头
   ```

## 📝 实施检查清单

> 已按复审结论调整：✅ 推荐项；⚠️ 复审认定不首选/不需要的项；路由懒加载经核查**已实现**，故移出待办。

> ✅ 标记项已于 2026-06-27 在分支 `fix/dev-docs-optimizations` 实施完成，详见下方「📌 实施状态」。

**优先（低风险高收益）**
- [x] 抽取重复的 `base64Encode` 到 `src/utils/encoding.js`（11）
- [x] 生产构建移除 `console`（08，采用 esbuild `drop`，无需 terser）
- [x] 统一错误处理 `src/utils/errorHandler.js`（07）
- [x] 接口地址改为环境变量；删除整个死代码目录 `src/server/`（含 `customizedChat copy.js`）（01）

**安全加固**
- [x] 对 `v-html`（含两处 AI 回复）接入 DOMPurify 净化（02）
- [N/A] 确认 HTTPS 传输 + 后端哈希（03）—— 属后端/部署职责，**前端无需改动**（保持 base64Encode 即可）
- [x] 补充表单 `:rules` 输入校验（12）
- [x] Token 401 统一处理 `src/utils/auth.js`（06，refresh 续期仍依赖后端接口）

**按需 / 谨慎**
- [x] 清理 Footer/Header/About/Test 的 `setInterval`（05）
- [x] 图片懒加载 + resize/scroll 节流（10，路由懒加载已实现）
- [跳过] ⚠️ CSRF token：当前 Bearer 头鉴权天然免疫，**不实施**（04，已删除唯一 cookie 痕迹 `defaultChat.js`）
- [跳过] ⚠️ 前端加密存储：属安全表演，**不实施**（09，正解是后端 HttpOnly Cookie）
- [x] ⚠️ 响应式：断点魔法数字常量化（13，经核查代码中无 `@media var()` 语法错误）

## 📌 实施状态（2026-06-27，分支 `fix/dev-docs-optimizations`）

本轮按修订后的方案文档逐条落地，**每个小阶段均经过 lint + 单元测试 + `vite build` 验证并单独提交**。

### 已建立测试体系（基于测试开发/修复）

引入 **Vitest + @vue/test-utils + jsdom**（`npm test` / `npm run test:watch` / `npm run test:coverage`），
对新增工具与关键行为编写单测，当前 **43 个用例全部通过**：

| 测试文件 | 覆盖 |
|---------|------|
| `encoding.test.js` | base64Encode 与旧实现逐字一致（含中文/emoji） |
| `errorHandler.test.js` | 敏感信息脱敏、HTTP/业务码映射、弹窗分级 |
| `sanitize.test.js` | 剥离 script、移除事件属性、保留代码高亮 |
| `auth.test.js` | 401 判定、清理 token、触发重新登录 |
| `throttle.test.js` | leading-edge 节流时序与上下文 |
| `deviceInfo.test.js` | 各断点 getter 边界行为（重构回归基线） |
| `Footer.lifecycle.test.js` | 定时器在卸载时被 clearInterval（#05 回归） |

### 关键架构决策（基于代码的深入核查）

1. **删除整个 `src/server/` 死代码目录**：经 grep 核实 `serverRequest.js`、`defaultChat.js`、
   `customizedChat copy.js` 三者**均无任何 import 引用**，且都引用 gitignore 的 `aiEnglish` store、
   携带占位 token。文档 06/07/04 曾假设 `serverRequest.js` 是「线上 axios 请求层」，实为误判——
   真实请求层是各处**原生 fetch**（账户、AI 组件）与 `api/getNews.js` 的**直接 axios**。
   因此 #07 错误处理、#06 的 401 处理**改接入真实 fetch/axios 调用点**，而非已删除的 server 封装。
2. **`src/stores/aiEnglish.js` 被 gitignore**（含真实密钥），`aiEnglish_demo.js` 是提交版模板。
   全新检出会因缺该文件导致 `vite build` 失败；本地用 `cp aiEnglish_demo.js aiEnglish.js` 即可恢复构建门禁。
3. **#03 / #04 / #09 不产生前端代码改动**：均为「依赖后端/部署」或「前端做了反而是安全表演」，
   按文档结论保持现状（#04 顺带删除了唯一的 cookie 痕迹 `defaultChat.js`）。

### 提交一览（每阶段一个 commit）

测试体系 → #11 去重+删死代码 → #08 console/eslint → #01 环境变量 → #07 错误处理 →
#02 XSS → #06 401 → #12 表单校验 → #05 内存泄漏 → #10 性能 → #13 断点常量。

### 验证基线

- 单元测试：**43 通过**；`vite build`：**通过**。
- ESLint 全量问题：60 → 46（减少的为本轮触及文件；剩余 46 项均为**与本次无关的 pre-existing 结构性问题**，
  如单词组件名、`while(true)`、正则 `if(match=...)` 等，未在 13 篇文档范围内，故未改动）。

## 🤝 后端协作

本项目采用前后端分离架构，部分安全措施需要与后端配合实施：

| 前端任务 | 后端配合要求 |
|---------|-------------|
| CSRF token获取与发送 | 提供获取token的API接口，验证token有效性 |
| 密码RSA加密传输 | 提供公钥，配置解密服务 |
| 错误处理标准化 | 返回统一错误格式 |
| HTTPS强制跳转 | 配置HTTPS服务 |
| 请求拦截器 | 统一API响应格式 |

## 📚 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [原始安全审计报告](../SECURITY_AUDIT_REPORT.md) - 完整的安全审计结果
- [项目README](../README.md) - 项目整体说明

## ⚠️ 重要提醒

1. **备份**: 实施任何修改前，请确保代码已提交到版本控制
2. **测试**: 修改后需在测试环境验证功能正常
3. **回滚**: 准备回滚方案，确保出现问题可快速恢复
4. **文档**: 更新相关文档，记录所做的修改
5. **沟通**: 涉及后端配合的修改需提前与后端团队沟通

## 📅 更新日志

- **2024-01-07**: 初始版本，拆分13个优化点文档
- **2026-06-27**: 基于真实源码的逐条复审。修正各文档严重度与优先级、重写与现网代码脱节的修复方案（重点：05 内存泄漏文件清单、06 token 流程、08 console 清理方案），补充每个问题的真实代码文件路径与行号、可落地的修复步骤；修正索引文件名、依赖关系、配套工具与检查清单。
- **2026-06-27（实施）**: 在分支 `fix/dev-docs-optimizations` 按修订方案逐条落地。新增 Vitest 测试体系（43 例全绿）；实施 #01/#02/#05/#06/#07/#08/#10/#11/#12/#13；#03/#04/#09 按结论不做前端改动；删除整个死代码目录 `src/server/`。详见上方「📌 实施状态」。
