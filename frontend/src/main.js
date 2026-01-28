import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { supabase } from '@/lib/supabase'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化 Auth Store (從 localStorage 恢復 token)
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initAuth()

// 初始化 Supabase Auth 監聽
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('[Supabase Auth]', event, session)

  if (event === 'SIGNED_IN' && session) {
    // OAuth 登入成功，處理 session
    await authStore.handleSupabaseSession(session)
  } else if (event === 'SIGNED_OUT') {
    console.log('✅ Supabase 登出')
  }
})

app.mount('#app')
