<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/Form/BaseInput.vue'

const emit = defineEmits(['success'])

const email = ref('')

const handleBind = () => {
  // 模擬綁定
  console.log('綁定 Email:', email.value)
  // 綁定成功後觸發成功事件
  emit('success')
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl">綁定 Email</h1>
    <p class="mb-8 text-center text-sm text-gray-500">
      為了您的帳號安全，
      <br />
      請綁定 Email 以完成註冊。
    </p>

    <form @submit.prevent="handleBind">
      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium text-gray-600">Email</label>
        <BaseInput v-model="email" placeholder="example@email.com" type="email" />
      </div>

      <button
        type="submit"
        class="w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
      >
        綁定並繼續
      </button>
    </form>
  </div>
</template>
