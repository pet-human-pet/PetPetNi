<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useTextareaAutosize } from '@vueuse/core'

const store = useChatStore()

defineProps({
  placeholder: { type: String, default: '輸入訊息...' }
})

const emit = defineEmits(['toast'])
const messageInput = ref('')
const { textarea } = useTextareaAutosize({ input: messageInput })

const effectiveChatMode = computed(() => {
  if (store.currentCategory === 'ai') return 'REAL_MODE'
  return store.chatMode
})

const replyingMsg = computed(() => store.replyingMsg)

const setInput = (text) => {
  messageInput.value = text
  handleSend()
}

defineExpose({ setInput })

const charCount = computed(() => messageInput.value.length)
const isOverLimit = computed(() => {
  return effectiveChatMode.value === 'PET_MODE' && charCount.value > 30
})

const clearReply = () => {
  store.replyingMsg = null
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  const text = messageInput.value.trim()
  if (!text) return

  // 組件攔截發送並顯示提示，不去打擾store發API
  if (isOverLimit.value) {
    emit('toast', '訊息超過 30 字限制囉！')
    return
  }

  const result = store.sendMessage(text, false, replyingMsg.value)
  
  if (result.success) {
    messageInput.value = ''
    clearReply()
  } else {
    emit('toast', result.error)
  }
}

const handleImageUpload = () => {
  if (effectiveChatMode.value === 'PET_MODE') {
     emit('toast', '寵物模式下無法傳送圖片喔！')
     return
  }
  const result = store.sendMessage('https://via.placeholder.com/150', true)
  if (!result.success) emit('toast', result.error)
}
</script>

<template>
  <div class="c-chat-input-container">
    <div
      v-if="replyingMsg"
      class="c-chat-reply-bar"
    >
      <div class="truncate text-xs text-fg-secondary">
        <span class="font-bold">回覆：</span>{{ replyingMsg.content }}
      </div>
      <button
        type="button"
        class="text-fg-muted hover:text-fg-primary"
        @click="clearReply"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="flex items-end gap-3">
      <div class="c-chat-input-field">
        <div class="flex w-full items-center px-3 py-2 md:px-4">
          <textarea
            ref="textarea"
            v-model="messageInput"
            :placeholder="placeholder"
            class="max-h-32 min-h-6 flex-1 resize-none border-none bg-transparent text-sm text-fg-primary outline-none placeholder:text-xs md:placeholder:text-sm"
            @keydown="handleKeydown"
          ></textarea>

          <div
            v-if="effectiveChatMode === 'PET_MODE'"
            class="mr-2 text-[10px]"
            :class="isOverLimit ? 'font-bold text-red-500' : 'text-fg-muted'"
          >
            {{ charCount }}/30
          </div>

          <button
            type="button"
            class="ml-2 cursor-pointer text-fg-muted hover:text-brand-primary"
            title="上傳圖片"
            @click="handleImageUpload"
          >
            <i class="fa-solid fa-image"></i>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-md transition-transform hover:scale-95 hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!messageInput.trim() && !replyingMsg"
        @click="handleSend"
      >
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>
