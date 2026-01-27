<script setup>
import { ref, watch } from 'vue'
import BaseInput from '@/components/Form/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  if (error) {
    console.error('登入錯誤', error)
    alert('登入失敗：' + error.message)
  }
}

const loginWithGithub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' })
  if (error) {
    console.error('GitHub 登入錯誤', error)
    alert('GitHub 登入失敗：' + error.message)
  }
}

const authStore = useAuthStore()
const router = useRouter()

defineEmits(['switch'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')
const loginFailed = ref(false)

// 監聽輸入變化，清除錯誤訊息
watch(email, () => {
  emailError.value = ''
  loginFailed.value = false
})

watch(password, () => {
  passwordError.value = ''
  loginFailed.value = false
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

//獲取 OAuth 授權 URL
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
    if (import.meta.env.DEV) {
      console.error('Social login error:', error)
    }
    alert('第三方登入失敗，請稍後再試')
  }
}

const handleLogin = async () => {
  // 清空錯誤訊息
  emailError.value = ''
  passwordError.value = ''
  loginFailed.value = false

  // 驗證 Email
  email.value = email.value.trim()
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

  // 呼叫登入 API
  try {
    const result = await authStore.login(email.value, password.value)

    // 檢查是否需要完成註冊流程
    if (result.needsRegistration) {
      // 導向角色選擇頁面
      router.push({ name: 'login', query: { mode: 'role' } })
    } else {
      // 登入成功，導向首頁
      router.push('/')
    }
  } catch (error) {
    // 顯示錯誤訊息
    loginFailed.value = true
    if (error.response?.data?.error) {
      emailError.value = error.response.data.error
    } else {
      emailError.value = '登入失敗，請檢查帳號密碼'
    }
  }
}

const handleEmailBlur = () => {
  if (email.value) {
    email.value = email.value.trim()
  }
  emailError.value =
    email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '電子郵件格式不正確' : ''
}
</script>

<template>
  <div class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12">
    <h2 class="text-brand-primary mb-8 text-center text-3xl font-bold">歡迎回來</h2>

    <!-- 第三方登入按鈕 -->
    <div class="mb-6 grid grid-cols-2 gap-4">
      <!-- github 登入 -->
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
        @click="loginWithGithub"
      >
        <svg class="h-5 w-5" viewBox="0 0 98 96">
          <path
            d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252V91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 0 48.9043 0C21.8203 0 0 22.1074 0 49.1914C0 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008V83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"
          />
        </svg>
      </button>

      <!-- Google 登入 -->
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
        @click="signInWithGoogle"
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

    <div class="relative my-6">
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
          @blur="handleEmailBlur"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">密碼</label>
        <BaseInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :error="passwordError"
          :invalid="loginFailed"
          placeholder="Password"
          input-class="pr-12"
        >
          <template #suffix>
            <button
              type="button"
              class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
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
          </template>
        </BaseInput>
      </div>

      <div class="flex items-center">
        <label class="flex cursor-pointer items-center">
          <input
            type="checkbox"
            class="text-brand-primary focus:ring-brand-primary h-4 w-4 rounded border-gray-300"
          />
          <span class="ml-2 text-sm text-gray-600">我會記得你的</span>
        </label>
      </div>

      <button
        type="submit"
        class="bg-brand-primary w-full cursor-pointer rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
      >
        登入
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-gray-500">
      還不是會員？
      <button
        class="text-brand-primary cursor-pointer font-medium hover:underline"
        type="button"
        @click="$emit('switch')"
      >
        註冊
      </button>
    </p>
  </div>
</template>
