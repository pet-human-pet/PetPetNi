<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useTextareaAutosize } from '@vueuse/core'
import { useImageUpload } from '@/composables/useImageUpload'

const store = useChatStore()
const { compressImage, uploadToCloudinary } = useImageUpload()

defineProps({
  placeholder: { type: String, default: '輸入訊息...' }
})

const emit = defineEmits(['toast'])
const messageInput = ref('')
const fileInput = ref(null) // 檔案選擇器引用
const isUploading = ref(false) // 上傳中狀態
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

// 觸發檔案選擇
const triggerFileInput = () => {
  if (effectiveChatMode.value === 'PET_MODE') {
    emit('toast', '寵物模式下無法傳送圖片喔！')
    return
  }
  if (isUploading.value) return
  fileInput.value.click()
}

// 處理檔案選擇與上傳
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 基本驗證
  if (!file.type.startsWith('image/')) {
    emit('toast', '請選擇圖片檔案')
    return
  }

  isUploading.value = true
  try {
    // 1. 壓縮
    const { blob } = await compressImage(file)

    // 2. 上傳到 Cloudinary
    const { url } = await uploadToCloudinary(blob)

    // 3. 發送訊息 (isImage = true)
    const result = store.sendMessage(url, true, replyingMsg.value)
    if (result.success) {
      clearReply()
    } else {
      emit('toast', result.error)
    }
  } catch (error) {
    console.error('❌ Image upload failed:', error)
    emit('toast', error.message || '圖片傳送失敗')
  } finally {
    isUploading.value = false
    // 清空 input 讓同一個檔案可以連續選取
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="c-chat-input-container">
    <div v-if="replyingMsg" class="c-chat-reply-bar">
      <div class="text-fg-secondary truncate text-xs">
        <span class="font-bold">回覆：</span>{{ replyingMsg.content }}
      </div>
      <button type="button" class="text-fg-muted hover:text-fg-primary" @click="clearReply">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="flex items-end gap-3">
      <div class="c-chat-input-field">
        <div class="flex w-full items-center px-3 py-2 md:px-4">
          <!-- 隱藏的檔案選擇器 -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />

          <textarea
            ref="textarea"
            v-model="messageInput"
            :placeholder="placeholder"
            class="text-fg-primary max-h-32 min-h-6 flex-1 resize-none border-none bg-transparent text-sm outline-none placeholder:text-xs md:placeholder:text-sm"
            @keydown="handleKeydown"
          ></textarea>

          <div
            v-if="effectiveChatMode === 'PET_MODE'"
            class="mr-2 text-[10px]"
            :class="isOverLimit ? 'font-bold text-red-500' : 'text-fg-muted'"
          >
            {{ charCount }}/30
          </div>

          <!-- 上傳按鈕 -->
          <button
            type="button"
            class="text-fg-muted hover:text-brand-primary ml-2 cursor-pointer disabled:opacity-30"
            :title="isUploading ? '上傳中...' : '上傳圖片'"
            :disabled="isUploading"
            @click="triggerFileInput"
          >
            <i v-if="!isUploading" class="fa-solid fa-image"></i>
            <i v-else class="fa-solid fa-spinner fa-spin"></i>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="bg-brand-primary hover:bg-brand-primary/90 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="(!messageInput.trim() && !replyingMsg) || isUploading"
        @click="handleSend"
      >
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>
