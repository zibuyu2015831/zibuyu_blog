# 08. 调试代码清理 - 生产环境优化

**问题严重程度**: 🟡 中等  
**修复优先级**: 中期优化（1个月）  
**依赖后端**: 否

---

## 问题概述

项目中存在大量调试代码，包括console.log、console.error、注释掉的代码、未使用的变量等，这些代码不仅影响性能，还可能泄露敏感信息。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\src\content\DialogLogin.vue
d:\06_program_code\zibuyu_blog\src\content\DialogRegister.vue
d:\06_program_code\zibuyu_blog\src\content\ResetPassword.vue
d:\06_program_code\zibuyu_blog\src\views\Article.vue
d:\06_program_code\zibuyu_blog\src\stores\aiEnglish_demo.js
d:\06_program_code\zibuyu_blog\src\components\AiEnglishSpokenCoach.vue
d:\06_program_code\zibuyu_blog\src\components\AiEnglishCommonAssistant.vue
```

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

在 `vite.config.js` 中添加：

```javascript
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
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000/api',
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
      'SERVER_URL': JSON.stringify(env.VITE_SERVER_URL || 'http://localhost:8000/')
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        output: {
          comments: false
        }
      }
    }
  }
})
```

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

在 `.eslintrc.cjs` 中添加：

```javascript
module.exports = {
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
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
