<script setup>
import { ref } from 'vue'
import SocialButton from '@/components/login/SocialButton.vue'
import BaseInput from '@/components/Form/BaseInput.vue'

defineEmits(['switch', 'forgot'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

// 監聽輸入變化，清除錯誤訊息
watch(email, () => {
  emailError.value = ''
})

watch(password, () => {
  passwordError.value = ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// TODO: 串接後端 API - 獲取 OAuth 授權 URL
const handleSocialLogin = async (provider) => {
  try {
    // 呼叫後端 API 獲取 OAuth URL
    const response = await fetch(`/api/auth/${provider}/url`, {
      method: 'GET',
      credentials: 'include' // 攜帶 Cookie (Session)
    })

    if (!response.ok) throw new Error('Failed to get OAuth URL')

    const data = await response.json()

    // 重定向到 OAuth Provider
    window.location.href = data.authUrl
  } catch (error) {
    console.error('Social login error:', error)
    alert('第三方登入失敗，請稍後再試')
  }
}

const handleLogin = () => {
  // 清空錯誤訊息
  emailError.value = ''
  passwordError.value = ''

  // 驗證 Email
  if (!email.value) {
    emailError.value = '請輸入電子郵件'
    return
  }

  // 簡單的 Email 格式驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = '電子郵件格式不正確'
    return
  }

  // 驗證密碼
  if (!password.value) {
    passwordError.value = '請輸入密碼'
    return
  }

  // TODO: Implement Login Logic
  console.log('Login:', { email: email.value, password: password.value })
}
</script>

<template>
  <div class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12">
    <h2 class="mb-8 text-center text-3xl font-bold" style="color: #ffa75f">
      <!-- TODO: Replace with CSS variable var(--app-primary) -->
      歡迎回來
    </h2>

    <!-- 第三方登入按鈕 -->
    <div class="mb-8 grid grid-cols-2 gap-4">
      <!-- Discord 登入 -->
      <button
        type="button"
        class="flex items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
        @click="handleSocialLogin('discord')"
      >
        <svg class="h-5 w-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"
          />
        </svg>
      </button>

      <!-- Google 登入 -->
      <button
        type="button"
        class="flex items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
        @click="handleSocialLogin('google')"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </button>
    </div>

    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-4 text-gray-400">OR</span>
      </div>
    </div>

    <form class="space-y-6" novalidate @submit.prevent="handleLogin">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">帳號</label>
        <BaseInput
          v-model="email"
          :error="emailError"
          placeholder="Enter your email..."
          type="email"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">密碼</label>
        <div class="relative">
          <BaseInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :error="passwordError"
            placeholder="Password"
            input-class="pr-12"
          />
          <button
            type="button"
            class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            @click="togglePassword"
          >
            <svg
              v-if="!showPassword"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label class="flex cursor-pointer items-center">
          <!-- TODO: Replace with CSS variable var(--app-primary) -->
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-[#ffa75f] focus:ring-[#ffa75f]"
          />
          <span class="ml-2 text-sm text-gray-500">我會記得你的</span>
        </label>
        <button
          type="button"
          class="text-sm text-gray-400 hover:text-gray-600"
          @click="$emit('forgot')"
        >
          忘記密碼？
        </button>
      </div>

      <button
        type="submit"
        class="w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
        style="background-color: #ffa75f"
      >
        <!-- TODO: Replace with CSS variable var(--app-primary) -->
        登入
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-gray-500">
      還不是會員？
      <button
        class="font-medium hover:underline"
        style="color: #ffa75f"
        type="button"
        @click="$emit('switch')"
      >
        <!-- TODO: Replace with CSS variable var(--app-primary) -->
        註冊
      </button>
    </p>
  </div>
</template>
