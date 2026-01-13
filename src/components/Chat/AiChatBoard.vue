<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat.js'
import { useToast } from '@/composables/useToast'
import { useScreen } from '@/composables/useScreen'
import ChatInputArea from '@/components/Chat/ChatInputArea.vue'

const store = useChatStore()
const toast = useToast()
const { isMobile } = useScreen()

const msgContainer = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

watch(() => store.activeChat?.msgs.length, scrollToBottom)
watch(() => store.activeChatId, scrollToBottom)

const handleAiFeatureClick = (text) => store.startAiFeature(text)
const handleToast = (msg) => toast.error(msg)

const handleNewChat = () => {
  store.createAiChat()
  store.isAiDrawerOpen = false
}

const handleHistoryClick = (chatId) => {
  store.openChat(chatId)
  store.isAiDrawerOpen = false
}

const handleDeleteHistory = (chat) => {
  store.deleteChat(chat.id)
}
</script>

<template>
  <div class="relative flex h-full flex-col md:pb-0">
    <!-- Header -->
    <div
      class="border-border-default bg-bg-surface z-10 flex h-17.5 shrink-0 items-center justify-between border-b px-4 md:px-6"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button
          class="text-fg-secondary hover:text-fg-primary -ml-2 shrink-0 p-2 md:hidden"
          @click="store.isAiDrawerOpen = true"
        >
          <i class="fa-solid fa-bars text-lg"></i>
        </button>

        <i
          v-if="!isMobile"
          class="fa-solid fa-chevron-left text-fg-primary hidden cursor-pointer text-xl md:block"
          @click="store.activeChatId = null"
        ></i>
        <span class="text-fg-primary truncate font-bold">{{
          store.activeChat.title || store.activeChat.name
        }}</span>
        <span
          class="bg-brand-primary/10 text-brand-primary shrink-0 rounded px-2 py-0.5 text-xs font-bold"
          >Beta</span
        >
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="store.isAiDrawerOpen" class="fixed inset-0 z-100 flex md:hidden">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        @click="store.isAiDrawerOpen = false"
      ></div>

      <div class="bg-bg-surface animate-slide-right relative flex h-full w-64 flex-col shadow-2xl">
        <div class="border-border-default flex items-center justify-between border-b p-4">
          <div class="flex items-center gap-2">
            <button
              class="text-fg-primary hover:text-brand-primary"
              @click="
                store.activeChatId = null
                store.isAiDrawerOpen = false
              "
            >
              <i class="fa-solid fa-chevron-left text-lg"></i>
            </button>
            <span class="text-lg font-bold">歷史紀錄</span>
          </div>
          <button class="text-fg-secondary p-2" @click="store.isAiDrawerOpen = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="no-scrollbar flex-1 overflow-y-auto p-2">
          <div
            v-for="chat in store.aiDb.history"
            :key="chat.id"
            class="mb-1 flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors"
            :class="
              store.activeChatId === chat.id
                ? 'bg-bg-base text-brand-primary'
                : 'hover:bg-bg-base text-fg-primary'
            "
            @click="handleHistoryClick(chat.id)"
          >
            <span class="truncate text-sm font-medium">{{ chat.title || '未命名對話' }}</span>
            <button
              class="text-fg-muted p-2 hover:text-red-500"
              @click.stop="handleDeleteHistory(chat)"
            >
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </div>

        <!-- FAB -->
        <div class="border-border-default border-t p-4">
          <button
            class="bg-brand-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-md transition-transform active:scale-95"
            @click="handleNewChat"
          >
            <i class="fa-solid fa-plus"></i> 開啟新對話
          </button>
        </div>
      </div>
    </div>

    <div ref="msgContainer" class="bg-bg-base no-scrollbar relative flex-1 overflow-y-auto p-6">
      <!-- Welcome State: 當訊息為空時 -->
      <div
        v-if="store.activeChat.msgs.length === 0"
        class="flex h-full flex-col items-center justify-center text-center"
      >
        <div
          class="border-border-default mb-4 h-20 w-20 shrink-0 rounded-full border bg-white p-4 shadow-lg"
        >
          <img :src="store.aiDb.agent.avatar" class="h-full w-full object-contain" />
        </div>
        <h2 class="text-fg-primary mb-2 text-xl font-bold">我是{{ store.aiDb.agent.name }}</h2>
        <p class="text-fg-secondary mb-8 text-sm">{{ store.aiDb.agent.description }}</p>

        <div class="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
          <button
            v-for="prompt in store.aiDb.agent.defaultPrompts"
            :key="prompt.text"
            class="c-ai-prompt-btn c-ai-prompt-btn--lg shadow-sm"
            @click="handleAiFeatureClick(prompt.text)"
          >
            <div class="c-ai-prompt-btn__icon">
              <i class="fa-solid" :class="prompt.icon"></i>
            </div>
            <span>{{ prompt.text }}</span>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div v-else class="space-y-8">
        <div
          v-for="msg in store.activeChat.msgs"
          :key="msg.id"
          class="flex gap-4"
          :class="msg.sender === 'me' ? 'flex-row-reverse' : ''"
        >
          <div class="mt-1 shrink-0">
            <div
              class="border-border-default h-8 w-8 rounded-full border bg-cover"
              :style="{
                backgroundImage: `url(${msg.sender === 'me' ? store.db.myProfile.avatar : store.activeChat.avatar})`
              }"
            ></div>
          </div>

          <div class="min-w-0 flex-1 pt-1" :class="msg.sender === 'me' ? 'text-right' : ''">
            <div class="text-fg-primary mb-1 text-sm font-bold">
              {{ msg.sender === 'me' ? store.db.myProfile.name : store.activeChat.name }}
            </div>
            <div
              class="inline-block rounded-2xl px-4 py-3 text-left text-sm leading-relaxed shadow-sm transition-opacity hover:opacity-95"
              :class="
                msg.sender === 'me'
                  ? 'bg-brand-primary/10 text-fg-primary'
                  : 'bg-bg-surface text-fg-primary'
              "
            >
              {{ msg.content || msg.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full shrink-0">
      <ChatInputArea placeholder="AI 可能產生錯誤，請查核重要訊息。" @toast="handleToast" />
    </div>
  </div>
</template>
