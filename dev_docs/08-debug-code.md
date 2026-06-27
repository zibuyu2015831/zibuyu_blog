# 08. 调试代码清理 - 生产环境优化

**问题严重程度**: 🟡 中等  
**修复优先级**: 中期优化（1个月）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🟢 **成立**
>
> - **属实**：14 个文件含 `console.*`，共 31 处（`grep -rn "console\." src` 实测）。`Home.vue` 6 处、`AiEnglishSpokenCoach.vue` 4 处、`About.vue` 4 处、`DialogReward.vue` 3 处、`Article.vue` 3 处为热点。
> - **重点**：`src/stores/deviceInfo.js:83` 的 getter `isEnglishWebShowLeft` 内 `console.log('屏幕宽度:', state.userScreenWidth)` —— getter **每次被访问/重算都会打印**，是噪声最大的一处。
> - **注意**：原步骤的 `build.minify: 'terser'` 需**额外安装 `terser`**（`package.json` 当前仅有 `vite ^5.2.8`，无 `terser`；Vite 5 默认 minifier 为 esbuild）。推荐改用 esbuild 的 `esbuild.drop` 配置，**无需新增依赖**。
> - **结论**：生产构建 `drop console/debugger` + ESLint `no-console` 规则建议采纳。


## 问题概述

项目中存在大量调试代码，包括console.log、console.error、注释掉的代码、未使用的变量等，这些代码不仅影响性能，还可能泄露敏感信息。

---

## 涉及文件路径

> ⚠️ 复审修正后的真实清单（`grep -rn "console\." src --include=*.vue --include=*.js`，共 14 文件 / 31 处）。按出现次数排序：

```
src/views/Home.vue                       6 处
src/components/AiEnglishSpokenCoach.vue   4 处
src/views/About.vue                       4 处
src/content/DialogReward.vue              3 处
src/views/Article.vue                     3 处（含 line 151 图片点击日志）
src/content/postSuggestion.vue            2 处
src/components/SmallScreenMenu.vue        2 处
src/stores/deviceInfo.js                  1 处 ★ getter 内，每次访问都打印（line 83）
src/content/ResetPassword.vue             1 处
src/content/DialogRegister.vue            1 处
src/content/DialogLogin.vue               1 处（line 169 console.error）
src/utils/logout.js                       1 处（line 51 console.error）
src/components/AiEnglishCommonAssistant.vue  1 处
src/api/getNews.js                        1 处（line 25 吞错日志）
```

> ★ **最高优先**：`src/stores/deviceInfo.js:83` 的 `console.log('屏幕宽度:', state.userScreenWidth)` 位于 getter `isEnglishWebShowLeft` 内，随响应式重算高频触发，应直接删除。
> 说明：原清单中的 `aiEnglish_demo.js` 经核查**无 `console.*`**，已移除。

---

## 风险评估

- **风险等级**: 低
- **潜在影响**:
  - 性能略微下降
  - 信息泄露风险
  - 代码可维护性降低

---

## 修复方案

### 步骤 1: 配置Vite清理console

**当前 `vite.config.js` 现状**：使用**对象形式** `export default defineConfig({ ... })`（非函数形式），没有 `build` 字段；`server.proxy` 含 `/elem10`、`/elem`、`/api`（target 写死 `http://8.138.106.241/api`）、`/xunfei` 四个代理；`define.SERVER_URL` 写死为 `'http://8.138.106.241/'`。因此只需在该对象里**新增一个 `build` 字段**，无需改动现有结构。

#### 方案 A（推荐，零新增依赖）：esbuild `drop`

Vite 5 默认 minifier 即 esbuild，直接用其 `drop` 选项移除 `console` 与 `debugger`：

```javascript
// 在 vite.config.js 的 defineConfig({ ... }) 对象内，与 server / define 同级新增：
export default defineConfig({
  // ...plugins / resolve / server / define 保持原样...

  // esbuild.drop 仅在生产构建（vite build）的压缩阶段生效，dev 模式不受影响
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
```

> `esbuild.drop` 会在生产构建时整体剔除 `console.*` 与 `debugger`；开发模式（`vite`/`vite dev`）下日志正常保留，不影响调试。

#### 方案 B（如需更细粒度，需新增依赖）：terser

terser 支持 `pure_funcs` 等更精细控制（如只删 `console.log`、保留 `console.error`），但 **`package.json` 当前未安装 terser**，必须先：

```bash
npm i -D terser
```

再在 `vite.config.js` 对象内新增：

```javascript
export default defineConfig({
  // ...原有配置...
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 保留 console.error/warn
      },
      format: { comments: false },
    },
  },
})
```

> 选型建议：若只需「生产环境去掉所有 console」，用**方案 A**（无新增依赖、配置最简）。若需保留 `console.error`/`console.warn` 用于线上排错，用**方案 B** 并通过 `pure_funcs` 精确指定要删除的函数。

### 步骤 2: 创建调试日志工具

创建文件: `src/utils/logger.js`

```javascript
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
}

let currentLevel = LOG_LEVELS.DEBUG

export function setLogLevel(level) {
  if (typeof level === 'string') {
    currentLevel = LOG_LEVELS[level] || LOG_LEVELS.DEBUG
  } else {
    currentLevel = level
  }
}

export function isDebugEnabled() {
  return currentLevel <= LOG_LEVELS.DEBUG
}

export function log(level, ...args) {
  if (level >= currentLevel) {
    const prefix = `[${level}]`
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(prefix, ...args)
        break
      case LOG_LEVELS.INFO:
        console.info(prefix, ...args)
        break
      case LOG_LEVELS.WARN:
        console.warn(prefix, ...args)
        break
      case LOG_LEVELS.ERROR:
        console.error(prefix, ...args)
        break
    }
  }
}

export const logger = {
  debug: (...args) => log(LOG_LEVELS.DEBUG, ...args),
  info: (...args) => log(LOG_LEVELS.INFO, ...args),
  warn: (...args) => log(LOG_LEVELS.WARN, ...args),
  error: (...args) => log(LOG_LEVELS.ERROR, ...args),
  time: (label) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.time(label)
    }
  },
  timeEnd: (label) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.timeEnd(label)
    }
  },
  group: (label) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.group(label)
    }
  },
  groupEnd: () => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.groupEnd()
    }
  }
}
```

### 步骤 3: 替换console.log

**替换前：**

```javascript
console.log('Login success:', response.data)
console.error('Login error:', error)
```

**替换后：**

```javascript
import { logger } from '@/utils/logger'

logger.debug('Login success:', response.data)
logger.error('Login error:', error)
```

### 步骤 4: 移除调试代码

移除所有类似以下代码：

```javascript
// 调试代码
console.log(123)
console.log(item)
// 调试结束
```

### 步骤 5: 使用ESLint规则

**当前 `.eslintrc.cjs` 现状**：仅有 `root`、`extends`（`plugin:vue/vue3-essential` + `eslint:recommended`）、`parserOptions`，**没有 `rules` 字段**。因此只需**新增** `rules` 块，不要覆盖整个 `module.exports`：

```javascript
/* eslint-env node */
module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  // ↓ 新增 rules 块
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-empty': ['warn', { allowEmptyCatch: true }]
  }
}
```

---

## 重要补充说明

### 1. 调试模式控制

```javascript
export const isDebugMode = import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === 'true'

if (isDebugMode) {
  logger.info('Debug mode enabled')
}
```

### 2. 性能调试

```javascript
import { logger } from '@/utils/logger'

logger.time('API Request')
const result = await apiCall()
logger.timeEnd('API Request')
```

### 3. 条件调试代码

```javascript
import { logger } from '@/utils/logger'

logger.group('User Login')
logger.debug('Username:', username)
try {
  await login()
  logger.info('Login successful')
} catch (error) {
  logger.error('Login failed:', error)
}
logger.groupEnd()
```

---

## 核查流程

### 1. 代码审查

- [ ] 搜索并移除所有console.log
- [ ] 移除注释掉的代码
- [ ] 删除未使用的变量
- [ ] 检查调试代码模式

### 2. 构建检查

- [ ] 确认生产构建移除console
- [ ] 检查构建产物大小
- [ ] 验证terser配置正确

### 3. 功能测试

- [ ] 确认功能正常工作
- [ ] 检查开发环境日志
- [ ] 验证生产环境无日志

---

## 预期收益

- ✅ 提升代码安全性
- ✅ 减小构建体积
- ✅ 提升运行性能
- ✅ 改善代码质量

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
