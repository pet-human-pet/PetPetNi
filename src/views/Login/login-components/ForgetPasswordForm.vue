<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

const emit = defineEmits(['change-view'])

const contact = ref('')

const handleSubmit = () => {
  // 模擬發送驗證碼
  console.log('發送驗證碼至:', contact.value)
  emit('change-view', 'OTP_VERIFY')
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl">忘記密碼</h1>
    <p class="mb-8 text-center text-sm text-gray-500">
      請輸入您註冊的 Email 或手機號碼，
      <br />
      我們將發送驗證碼給您。
    </p>

    <form @submit.prevent="handleSubmit">
      <BaseInput v-model="contact" label="Email 或手機號碼" placeholder="example@email.com" type="text" />

      <button
        type="submit"
        class="mb-4 w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
      >
        發送驗證碼
      </button>

      <button
        type="button"
        class="w-full rounded-xl border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 active:scale-95"
        @click="$emit('change-view', 'LOGIN')"
      >
        返回登入
      </button>
    </form>
  </div>
</template>
