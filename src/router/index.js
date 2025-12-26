import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        hideFooter: true, // 首頁隱藏 Footer
        hideHeader: false // 預設顯示 Header
      }
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login/LoginView.vue')
    },

    {
      path: '/chat-test', 
      name: 'chat-test',
      component: () => import('@/views/ChatRoomView.vue')
    },
    {
      path: '/event',
      name: 'Event',
      component: () => import('@/views/EventView.vue')
    },
    {
      path: '/social',
      name: 'Social',
      component: () => import('@/views/SocialView.vue')
    },
    {
      path: '/profile',
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
    },
})

export default router
