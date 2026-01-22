import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        requiresAuth: false,
        hideHeader: false,
        hideNavbar: true,
        hideFooter: true,
        title: '首頁 | PetPetNi',
        transparentHeaderBg: true // Header 使用透明背景
      }
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login/AuthView.vue'),
      meta: {
        requiresAuth: false,
        hideHeader: true,
        hideNavbar: true,
        hideFooter: true,
        title: '登入 | PetPetNi'
      }
    },

    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/Login/AuthCallback.vue'),
      meta: {
        requiresAuth: false,
        hideHeader: true,
        hideNavbar: true,
        hideFooter: true,
        title: 'OAuth 驗證中 | PetPetNi'
      }
    },

    {
      path: '/chat-test',
      name: 'chat-test',
      component: () => import('@/views/ChatRoomView.vue'),
      meta: {
        requiresAuth: true,
        hideHeader: true,
        hideNavbar: false,
        hideFooter: true,
        title: '聊天室 | PetPetNi'
      }
    },

    {
      path: '/event',
      name: 'Event',
      component: () => import('@/views/EventView.vue'),
      meta: {
        requiresAuth: true,
        hideHeader: false,
        hideNavbar: false,
        hideFooter: true,
        title: '活動 | PetPetNi'
      }
    },
    {
      path: '/social',
      name: 'Social',
      component: () => import('@/views/SocialView.vue'),
      meta: {
        requiresAuth: true,
        hideHeader: false,
        hideNavbar: false,
        hideFooter: true,
        title: '社群 | PetPetNi'
      }
    },
    {
      path: '/profile/:id?',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { headerType: 'app' }
    },
    {
      path: '/match',
      name: 'match',
      component: () => import('@/views/DailyMatchView.vue'),
      meta: {
        headerType: 'app',
        requiresAuth: true,
        title: '每日配對 | PetPetNi'
      }
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
