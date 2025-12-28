<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat.js'
import ChatRules from '@/components/Social/ChatRules.vue' // 引入 ChatRules 元件

const router = useRouter()
const store = useChatStore()
const messageInput = ref('')
const msgContainer = ref(null)
const timeLeft = ref('')

// --- 左側導航資料 ---
const navItems = [
  { key: 'community', icon: 'fa-users', label: '社群' },
  { key: 'match', icon: 'fa-heart', label: '個人私訊', badge: 1 },
  { key: 'event', icon: 'fa-calendar-check', label: '活動揪團' },
  { key: 'stranger', icon: 'fa-user-secret', label: '敲敲門' },
  { key: 'ai', icon: 'fa-robot', label: 'AI 溝通師' }
]

// --- 右鍵選單邏輯 (ChatListPanel刪除退出置頂等) ---
const contextMenu = ref({ visible: false, x: 0, y: 0, chatId: null, chatType: null, pinned: false })

const openContextMenu = (e, chat) => {
  e.preventDefault()
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    chatId: chat.id,
    chatType: chat.type,
    pinned: chat.pinned
  }
}
const closeContextMenu = () => {
  contextMenu.value.visible = false
}
const handleMenuAction = (action) => {
  const { chatId } = contextMenu.value
  if (action === 'pin') store.togglePin(chatId)
  if (action === 'delete') {
    if (confirm('確定要刪除/退出嗎？')) store.deleteChat(chatId)
  }
  closeContextMenu()
}
onMounted(() => window.addEventListener('click', closeContextMenu))
onUnmounted(() => window.removeEventListener('click', closeContextMenu))

// --- 聊天室邏輯 (ChatRoomPanel句數限制) ---
const usageCount = computed(() =>
  store.activeChat ? store.activeChat.msgs.filter((m) => m.sender === 'me').length : 0
)
const charCount = computed(() => messageInput.value.length)
const isOverCharLimit = computed(() => store.activeChat?.type === 'knock' && charCount.value > 30)
const isInputDisabled = computed(() => {
  const chat = store.activeChat
  if (!chat) return true
  if (chat.type === 'knock') {
    if (chat.status === 'pending') return true
    if (chat.status === 'trial' && usageCount.value >= 3) return true
  }
  if (chat.type === 'match' && chat.status === 'matching' && usageCount.value >= 10) return true
  return false
})
// 發送訊息
const handleSend = () => {
  const result = store.sendMessage(messageInput.value)
  if (result.success) messageInput.value = ''
  else if (result.error) alert(result.error)
}

const handleImageUpload = () => {
  const result = store.sendMessage('[圖片]', true)
  if (!result.success && result.error) alert(result.error)
}

const reportMessage = () => {
  if (confirm('確定要檢舉此訊息嗎？')) alert('已收到檢舉，系統將審核。')
}

// 捲動到底部
watch(
  () => store.activeChat?.msgs.length,
  async () => {
    await nextTick()
    if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
)

// 活動倒數計時
let timer
const updateTime = () => {
  if (store.activeChat?.type === 'event' && store.activeChat.expiryDate) {
    const diff = new Date(store.activeChat.expiryDate) - new Date()
    if (diff > 0) {
      const hrs = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      timeLeft.value = `剩餘 ${hrs} 小時 ${mins} 分鐘`
    } else timeLeft.value = '活動已結束'
  } else timeLeft.value = ''
}
watch(
  () => store.activeChatId,
  () => {
    updateTime()
    clearInterval(timer)
    if (store.activeChat?.type === 'event') timer = setInterval(updateTime, 60000)
  }
)
</script>

<template>
  <ChatRules />
  <div
    class="bg-bg-surface relative flex h-screen w-screen flex-col-reverse overflow-hidden font-sans md:flex-row"
  >
    <!-- Close Button -->
    <button
      class="bg-bg-surface/80 text-fg-secondary hover:bg-bg-base hover:text-brand-accent absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all max-md:top-2 max-md:right-2"
      title="關閉"
      type="button"
      @click="router.back()"
    >
      <i class="fa-solid fa-xmark text-xl"></i>
    </button>

    <!-- Left Nav -->
    <div
      class="bg-bg-surface border-border-default md:bg-bg-base z-50 flex h-15 w-full shrink-0 flex-row items-center justify-around border-t md:z-auto md:h-full md:w-20 md:flex-col md:justify-start md:border-t-0 md:border-r md:pt-7.5"
    >
      <div
        v-for="item in navItems"
        :key="item.key"
        class="text-fg-muted hover:text-brand-primary relative flex h-full w-full cursor-pointer flex-col items-center justify-center transition-all duration-200 hover:bg-black/5 md:mb-3.75 md:h-15 md:w-15 md:flex-none md:rounded-xl"
        :class="{
          'bg-brand-primary! shadow-brand-primary/30 text-white! shadow-lg':
            store.currentCategory === item.key
        }"
        @click="store.switchCategory(item.key)"
      >
        <i class="fa-solid mb-1 text-[20px]" :class="item.icon"></i>
        <div class="text-[10px] leading-none font-bold">{{ item.label }}</div>
        <div
          v-if="item.badge"
          class="bg-brand-accent border-bg-base absolute top-1.25 right-1.25 flex h-4 w-4 items-center justify-center rounded-full border-2 text-[9px] text-white"
        >
          {{ item.badge }}
        </div>
      </div>
    </div>

    <!-- Middle Chat List -->
    <div
      class="bg-bg-surface md:border-border-default relative flex flex-1 shrink-0 flex-col pb-15 md:h-full md:w-[320px] md:flex-none md:border-r md:pb-0"
    >
      <div class="shrink-0 p-4">
        <input
          type="text"
          placeholder="搜尋對話..."
          class="bg-bg-base text-fg-primary placeholder:text-fg-muted w-full rounded-full px-4 py-2 text-sm outline-none"
        />
      </div>

      <div class="no-scrollbar flex-1 overflow-y-auto px-2">
        <div
          v-for="chat in store.currentChatList"
          :key="chat.id"
          class="hover:bg-bg-base group relative mb-1 flex cursor-pointer items-center rounded-xl p-3 transition-colors"
          :class="{ 'bg-bg-base': store.activeChatId === chat.id, 'bg-bg-base/50': chat.pinned }"
          @click="store.openChat(chat.id)"
          @contextmenu="openContextMenu($event, chat)"
        >
          <div class="relative">
            <div
              class="h-12 w-12 rounded-full bg-gray-200 bg-cover bg-center"
              :style="{ backgroundImage: `url(${chat.avatar})` }"
            ></div>
            <div
              v-if="store.currentCategory === 'match' && chat.status !== 'pending'"
              class="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
            ></div>
          </div>
          <div class="ml-3 min-w-0 flex-1">
            <div class="mb-1 flex items-center justify-between">
              <div class="text-fg-primary flex items-center gap-1 text-sm font-bold">
                <i
                  v-if="chat.pinned"
                  class="fa-solid fa-thumbtack text-brand-primary rotate-45 text-xs"
                ></i>
                <span class="truncate">{{ chat.name }}</span>
                <span
                  v-if="chat.status === 'matching'"
                  class="rounded bg-orange-100 px-1 text-[10px] text-orange-500"
                  >配對</span
                >
                <span
                  v-if="chat.status === 'friend'"
                  class="rounded bg-green-100 px-1 text-[10px] text-green-600"
                  >好友</span
                >
                <span
                  v-if="chat.type === 'knock'"
                  class="rounded bg-purple-100 px-1 text-[10px] text-purple-600"
                  >敲敲門</span
                >
              </div>
              <span class="text-fg-muted text-[10px] whitespace-nowrap">{{
                chat.msgs.length ? chat.msgs[chat.msgs.length - 1].time : ''
              }}</span>
            </div>
            <div class="text-fg-secondary h-4 truncate text-xs">
              {{ chat.msgs.length ? chat.msgs[chat.msgs.length - 1].text : '點擊開始聊天' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Context Menu -->
      <div
        v-if="contextMenu.visible"
        class="bg-bg-surface border-border-default text-fg-primary fixed z-9999 w-32 rounded-lg border py-2 text-sm shadow-xl"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      >
        <div
          class="hover:bg-bg-base flex cursor-pointer items-center gap-2 px-4 py-2"
          @click="handleMenuAction('pin')"
        >
          <i class="fa-solid fa-thumbtack text-fg-muted"></i>
          {{ contextMenu.pinned ? '取消置頂' : '置頂' }}
        </div>
        <div
          class="border-border-default mt-1 flex cursor-pointer items-center gap-2 border-t px-4 py-2 text-red-500 hover:bg-red-50"
          @click="handleMenuAction('delete')"
        >
          <i class="fa-solid fa-trash-can"></i> 刪除/退出
        </div>
      </div>
    </div>

    <!-- Right Chat Area -->
    <div
      class="bg-bg-base fixed relative inset-0 z-20 flex h-full min-w-0 flex-1 translate-x-full transform flex-col transition-transform duration-300 md:static md:translate-x-0"
      :class="{ 'translate-x-0!': store.activeChatId }"
    >
      <div
        v-if="!store.activeChat"
        class="text-fg-muted hidden h-full flex-col items-center justify-center md:flex"
      >
        <i class="fa-solid fa-comments mb-4 text-5xl text-gray-200"></i>
        <p>請選擇一個對話開始聊天</p>
      </div>

      <div v-else class="relative flex h-full flex-col">
        <div
          class="bg-bg-surface border-border-default z-10 flex h-17.5 shrink-0 items-center justify-between border-b px-6"
        >
          <div class="flex items-center gap-3">
            <i
              class="fa-solid fa-chevron-left text-fg-primary cursor-pointer text-xl md:hidden"
              @click="store.activeChatId = null"
            ></i>
            <div
              class="h-10 w-10 rounded-full bg-gray-200 bg-cover"
              :style="{ backgroundImage: `url(${store.activeChat.avatar})` }"
            ></div>
            <div>
              <div class="text-fg-primary flex items-center gap-2 font-bold">
                {{ store.activeChat.name }}
                <span v-if="timeLeft" class="rounded-full bg-red-100 px-2 text-xs text-red-500">{{
                  timeLeft
                }}</span>
              </div>
              <div class="text-fg-secondary text-xs">
                {{ store.activeChat.status === 'matching' ? '配對互動中' : '線上' }}
              </div>
            </div>
          </div>
          <div class="text-fg-muted flex gap-4 pr-10 md:pr-12">
            <i
              class="fa-solid fa-triangle-exclamation cursor-pointer hover:text-red-500"
              @click="reportMessage"
            ></i>
          </div>
        </div>

        <div
          v-if="store.activeChat.notice"
          class="flex shrink-0 items-center border-b border-yellow-100 bg-yellow-50 px-4 py-2 text-sm text-yellow-800"
        >
          <i class="fa-solid fa-bullhorn mr-2"></i> {{ store.activeChat.notice }}
        </div>

        <!-- Knock Pending Banner -->
        <div
          v-if="store.activeChat.type === 'knock' && store.activeChat.status === 'pending'"
          class="absolute bottom-0 left-0 z-20 flex w-full flex-col items-center gap-2 border-t border-red-100 bg-red-50 p-4"
        >
          <div class="text-sm font-bold text-red-500">這是一則敲敲門訊息，是否接受？</div>
          <div class="flex gap-4">
            <button
              class="rounded-full bg-gray-200 px-4 py-1 text-sm text-gray-600"
              @click="store.rejectStranger(store.activeChatId)"
            >
              刪除
            </button>
            <button
              class="bg-brand-primary rounded-full px-4 py-1 text-sm text-white"
              @click="store.acceptStranger(store.activeChatId)"
            >
              接受
            </button>
          </div>
        </div>

        <!-- Friend Request Banner -->
        <div
          v-if="
            isInputDisabled &&
            store.activeChat.status !== 'pending' &&
            store.activeChat.status !== 'friend'
          "
          class="bg-bg-base border-border-default absolute bottom-0 left-0 z-20 flex w-full flex-col items-center gap-2 border-t p-4"
        >
          <div class="text-brand-primary text-sm font-bold">互動已達上限，是否成為好友？</div>
          <div class="flex gap-4">
            <button
              class="rounded-full bg-gray-200 px-4 py-1 text-sm text-gray-600"
              @click="store.rejectFriend(store.activeChatId)"
            >
              拒絕
            </button>
            <button
              class="bg-brand-primary rounded-full px-4 py-1 text-sm text-white"
              @click="store.becomeFriend(store.activeChatId)"
            >
              成為好友
            </button>
          </div>
        </div>

        <!-- AI Prompts -->
        <div
          v-if="store.activeChat.type === 'ai'"
          class="bg-bg-base no-scrollbar border-border-default flex shrink-0 gap-2 overflow-x-auto border-b p-2"
        >
          <button
            v-for="prompt in store.activeChat.prompts"
            :key="prompt"
            class="bg-bg-surface border-brand-primary text-brand-primary hover:bg-brand-primary rounded-full border px-3 py-1 text-xs whitespace-nowrap hover:text-white"
            @click="store.sendAiPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- Message Container -->
        <div
          ref="msgContainer"
          class="bg-bg-base no-scrollbar flex-1 space-y-4 overflow-y-auto p-6"
        >
          <div
            v-for="msg in store.activeChat.msgs"
            :key="msg.id"
            class="flex"
            :class="msg.sender === 'me' ? 'justify-end' : 'justify-start'"
          >
            <div
              v-if="msg.sender !== 'me'"
              class="mr-2 h-9 w-9 rounded-full bg-gray-300 bg-cover"
              :style="{ backgroundImage: `url(${store.activeChat.avatar})` }"
            ></div>
            <div class="group relative max-w-[70%]">
              <div
                class="rounded-2xl px-4 py-3 text-sm leading-relaxed break-all shadow-sm"
                :class="
                  msg.sender === 'me'
                    ? 'bg-brand-primary rounded-br-sm text-white'
                    : 'bg-bg-surface text-fg-primary border-border-default rounded-bl-sm border'
                "
              >
                {{ msg.text }}
              </div>
              <div
                v-if="msg.sender !== 'me'"
                class="text-fg-muted absolute top-2 -right-6 hidden cursor-pointer group-hover:block hover:text-red-400"
                @click="reportMessage"
              >
                <i class="fa-solid fa-flag"></i>
              </div>
              <div
                class="text-fg-muted mt-1 text-[10px]"
                :class="msg.sender === 'me' ? 'text-right' : ''"
              >
                {{ msg.time }} <span v-if="msg.sender === 'me'">已讀 {{ msg.read }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div
          v-if="!isInputDisabled"
          class="bg-bg-surface border-border-default flex shrink-0 items-end gap-3 border-t p-4 pb-7.5 md:pb-4"
        >
          <div
            class="bg-bg-base focus-within:border-brand-primary relative flex flex-1 items-center rounded-2xl border border-transparent px-4 py-2 transition-colors"
          >
            <textarea
              v-model="messageInput"
              placeholder="輸入訊息..."
              rows="1"
              class="text-fg-primary placeholder:text-fg-muted max-h-20 flex-1 resize-none border-none bg-transparent text-sm outline-none"
              @keydown.enter.prevent="handleSend"
            ></textarea>
            <div
              v-if="store.activeChat.type === 'knock'"
              class="mr-2 text-[10px]"
              :class="isOverCharLimit ? 'font-bold text-red-500' : 'text-fg-muted'"
            >
              {{ charCount }}/30
            </div>
            <i
              class="fa-solid fa-image text-fg-muted hover:text-brand-primary ml-2 cursor-pointer"
              @click="handleImageUpload"
            ></i>
          </div>
          <button
            class="bg-btn-primary text-fg-primary flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-transform hover:scale-95"
            @click="handleSend"
          >
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
