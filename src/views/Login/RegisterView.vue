<script setup>
import { ref } from 'vue'
import SocialButton from './login-components/SocialButton.vue'
import BaseInput from './login-components/BaseInput.vue'

import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'

// 表單狀態管理
const router = useRouter()
const uiStore = useUIStore()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const isValidPassword = (pwd) => {
  // 僅限 ASCII 標準字元 (32-126)，且不包含重音符號
  // \x20-\x7E 涵蓋了所有標準可列印 ASCII 字元
  const asciiRegex = /^[\x20-\x7E]+$/
  return asciiRegex.test(pwd)
}

const handleRegister = () => {
  if (!isValidPassword(password.value)) {
    alert('密碼僅限英文字母、數字和符號，不可使用重音符號。')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('兩次密碼輸入不一致')
    return
  }

  // TODO: Implement Register Logic

  router.push('/').then(() => {
    setTimeout(() => {
      uiStore.openVerificationModal()
    }, 100)
  })
}
</script>

<template>
  <div
    class="`bg-gradient-to-br` flex min-h-screen items-center justify-center from-red-400 to-pink-400 p-4"
  >
    <div class="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
      <div class="mb-6 flex justify-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
          <svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        </div>
      </div>

      <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:text-3xl">建立帳戶</h1>

      <div class="mb-6 grid grid-cols-3 gap-3">
        <SocialButton type="apple" />
        <SocialButton type="google" />
        <SocialButton type="linkedin" />
      </div>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-4 text-gray-500">OR</span>
        </div>
      </div>

      <form @submit.prevent="handleRegister">
        <BaseInput v-model="email" label="帳號" placeholder="Enter your email..." type="email" />

        <div class="relative mb-4">
          <BaseInput
            v-model="password"
            label="密碼"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Create password"
          />
          <button
            type="button"
            class="absolute top-[42px] right-4 text-gray-500 hover:text-gray-700"
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

        <div class="relative mb-6">
          <BaseInput
            v-model="confirmPassword"
            label="確認密碼"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Confirm password"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
        >
          註冊
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        已有帳號？
        <router-link to="/login" class="font-medium text-gray-900 hover:underline"
          >登入</router-link
        >
      </p>
    </div>
  </div>
</template>
