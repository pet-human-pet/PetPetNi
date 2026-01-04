<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/Form/BaseInput.vue'

const emit = defineEmits(['change-view'])

const otpCode = ref('')
const isRobotChecked = ref(false)

const handleVerify = () => {
  if (!isRobotChecked.value) {
    alert('請勾選我不是機器人')
    return
  }
  console.log('驗證 OTP:', otpCode.value)
  // 模擬驗證成功，返回登入頁或重設密碼頁
  // 根據流程圖：正確 -> ReLogin
  emit('change-view', 'LOGIN')
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl">輸入驗證碼</h1>
    <p class="mb-8 text-center text-sm text-gray-500">驗證碼已發送。請檢查您的信箱或簡訊。</p>

    <form @submit.prevent="handleVerify">
      <BaseInput v-model="otpCode" label="驗證碼" placeholder="6 位數驗證碼" type="text" />

      <!-- 模擬 Google reCAPTCHA -->
      <div class="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4">
        <label class="flex cursor-pointer items-center">
          <input
            v-model="isRobotChecked"
            type="checkbox"
            class="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-3 text-sm font-medium text-gray-700">我不是機器人 (I'm not a robot)</span>
        </label>
      </div>

      <button
        type="submit"
        class="mb-4 w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
      >
        確認驗證
      </button>

      <button
        type="button"
        class="w-full rounded-xl border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 active:scale-95"
        @click="$emit('change-view', 'FORGET_PWD')"
      >
        重新輸入 Email
      </button>
    </form>
  </div>
</template>
