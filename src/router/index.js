import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect:'/home'
    },
    {
      path: '/home',
      name: 'home',
      component: ()=>import('@/components/Home.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: ()=>import('@/components/About.vue')
    },
    {
      path: '/article/:article_id',
      name: 'article',
      component: ()=>import('@/components/Article.vue')
    }
  ]
})

export default router
