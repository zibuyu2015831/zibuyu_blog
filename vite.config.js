import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// const AutoImport = require('unplugin-auto-import/webpack')
// const Components = require('unplugin-vue-components/webpack')
// const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')


// https://vitejs.dev/config/
export default defineConfig({
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
    port: 443,           // 客户端的运行端口，此处也可以绑定vue运行的端口，当然也可以写在pycharm下
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
          // 凡是遇到 /api 路径的请求，都映射到 target 属性  /api/header/  ---> http://api.luffycity.cn:8000/header/
          target: 'https://cube.elemecdn.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/elem/, '')
      },
    },
  }
})
