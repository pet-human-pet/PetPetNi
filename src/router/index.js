import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        hideFooter: true,
        headerType: 'app', // 使用 Header.vue
        transparentHeader: true // Header 使用透明背景
      }
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login/AuthView.vue'),
      meta: { headerType: 'none' }
    },

    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/Login/AuthCallback.vue'),
      meta: { headerType: 'none' }
    },

    {
      path: '/chat-test',
      name: 'chat-test',
      component: () => import('@/views/ChatRoomView.vue'),
      meta: { 
        headerType: 'none',
        hideFooter: true
      }
    },

    {
      path: '/event',
      name: 'Event',
      component: () => import('@/views/EventView.vue'),
      meta: { headerType: 'app' }
    },
    {
      path: '/social',
      name: 'Social',
      component: () => import('@/views/SocialView.vue'),
      meta: { headerType: 'app' }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { headerType: 'app' }
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
