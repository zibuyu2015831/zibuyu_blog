# 01. 敏感信息管理 - 硬编码问题修复

**问题严重程度**: 🔴 严重  
**修复优先级**: 第一优先级（可独立完成）  
**依赖后端**: 否

---

## 问题概述

项目中存在多处硬编码的敏感信息，包括服务器地址、API密钥、Token等，这些信息直接暴露在前端代码中，任何人都可以通过查看源代码获取。

---

## 涉及文件路径

```
d:\06_program_code\zibuyu_blog\vite.config.js
d:\06_program_code\zibuyu_blog\src\server\serverRequest.js
d:\06_program_code\zibuyu_blog\src\server\defaultChat.js
d:\06_program_code\zibuyu_blog\src\stores\aiEnglish_demo.js
```

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

### 5. aiEnglish_demo.js:232 - 硬编码的token

```javascript
return "Bearer xxxxxxx"
```

---

## 风险评估

- **风险等级**: 极高
- **潜在影响**:
  - 服务器被攻击
  - API密钥被盗用
  - 数据泄露
  - 中间人攻击

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
          drop_debugger: true
        }
      }
    }
  }
})
```

### 步骤 3: 更新 serverRequest.js

```javascript
import axios from 'axios'
import useAiEnglish from '@/stores/aiEnglish';
import { ElMessage } from 'element-plus'

class MyRequest {
  constructor(baseURL, timeout = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout
    });

    this.commonHeaders = {
      'Content-Type': 'application/json',
    };
  }

  request(config) {
    if (config.headers && config.headers.Authorization) {
      config.headers = {
        ...this.commonHeaders,
        ...config.headers
      };
    } else {
      config.headers = this.commonHeaders;
    }

    return new Promise((resolve, reject) => {
      this.instance.request(config).then(res => {
        if (typeof res.data !== 'object' || res.data === null) {
          ElMessage.error('Response data is not JSON format')
          reject('Response data is not JSON format');
          return;
        }

        if (!res.data.hasOwnProperty('code')) {
          ElMessage.error('JSON data does not contain "code" field')
          reject('JSON data does not contain "code" field');
          return;
        }

        if (res.data.code === 3001) {
          ElMessage({
            message: '操作太频繁了，喝口水休息一下吧~',
            type: 'warning',
          })
          reject('Requests are too frequent');
          return;
        }

        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }

  get(config) {
    return this.request({ ...config, method: "get" })
  }

  post(config) {
    return this.request({ ...config, method: "post" })
  }
}

export default new MyRequest(SERVER_URL)
```

### 步骤 4: 更新 .gitignore

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
- [修复检查清单](./checklist.md) - 验收标准

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
