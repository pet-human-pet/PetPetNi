<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/Form/BaseInput.vue'

const emit = defineEmits(['change-view'])

const email = ref('')

const handleSubmit = () => {
  // TODO: 未來實作 API - 發送重設密碼連結至 Email
  // 暫時直接導回登入頁，正式版應顯示「已發送」訊息
  emit('change-view', 'LOGIN')
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl">忘記密碼</h1>
    <p class="mb-8 text-center text-sm text-gray-500">
      請輸入您註冊的 Email，
      <br />
      我們將發送重設密碼連結給您。
    </p>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium text-gray-600">Email</label>
        <BaseInput v-model="email" placeholder="example@email.com" type="email" />
      </div>

      <button
        type="submit"
        class="mb-4 w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
      >
        發送重設連結
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
