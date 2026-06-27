import { createRouter, createWebHistory } from 'vue-router'
import useDeviceInfo from '@/stores/deviceInfo';



// 读取状态
// const { isShowHeaderNavigate} = storeToRefs(deviceInfoStore);

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/article/:article_id',
    name: 'article',
    component: () => import('@/views/Article.vue')
  },
  {
    path: '/ai_english',
    name: 'ai_english',
    component: () => import('@/views/AiEnglish.vue')
  },
  {
    path: '/web_site',
    name: 'web_site',
    component: () => import('@/views/WebNavigate.vue')
  }
]

// 单词墙动画为开发期调试/演示页，仅在开发环境暴露，避免污染生产路由与 SEO。
if (import.meta.env.DEV) {
  routes.push({
    path: '/test',
    name: 'test',
    component: () => import('@/views/Test.vue')
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // history:createWebHashHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {

  // 执行函数，拿到Store
  const deviceInfoStore = useDeviceInfo();

  // 将url存入状态管理
  deviceInfoStore.beforePath = from.path
  deviceInfoStore.currentPath = to.path

  next(); // 必须调用next()来允许导航继续
});

export default router
