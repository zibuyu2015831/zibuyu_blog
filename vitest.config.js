import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// 测试专用配置：与 vite.config.js 解耦，避免互相干扰。
// 运行：npm test（单次） / npm run test:watch（监听）
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // 业务代码里用到的全局常量，测试环境给一个占位值，避免 ReferenceError
    SERVER_URL: JSON.stringify('http://localhost/'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/api/**'],
    },
  },
})
