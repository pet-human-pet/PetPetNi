<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import defaultAvatar from '@/assets/images/avatar-cat.jpg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const { profile } = storeToRefs(authStore)

// 判斷是否顯示頭像 (首頁與個人頁面隱藏)
// 原邏輯: !['Profile'].includes(route.name)
const shouldShowAvatar = computed(() => !['Profile'].includes(route.name))

function goProfile() {
  router.push({ name: 'Profile' })
}
</script>

<template>
  <button
    v-if="shouldShowAvatar"
    type="button"
    class="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-white p-0 transition-transform duration-300 shadow-card  hover:scale-110"
    title="個人頁面"
    @click="goProfile"
  >
    <img
      :src="profile?.avatar_url || defaultAvatar"
      class="h-full w-full object-cover"
      alt="User Avatar"
    />
  </button>
</template>
