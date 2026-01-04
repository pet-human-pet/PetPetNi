<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

const emit = defineEmits(['change-view'])

const phone = ref('')

const handleBind = () => {
  // 模擬綁定
  console.log('綁定手機:', phone.value)
  // 綁定成功後進入身分選擇
  emit('change-view', 'ROLE_SELECT')
}
</script>

<template>
  <div class="w-full">
    <h1 class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl">綁定手機</h1>
    <p class="mb-8 text-center text-sm text-gray-500">
      為了您的帳號安全，
      <br />
      請綁定手機號碼以完成註冊。
    </p>

    <form @submit.prevent="handleBind">
      <BaseInput v-model="phone" label="手機號碼" placeholder="0912345678" type="tel" />

      <button
        type="submit"
        class="w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
      >
        綁定並繼續
      </button>
    </form>
  </div>
</template>
