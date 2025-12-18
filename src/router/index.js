import { createRouter, createWebHistory } from 'vue-router'
import ProfileView from '../views/Profile.vue' // 引入你的新檔案

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ProfileView
    }
  ],
})

export default router
