<script setup>
import { ref } from "vue";
import SocialButton from "./login-components/SocialButton.vue";
import BaseInput from "./login-components/BaseInput.vue";

// 表單狀態管理
const email = ref("");
const password = ref("");
const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = () => {
  console.log("登入資訊:", { email: email.value, password: password.value });
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center p-4"
  >
    <div
      class="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10"
    >
      <div class="flex justify-center mb-6">
        <div
          class="w-12 h-12 bg-black rounded-xl flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
            />
          </svg>
        </div>
      </div>

      <h1 class="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
        歡迎回來
      </h1>

      <div class="grid grid-cols-3 gap-3 mb-6">
        <SocialButton type="apple" />
        <SocialButton type="google" />
        <SocialButton type="linkedin" />
      </div>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <form @submit.prevent="handleLogin">
        <BaseInput
          v-model="email"
          label="帳號"
          placeholder="Enter your email..."
          type="email"
        />

        <div class="mb-4 relative">
          <BaseInput
            v-model="password"
            label="密碼"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
          />
          <button
            type="button"
            @click="togglePassword"
            class="absolute right-4 top-[42px] text-gray-500 hover:text-gray-700"
          >
            <svg
              v-if="!showPassword"
              class="w-5 h-5"
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
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>

        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" class="w-4 h-4 rounded border-gray-300" />
            <span class="ml-2 text-sm text-gray-700">我會記得你的</span>
          </label>
          <a href="#" class="text-sm text-gray-500 hover:underline"
            >忘記密碼？</a
          >
        </div>

        <button
          type="submit"
          class="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg active:scale-95"
        >
          登入
        </button>
      </form>

      <p class="text-center text-sm text-gray-600 mt-6">
        還不是會員？
        <a href="#" class="text-gray-900 font-medium hover:underline">註冊</a>
      </p>
    </div>
  </div>
</template>
