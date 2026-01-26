<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat.js'
import { useToast } from '@/composables/useToast'
import { ref, onMounted } from 'vue'
import { useScrollLock } from '@vueuse/core'
import ChatNavigation from '@/components/Chat/ChatNavigation.vue'
import ChatListSection from '@/components/Chat/ChatListSection.vue'
import ChatMessageArea from '@/components/Chat/ChatMessageArea.vue'

const router = useRouter()
const route = useRoute()
const store = useChatStore()
const toast = useToast()
const isMoreMenuOpen = ref(false)

const isLocked = useScrollLock(document.body)
isLocked.value = true

const goToPage = (routeName) => {
  if (routeName === 'match') {
    toast.info('配對媒合頁面開發中！')
    return
  }
  router.push({ name: routeName })
}

onMounted(async () => {
  const roomId = route.params.roomId
  if (roomId) {
    try {
      // 根據 ID 開啟對話
      await store.openChat(roomId)

      // 二次檢查：如果開啟後 activeChatId 仍為 null (代表找不到)
      if (!store.activeChatId) {
        throw new Error('Room not found')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Invalid Room ID or join failed:', err)
      toast.error('找不到該聊天室，已回到列表')
      router.replace({ name: 'chat' }) // 導回列表模式 (無參數)
    }
  }
})
</script>

<template>
  <div
    class="bg-bg-surface relative flex h-dvh w-screen flex-col overflow-hidden overscroll-none font-sans md:flex-row"
  >
    <button
      class="text-fg-secondary hover:bg-bg-base hover:text-brand-primary absolute top-4 right-4 z-90 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-all"
      @click="router.back()"
    >
      <i class="fa-solid fa-xmark text-lg"></i>
    </button>

    <ChatNavigation v-model:is-more-menu-open="isMoreMenuOpen" @go-to-page="goToPage" />

    <ChatListSection />

    <ChatMessageArea />
  </div>
</template>
