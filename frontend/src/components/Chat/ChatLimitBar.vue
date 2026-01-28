<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const store = useChatStore()
const props = defineProps({
  chat: { type: Object, required: true }
})

const remaining = computed(() => {
  if (props.chat.type === 'knock') return 3 - store.myMessageCount
  if (props.chat.type === 'match') return 10 - store.myMessageCount
  return 0
})

const isLimitReached = computed(() => store.isLimitReached)
</script>

<template>
  <div v-if="store.chatMode === 'PET_MODE'" class="w-full shrink-0">
    <!-- 狀態 1: 互動已達上限 -->
    <div
      v-if="isLimitReached"
      class="border-border-default bg-bg-base flex flex-col items-center gap-2 border-t p-4"
    >
      <div class="text-brand-primary text-sm font-bold">互動已達上限，是否成為好友？</div>
      <div class="flex gap-4">
        <!-- 這裡暫時用 deleteChat 代表拒絕，實務上可能會有 rejectFriend -->
        <button
          class="rounded-full bg-zinc-200 px-6 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-300"
          @click="store.deleteChat(chat.id)"
        >
          拒絕
        </button>
        <button
          class="bg-brand-primary hover:bg-brand-primary/90 rounded-full px-6 py-1.5 text-sm font-medium text-white shadow-sm"
          @click="store.becomeFriend(chat.id)"
        >
          成為好友
        </button>
      </div>
    </div>

    <!-- 狀態 2: 互動倒數提示 -->
    <div
      v-else
      class="flex items-center justify-center border-b border-blue-100 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-600"
    >
      <span v-if="chat.type === 'knock'">
        🔔 敲敲門試聊：剩餘 {{ remaining }} 句 (限制 30 字)
      </span>
      <span v-else> 🔔 配對互動中：剩餘 {{ remaining }} 句 (限制 30 字) </span>
    </div>
  </div>
</template>
