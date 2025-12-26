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

    // {
    //   path: '/login',
    //   name: 'login',
    //   // component: () => import('../views/Login/LoginView.vue')
    // },

    // 聊天室路徑
    {
      path: '/chat-test',
      name: 'chat-test',
      component: () => import('@/views/ChatRoomView.vue')
    },
    {
      path: '/Event',
      name: 'Event',
      component: () => import('@/views/EventView.vue')
    },
    {
      path: '/Social',
      name: 'Social',
      component: () => import('@/views/SocialView.vue')
    },
    {
      path: '/Profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue')
    }
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
