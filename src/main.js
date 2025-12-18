import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 告訴 App 使用 Pinia (狀態管理)
app.use(createPinia())

// 告訴 App 使用 Router (路由)
app.use(router)

app.mount('#app')
