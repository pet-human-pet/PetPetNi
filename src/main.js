import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化 Auth Store (從 localStorage 恢復 token)
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
