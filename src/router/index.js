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
      path: '/chat/:roomId?',
      name: 'chat',
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
      path: '/profile',
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

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // 動態引入 store 避免循環依賴
  // const { useAuthStore } = await import('@/stores/auth')

  // 確保 auth 狀態已初始化 (如果需要)
  // if (!authStore.hasInit) await authStore.initAuth()
  // ↑ initAuth 是在 App.vue mounted 呼叫，可能比 router guard 晚
  // 若要確保路由進入前已驗證，可能需要在這裡呼叫，或檢查 localStorage

  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // 1. 需要認證但未登入
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 2. 已登入但訪問登入頁 -> 導向首頁或 Dashboard
  // Exception: 如果有 mode 參數（例如 mode=role），允許進入（用於補全資料）
  if (to.name === 'login' && isLoggedIn && !to.query.mode) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
