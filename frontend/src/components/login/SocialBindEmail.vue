<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseInput from '@/components/Form/BaseInput.vue'

const emit = defineEmits(['success'])
const route = useRoute()

const email = ref('')
const tempToken = ref('')

onMounted(() => {
  // 從 URL 取得臨時 Token
  tempToken.value = route.query.temp_token || ''
})

// TODO: 串接後端 API - 綁定 Email
const handleBind = async () => {
  if (!email.value) {
    alert('請輸入有效的 Email')
    return
  }

  if (!tempToken.value) {
    alert('無效的綁定請求，請重新登入')
    return
  }

  try {
    const response = await fetch('/api/auth/bind-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: tempToken.value,
        email: email.value
      })
    })

    if (!response.ok) throw new Error('Email binding failed')

    const data = await response.json()

    // 儲存 JWT Token
    localStorage.setItem('token', data.token)

    // 通知父元件綁定成功
    emit('success')
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Email binding error:', error)
    }
    alert('Email 綁定失敗，請重試')
  }
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
