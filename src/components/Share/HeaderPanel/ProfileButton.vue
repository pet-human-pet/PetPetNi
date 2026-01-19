<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()

const defaultAvatar =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'

const menuOpen = computed(() => uiStore.isMenuOpen)

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
    class="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-white p-0 transition-opacity duration-300"
    title="個人頁面"
    :class="{ 'pointer-events-none opacity-40': menuOpen }"
    @click="goProfile"
  >
    <img :src="defaultAvatar" class="h-full w-full object-cover" alt="User Avatar" />
  </button>
</template>
