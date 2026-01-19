<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const uiStore = useUIStore()

const menuOpen = computed(() => uiStore.isMenuOpen)

function goChat() {
  router.push({ name: 'chat-test' })
}
</script>

<template>
  <button
    class="c-header-btn relative"
    title="訊息"
    type="button"
    :class="{ 'pointer-events-none opacity-40': menuOpen }"
    @click="goChat"
  >
    <i class="fa-regular fa-comment-dots"></i>
    <!-- TODO: 當有未讀訊息時顯示，目前為靜態顯示 -->
    <span class="bg-func-danger absolute top-2 right-2 h-2 w-2 rounded-full border border-white" />
  </button>
</template>
