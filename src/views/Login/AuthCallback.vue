<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const statusText = ref('正在驗證您的身分...')
const errorMsg = ref('')

onMounted(async () => {
  const { code, provider } = route.query

  if (!code) {
    errorMsg.value = '無效的驗證請求 (Missing code)'
    return
  }

  try {
    const result = await authStore.handleOAuthCallback(code, provider)

    if (result.status === 'NEW_USER') {
      statusText.value = '偵測到新用戶，正在導向註冊流程...'
      // 導回登入頁，並指定進入 BIND_PHONE 步驟
      setTimeout(() => {
        router.push({ name: 'login', query: { step: 'BIND_PHONE' } })
      }, 1000)
    } else {
      statusText.value = '登入成功！正在進入首頁...'
      setTimeout(() => {
        router.push({ name: 'home' })
      }, 1000)
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = '登入失敗，請稍後再試'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
      <div v-if="!errorMsg">
        <!-- Loading Spinner -->
        <div class="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"></div>
        <h2 class="mb-2 text-xl font-bold text-gray-800">第三方登入</h2>
        <p class="text-gray-500">{{ statusText }}</p>
      </div>

      <div v-else>
        <!-- Error State -->
        <div class="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="mb-2 text-xl font-bold text-gray-800">發生錯誤</h2>
        <p class="mb-4 text-gray-500">{{ errorMsg }}</p>
        <button
          class="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          @click="router.push('/login')"
        >
          返回登入頁
        </button>
      </div>
    </div>
  </div>
</template>
