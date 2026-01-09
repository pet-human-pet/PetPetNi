<script setup>
import { ref } from 'vue'
import SocialButton from '@/components/login/SocialButton.vue'
import BaseInput from '@/components/Form/BaseInput.vue'

defineEmits(['switch', 'forgot'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = () => {
  // TODO: Implement Login Logic
  console.log('Login:', { email: email.value, password: password.value })
}
</script>

<template>
  <div class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12">
    <h2 class="mb-8 text-center text-3xl font-bold" style="color: #ffa75f">
      <!-- TODO: Replace with CSS variable var(--app-primary) -->
      歡迎回來
    </h2>

    <div class="mb-8 grid grid-cols-3 gap-4">
      <SocialButton type="apple" />
      <SocialButton type="google" />
      <SocialButton type="linkedin" />
    </div>

    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-4 text-gray-400">OR</span>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">帳號</label>
        <BaseInput v-model="email" placeholder="Enter your email..." type="email" />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">密碼</label>
        <div class="relative">
          <BaseInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
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
