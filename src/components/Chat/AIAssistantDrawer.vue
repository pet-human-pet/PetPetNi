<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useAIStore } from '@/stores/ai'
import { useChatStore } from '@/stores/chat'
import { useTextareaAutosize, useDraggable, useWindowSize } from '@vueuse/core'

const aiStore = useAIStore()
const chatStore = useChatStore() // 用於取得個人資料 (頭像/名稱)

onMounted(() => {
  aiStore.loadSessions()
})

const messageInput = ref('')
const msgContainer = ref(null)
const { textarea } = useTextareaAutosize({ input: messageInput })

const isHistoryView = ref(false)

// --- 拖拽功能實作 ---
const handleRef = ref(null)
const { height: windowHeight } = useWindowSize()

// 初始化位置在螢幕中間偏下
const { y, isDragging } = useDraggable(handleRef, {
  initialValue: { x: 0, y: window.innerHeight * 0.4 },
  axis: 'y',
  preventDefault: true,
  onMove: (pos) => {
    // 拖動中即時攔截：上方 0px，下方保留手柄高度
    const minY = 0
    const maxY = windowHeight.value - 60
    if (pos.y < minY) pos.y = minY
    if (pos.y > maxY) pos.y = maxY
  }
})

// 自動捲動到底部
const scrollToBottom = async () => {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

watch(() => aiStore.activeChat?.msgs.length, scrollToBottom)
watch(() => aiStore.activeSessionId, scrollToBottom)
watch(
  () => aiStore.isDrawerOpen,
  (val) => {
    if (val) scrollToBottom()
  }
)

const handleSend = () => {
  const text = messageInput.value.trim()
  if (!text) return

  aiStore.sendMessage(text)
  messageInput.value = ''
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleStartFeature = (prompt) => {
  aiStore.startAiFeature(prompt)
}

const handleNewChat = () => {
  aiStore.createAiChat()
  isHistoryView.value = false
}

const selectSession = (id) => {
  aiStore.openSession(id)
  isHistoryView.value = false
}

const handleDeleteSession = (id) => {
  aiStore.deleteSession(id)
}
</script>

<template>
  <!-- 全域固定容器，不擋點擊 -->
  <div class="pointer-events-none fixed inset-0 z-100 overflow-hidden">
    <!-- 1. 側邊觸發手柄 (Handle) - 支持拖拽 -->
    <div
      ref="handleRef"
      class="pointer-events-auto fixed right-0 flex cursor-grab touch-none flex-col items-end select-none active:cursor-grabbing"
      :class="{ 'transition-transform duration-300': !isDragging }"
      :style="{
        top: `${y}px`,
        transform: aiStore.isDrawerOpen ? 'translateX(400px)' : 'translateX(0)'
      }"
    >
      <button
        class="bg-brand-primary shadow-brand-primary/20 group flex h-14 w-8 flex-col items-center justify-center rounded-l-2xl border-y border-l border-white/20 text-white shadow-xl transition-all hover:w-10"
        @click="aiStore.toggleDrawer()"
      >
        <i class="fa-solid fa-wand-magic-sparkles text-sm group-hover:scale-110"></i>
        <span class="mt-1 text-[10px] font-black tracking-widest [writing-mode:vertical-lr]"
          >波波</span
        >
      </button>
    </div>

    <!-- 2. 背景遮罩 - 點擊關閉抽屜 -->
    <div
      v-if="aiStore.isDrawerOpen"
      class="pointer-events-auto absolute inset-0"
      @click="aiStore.closeDrawer()"
    ></div>

    <!-- 3. AI 抽屜 (Drawer) -->
    <div
      class="bg-bg-surface border-brand-primary pointer-events-auto absolute top-24 right-0 flex h-[70vh] w-[310px] flex-col overflow-hidden rounded-l-4xl border-[5px] shadow-2xl transition-transform duration-500 ease-out md:w-[400px]"
      :class="aiStore.isDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div
        class="border-border-default flex h-16 shrink-0 items-center justify-between border-b px-4"
      >
        <div class="flex items-center gap-2">
          <button v-if="isHistoryView" class="text-fg-secondary p-2" @click="isHistoryView = false">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div
            v-else
            class="bg-brand-primary/10 flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <i class="fa-solid fa-wand-magic-sparkles text-brand-primary"></i>
          </div>
          <span class="text-fg-primary font-black">{{
            isHistoryView ? '對話歷史' : '波波溝通師'
          }}</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="text-fg-secondary hover:bg-bg-base h-8 w-8 rounded-full"
            @click="isHistoryView = !isHistoryView"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button
            class="text-fg-secondary hover:bg-bg-base h-8 w-8 rounded-full"
            @click="aiStore.closeDrawer()"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- History View -->
      <div v-if="isHistoryView" class="no-scrollbar bg-bg-base flex-1 overflow-y-auto p-4">
        <button
          class="bg-brand-primary/10 text-brand-primary mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95"
          @click="handleNewChat"
        >
          <i class="fa-solid fa-plus"></i> 開啟新對話
        </button>
        <div class="space-y-2">
          <div
            v-for="chat in aiStore.history"
            :key="chat.id"
            class="group bg-bg-surface border-border-default hover:border-brand-primary/30 flex cursor-pointer items-center justify-between rounded-xl border p-3 hover:shadow-sm"
            :class="
              aiStore.activeSessionId === chat.id
                ? 'ring-brand-primary/20 bg-brand-primary/2 ring-2'
                : ''
            "
            @click="selectSession(chat.id)"
          >
            <div class="min-w-0 flex-1">
              <div class="text-fg-primary truncate text-sm font-bold">
                {{ chat.title || '新對話' }}
              </div>
              <div class="text-fg-muted text-[10px]">
                {{ new Date(chat.timestamp).toLocaleString() }}
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                class="text-fg-muted h-7 w-7 rounded-full opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                @click.stop="handleDeleteSession(chat.id)"
              >
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
              <i
                class="fa-solid fa-chevron-right text-fg-muted text-xs transition-transform group-hover:translate-x-1"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat View -->
      <template v-else>
        <!-- Content Container -->
        <div ref="msgContainer" class="no-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
          <!-- Welcome Section -->
          <div
            v-if="!aiStore.activeChat || aiStore.activeChat.msgs.length === 0"
            class="flex h-full flex-col items-center justify-center py-10 text-center"
          >
            <div
              class="bg-brand-primary/5 ring-brand-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-3xl p-4 ring-1"
            >
              <img :src="aiStore.aiDb.agent.avatar" class="h-full w-full object-contain" />
            </div>
            <h3 class="text-fg-primary mb-2 text-xl font-black">我是寵物溝通師 波波</h3>
            <p class="text-fg-secondary mb-10 text-sm leading-relaxed">
              {{ aiStore.aiDb.agent.description }}
            </p>

            <div class="grid w-full grid-cols-1 gap-3 px-4 md:grid-cols-2">
              <button
                v-for="prompt in aiStore.aiDb.agent.defaultPrompts"
                :key="prompt.text"
                class="bg-bg-base border-border-default hover:border-brand-primary group flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-white hover:shadow-md"
                @click="handleStartFeature(prompt.text)"
              >
                <div
                  class="bg-bg-surface text-brand-primary group-hover:bg-brand-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-colors group-hover:text-white"
                >
                  <i class="fa-solid text-xs" :class="prompt.icon"></i>
                </div>
                <div class="text-fg-primary text-xs leading-tight font-bold">{{ prompt.text }}</div>
              </button>
            </div>
          </div>

          <!-- Message List -->
          <template v-else>
            <div
              v-for="msg in aiStore.activeChat.msgs"
              :key="msg.id"
              class="flex gap-3"
              :class="msg.sender === 'me' ? 'flex-row-reverse' : ''"
            >
              <div
                class="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 bg-gray-100"
              >
                <img
                  :src="
                    msg.sender === 'me' ? chatStore.db.myProfile.avatar : aiStore.aiDb.agent.avatar
                  "
                  class="h-full w-full object-cover"
                />
              </div>
              <div
                class="max-w-[80%] space-y-1"
                :class="msg.sender === 'me' ? 'text-right' : 'text-left'"
              >
                <div
                  class="inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm"
                  :class="
                    msg.sender === 'me'
                      ? 'bg-brand-primary rounded-tr-none text-white'
                      : 'bg-bg-base text-fg-primary rounded-tl-none'
                  "
                >
                  {{ msg.content }}
                </div>
              </div>
            </div>

            <!-- Loading 狀態 -->
            <div v-if="aiStore.isLoading" class="flex gap-3">
              <div
                class="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 bg-gray-100"
              >
                <img :src="aiStore.aiDb.agent.avatar" class="h-full w-full object-cover" />
              </div>
              <div class="max-w-[80%] space-y-1">
                <div
                  class="bg-bg-base text-fg-muted inline-block rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm"
                >
                  <i class="fa-solid fa-sparkles fa-spin mr-2"></i>波波正在通靈中...
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Input Area -->
        <div class="border-border-default bg-bg-surface shrink-0 border-t p-4 pt-3">
          <div
            class="bg-bg-base border-border-default focus-within:border-brand-primary focus-within:ring-brand-primary/10 flex w-full items-center gap-2 rounded-2xl border px-3 py-1.5 transition-all focus-within:ring-2"
          >
            <textarea
              ref="textarea"
              v-model="messageInput"
              rows="1"
              placeholder="詢問波波..."
              class="max-h-32 flex-1 resize-none bg-transparent py-1 text-base outline-none md:text-sm"
              @keydown="handleKeydown"
            ></textarea>
            <button
              class="bg-brand-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all active:scale-95 disabled:opacity-30"
              :disabled="!messageInput.trim()"
              @click="handleSend"
            >
              <i class="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
          <div class="text-fg-muted mt-2 text-center text-[10px]">AI 生成內容僅供參考。</div>
        </div>
      </template>
    </div>
  </div>
</template>
