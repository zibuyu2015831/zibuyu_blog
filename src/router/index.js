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
      component: () => import('@/components/Home.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/components/About.vue')
    },
    {
      path: '/article/:article_id',
      name: 'article',
      component: () => import('@/components/Article.vue')
    },
    {
      path: '/english_chat',
      name: 'english_chat',
      component: () => import('@/components/EnglishChat.vue')
    }
    ,
    {
      path: '/web_site',
      name: 'web_site',
      component: () => import('@/components/WebSite.vue')
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

  console.log('Navigating from', deviceInfoStore.beforePath, 'to', deviceInfoStore.currentPath);
  next(); // 必须调用next()来允许导航继续
});

export default router
