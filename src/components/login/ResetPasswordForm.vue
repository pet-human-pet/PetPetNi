<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/Form/BaseInput.vue'

const props = defineProps({
  token: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['success'])

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const passwordError = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const isValidPassword = (pwd) => {
  const asciiRegex = /^[\x20-\x7E]+$/
  return asciiRegex.test(pwd)
}

const handleResetPassword = async () => {
  // 清空之前的錯誤訊息
  passwordError.value = ''
  confirmPasswordError.value = ''

  // 驗證密碼格式
  if (!isValidPassword(password.value)) {
    passwordError.value = '密碼僅限英文字母、數字和符號，不可使用重音符號。'
    return
  }

  // 驗證兩次密碼是否一致
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = '兩次密碼輸入不一致'
    return
  }

  isLoading.value = true

  try {
    // TODO: 未來實作 API 呼叫
    // await resetPassword({ token: props.token, password: password.value })

    // 模擬 API 呼叫
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 成功後導向登入頁
    emit('success')
    router.push({ name: 'login' })
  } catch {
    passwordError.value = '重設密碼失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl">設定新密碼</h1>
    <p class="mb-8 text-center text-sm text-gray-500">
      請輸入您的新密碼，
      <br />
      密碼需為 8-20 碼，包含英文字母、數字和符號。
    </p>

    <form @submit.prevent="handleResetPassword">
      <div class="mb-6 space-y-2">
        <label class="text-sm font-medium text-gray-600">新密碼</label>
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
            class="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

      <div class="mb-6 space-y-2">
        <label class="text-sm font-medium text-gray-600">確認新密碼</label>
        <BaseInput
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          :error="confirmPasswordError"
          placeholder="Confirm Password"
        />
      </div>

      <button
        type="submit"
        class="mb-4 w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isLoading"
      >
        {{ isLoading ? '重設中...' : '重設密碼' }}
      </button>

      <button
        type="button"
        class="w-full rounded-xl border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 active:scale-95"
        @click="$router.push({ name: 'login' })"
      >
        返回登入
      </button>
    </form>
  </div>
</template>
