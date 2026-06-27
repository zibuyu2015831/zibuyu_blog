import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';


// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载 .env / .env.[mode] / .env.local 等环境变量（#01）
  // 后端接口地址不再硬编码，统一由 VITE_API_TARGET 提供，缺省回退到原公开 IP，保证开箱即用
  const env = loadEnv(mode, process.cwd())
  const apiTarget = env.VITE_API_TARGET || 'http://8.138.106.241/api'

  return {
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      // 生成 ESLint 全局变量声明，消除 ElMessage/ElImage 等自动导入 API 的 no-undef 误报（#08）
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: 'readonly',
      },
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
  // 仅在生产构建（vite build）时移除 console / debugger；开发模式保留，便于调试（#08）
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
  server: {
    port: 3000,           // 客户端的运行端口，此处也可以绑定vue运行的端口，当然也可以写在pycharm下
    host: '0.0.0.0', // 客户端的运行地址，此处也可以绑定vue运行的域名，当然也可以写在pycharm下
    // 跨域代理
    proxy: {
      '/elem10': {
        // 凡是遇到 /api 路径的请求，都映射到 target 属性  /api/header/  ---> http://api.luffycity.cn:8000/header/
        target: 'https://fuss10.elemecdn.com/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/elem10/, '')
      },
      '/elem': {
        target: 'https://cube.elemecdn.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/elem/, '')
      },
      '/api': {
        target: apiTarget,
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
  // 原 define.SERVER_URL（硬编码 http://8.138.106.241/）随死代码 server/ 一并移除，已无任何引用
  // publicPath:'./'
  }
})
