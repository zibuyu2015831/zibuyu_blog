import { createRouter, createWebHistory } from 'vue-router'
import useDeviceInfo from '@/stores/deviceInfo';



// 读取状态
// const { isShowHeaderNavigate} = storeToRefs(deviceInfoStore);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      component: () => import('@/views/WebSite.vue')
    }
    ,
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/Test.vue')
    }
  ]
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
