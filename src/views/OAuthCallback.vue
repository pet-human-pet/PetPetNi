<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const { code, state, error } = route.query
  const provider = route.params.provider // discord 或 google

  // 處理 OAuth 錯誤（使用者拒絕授權）
  if (error) {
    console.error('OAuth Error:', error)
    alert('授權失敗，請重試')
    router.push('/login')
    return
  }

  // 驗證必要參數
  if (!code || !state) {
    alert('無效的授權請求')
    router.push('/login')
    return
  }

  try {
    // TODO: 串接後端 API - 處理 OAuth Callback
    // 後端會驗證 state 參數，並使用 code 交換 Access Token
    const response = await fetch(`/api/auth/${provider}/callback?code=${code}&state=${state}`, {
      method: 'GET',
      credentials: 'include' // 攜帶 Cookie (Session)
    })

    if (!response.ok) {
      throw new Error('OAuth callback failed')
    }

    const data = await response.json()

    if (data.needBindEmail) {
      // 需要綁定 Email，跳轉到綁定頁面
      // tempToken 包含第三方平台的使用者資訊
      router.push(`/login?mode=social_bind&temp_token=${data.tempToken}`)
    } else {
      // 登入成功，儲存 JWT Token 並跳轉首頁
      localStorage.setItem('token', data.token)
      router.push('/')
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    alert('登入失敗，請重試')
    router.push('/login')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center" style="background-color: #ffd9ad">
    <!-- TODO: Replace with CSS variable var(--app-bg) -->
    <div class="text-center">
      <!-- Loading Spinner -->
      <div
        class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-[#ffa75f]"
      ></div>
      <p class="text-lg font-medium text-gray-700">正在登入中...</p>
      <p class="mt-2 text-sm text-gray-500">請稍候，我們正在處理您的授權</p>
    </div>
  </div>
</template>

<style scoped>
/* 自訂 Loading 動畫 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
