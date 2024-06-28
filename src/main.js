import 'normalize.css'
import './assets/css/reset.css'
import '@/assets/css/iconfont.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import themePlugin from '@/plugins/themePlugin.js'
import dynamicHtml  from '@/utils/dynamicHtml.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// import ElementPlus from 'element-plus'

const app = createApp(App)

app.directive('dynamic-html', dynamicHtml);

app.use(createPinia())

// 完整导入ElementPlus
// app.use(ElementPlus)

app.use(themePlugin)

app.use(router)

app.mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}