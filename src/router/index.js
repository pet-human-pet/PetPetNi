import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },

    {
      path: '/login',
      name: 'login',
      // component: () => import('../views/Login/LoginView.vue')
    },
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    }
    
    // 聊天室路徑
    {
      path: '/chat-test', 
      name: 'chat-test',
      component: () => import('@/views/ChatRoomView.vue')
    }
  ],
})

export default router
