# 01. 敏感信息管理 - 硬编码问题修复

**问题严重程度**: 🟡 中危（原“严重”系高估，详见复审结论）  
**修复优先级**: 第一优先级（可独立完成）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟡 **部分成立（严重度高估）**
>
> - **属实**：`vite.config.js:48`（proxy `/api` target）与 `vite.config.js:60`（`SERVER_URL` define）内 `8.138.106.241` 的 IP 为硬编码；`serverRequest.js:14`、`defaultChat.js:17`、`aiEnglish_demo.js:232` 确有硬编码字符串（已逐行核对）。
> - **纠正**：`serverRequest.js:14` / `defaultChat.js:17` 的 `'Bearer your_token_here'`、`aiEnglish_demo.js:232` 的 `'Bearer xxxxxxx'` 均为**占位符**，并非真实泄露的密钥。运行时真实 token 由各组件单独注入：`AiEnglishSpokenCoach.vue:231`、`AiEnglishCommonAssistant.vue:623` 用 `` `Bearer ${userInfoStore.token}` `` 覆盖；`AiEnglishCommonAssistant.vue:703` 用 `requestKey.value`（来自 `aiEnglish_demo.js:228` getter，取 `customized_infos[].key`）覆盖。因此 `commonHeaders` 里的占位 Authorization 在真实请求中会被 `config.headers` 展开覆盖。原文“API密钥被盗用 / 极高风险”**夸大**，实际为「公开服务器 IP 硬编码 + 占位串」，定级**中危**更准确。
> - **补充**：`src/server/customizedChat copy.js` 是含相同占位符（`:13`）的重复死文件，未被任何模块 import，建议直接删除。
> - **结论**：环境变量化（`.env`）建议**采纳**，作为工程规范而非紧急安全修复。


## 问题概述

项目中存在多处硬编码的敏感信息，包括服务器地址、API密钥、Token等，这些信息直接暴露在前端代码中，任何人都可以通过查看源代码获取。

---

## 涉及文件路径

```
vite.config.js:48          # proxy /api → http://8.138.106.241/api（硬编码 IP）
vite.config.js:60          # SERVER_URL define → http://8.138.106.241/（硬编码 IP）
src/server/serverRequest.js:14   # 'Authorization': 'Bearer your_token_here'（占位符）
src/server/defaultChat.js:17     # 'Authorization': 'Bearer your_token_here'（占位符）
src/server/customizedChat copy.js:13  # 同上占位符，死文件，建议删除
src/stores/aiEnglish_demo.js:232 # return "Bearer xxxxxxx"（占位符，requestKey getter 的兜底分支）
```

> 说明：以上路径与行号均已逐个打开核对。`vite.config.js` 同时还有 `/elem10`、`/elem`、`/xunfei` 三个第三方代理目标（公开 CDN / 讯飞星火 API 网关），属公开地址，非密钥。

---

## 具体问题位置

### 1. vite.config.js:48 - 代理目标地址

```javascript
target: 'http://8.138.106.241/api',
```

### 2. vite.config.js:60 - 服务器URL定义

```javascript
'SERVER_URL':JSON.stringify('http://8.138.106.241/')
```

### 3. serverRequest.js:14 - 硬编码的Authorization头

```javascript
'Authorization': 'Bearer your_token_here',
```

### 4. defaultChat.js:17 - 硬编码的Authorization头

```javascript
'Authorization': 'Bearer your_token_here',
```

### 5. aiEnglish_demo.js:232 - requestKey getter 的占位兜底

```javascript
requestKey() {
  if (this.useCustomizedInfo) {
    return `Bearer ${this.customized_infos[this.currentSettingIndex].key}`
  } else {
    return "Bearer xxxxxxx"   // 占位符，仅在未配置自定义 key 时返回
  }
}
```

### 6. customizedChat copy.js:13 - 重复死文件中的占位符

```javascript
'Authorization': 'Bearer your_token_here',
```

该文件（`src/server/customizedChat copy.js`）与 `serverRequest.js` 内容几乎一致，未被任何模块引用，属遗留死文件，**建议直接删除**。

---

## 风险评估

- **风险等级**: 中（原文“极高”系高估）
- **实际情况**:
  - 硬编码的 `Bearer your_token_here` / `Bearer xxxxxxx` 是**占位符**，运行时被各组件的真实 token 覆盖（见复审结论），不构成密钥泄露。
  - 真正的硬编码项是**公开服务器 IP** `8.138.106.241` 及对外 CDN/API 地址，泄露的是“部署地址”而非“凭据”。
- **潜在影响**:
  - 切换部署环境（开发/测试/生产）时需改动源码，易出错（工程规范问题）。
  - 服务器 IP 直接写死，暴露后端基础设施地址，便于针对性扫描（信息暴露，非直接接管）。

---

## 修复方案

### 步骤 1: 创建环境变量文件

**开发环境** `.env.local`

```bash
VITE_SERVER_URL=http://localhost:8000/
VITE_API_BASE_URL=http://localhost:8000/api
```

**生产环境** `.env.production`

```bash
VITE_SERVER_URL=https://your-domain.com/
VITE_API_BASE_URL=https://api.your-domain.com/
```

### 步骤 2: 更新 vite.config.js

```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        // 以下两个为公开 CDN，可保留硬编码
        '/elem10': {
          target: 'https://fuss10.elemecdn.com/',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/elem10/, '')
        },
        '/elem': {
          target: 'https://cube.elemecdn.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/elem/, '')
        },
        // 仅这一项需要环境变量化（原硬编码 http://8.138.106.241/api）
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://8.138.106.241/api',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
        '/xunfei': {
          target: 'https://spark-api-open.xf-yun.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/xunfei/, '')
        },
      },
    },
    define: {
      // 原硬编码 http://8.138.106.241/
      'SERVER_URL': JSON.stringify(env.VITE_SERVER_URL || 'http://8.138.106.241/')
    }
  }
})
```

> 注意：本仓库 `vite.config.js` 实际共有 4 个 proxy（`/elem10`、`/elem`、`/api`、`/xunfei`），上面已全部保留；仅 `/api` 与 `SERVER_URL` 涉及内部服务器 IP，需要环境变量化。`/elem10`、`/elem`、`/xunfei` 是公开第三方地址，可不动。

### 步骤 3: 移除 serverRequest.js / defaultChat.js 里的占位 Authorization

`src/server/serverRequest.js` 当前的 `commonHeaders`（第 13-16 行）为：

```javascript
// 当前代码
this.commonHeaders = {
  'Authorization': 'Bearer your_token_here',   // ← 占位符，删除
  "Content-Type": "application/json",
};
```

实际请求中，真实 token 由调用方通过 `config.headers` 注入并覆盖（见
`AiEnglishSpokenCoach.vue:231`、`AiEnglishCommonAssistant.vue:623/703`）。因此该占位行可安全删除，避免误导：

```javascript
// 修改后
this.commonHeaders = {
  "Content-Type": "application/json",
};
```

`src/server/defaultChat.js` 第 16-19 行同理处理。`request()` 内 `config.headers = { ...this.commonHeaders, ...config.headers }` 的合并逻辑保持不变（调用方传入的 Authorization 仍会覆盖公共头）。

### 步骤 4: 删除死文件 `src/server/customizedChat copy.js`

```bash
git rm "src/server/customizedChat copy.js"
```

该文件未被任何模块 import（可用 `grep -rn "customizedChat copy" src` 确认无引用），内容与 `serverRequest.js` 重复，仅多一份占位 token，删除无副作用。

### 步骤 5: 更新 .gitignore

```gitignore
# 环境变量文件
.env.local
.env.*.local
.env.production.local

# 敏感信息
*.pem
*.key
secrets/
```

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有文件是否包含硬编码的URL、IP地址、密钥
- [ ] 确认所有敏感信息已移至环境变量
- [ ] 验证 .gitignore 包含环境变量文件

### 2. 环境测试

- [ ] 开发环境使用 .env 文件
- [ ] 生产环境使用 .env.production 文件
- [ ] 确认构建后不会泄露环境变量

### 3. 安全测试

- [ ] 检查构建后的代码是否包含敏感信息
- [ ] 使用工具扫描硬编码密钥（如 truffleHog）
- [ ] 验证HTTPS连接正常工作

### 4. 回归测试

- [ ] 确认所有API请求正常工作
- [ ] 验证代理配置正确
- [ ] 测试开发/生产环境切换

---

## 预期收益

- ✅ 消除敏感信息泄露风险
- ✅ 提升安全性
- ✅ 便于环境配置管理
- ✅ 符合安全最佳实践

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引

---

**文档版本**: 1.1（代码级复审）  
**创建日期**: 2026-01-07  
**最后更新**: 2026-06-27
