<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat.js'

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
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, chatId: chat.id, chatType: chat.type, pinned: chat.pinned }
}
const closeContextMenu = () => { contextMenu.value.visible = false }
const handleMenuAction = (action) => {
  const { chatId } = contextMenu.value
  if (action === 'pin') store.togglePin(chatId)
  if (action === 'delete') { if(confirm('確定要刪除/退出嗎？')) store.deleteChat(chatId) }
  closeContextMenu()
}
onMounted(() => window.addEventListener('click', closeContextMenu))
onUnmounted(() => window.removeEventListener('click', closeContextMenu))

// --- 聊天室邏輯 (ChatRoomPanel句數限制) ---
const usageCount = computed(() => store.activeChat ? store.activeChat.msgs.filter(m => m.sender === 'me').length : 0)
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
  if(confirm('確定要檢舉此訊息嗎？')) alert('已收到檢舉，系統將審核。')
}

// 捲動到底部
watch(() => store.activeChat?.msgs.length, async () => {
  await nextTick()
  if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
})

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
watch(() => store.activeChatId, () => {
  updateTime()
  clearInterval(timer)
  if (store.activeChat?.type === 'event') timer = setInterval(updateTime, 60000)
})
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden bg-bg-surface flex flex-col-reverse md:flex-row font-sans">
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface/80 text-fg-secondary shadow-md transition-all hover:bg-bg-base hover:text-brand-accent max-md:top-2 max-md:right-2"
      title="關閉"
      type="button"
      @click="router.back()"
    >
      <i class="fa-solid fa-xmark text-xl"></i>
    </button>
    
    <!-- Left Nav -->
    <div
class="
      shrink-0 w-full h-15 bg-bg-surface border-t border-border-default flex flex-row justify-around items-center z-50
      md:w-20 md:h-full md:bg-bg-base md:border-t-0 md:border-r md:flex-col md:justify-start md:pt-7.5 md:z-auto
    ">
      <div 
        v-for="item in navItems" :key="item.key"
        class="
          relative flex flex-col justify-center items-center cursor-pointer text-fg-muted transition-all duration-200
          w-full h-full md:w-15 md:h-15 md:rounded-xl md:mb-3.75 md:flex-none
          hover:bg-black/5 hover:text-brand-primary
        "
        :class="{ 'bg-brand-primary! text-white! shadow-lg shadow-brand-primary/30': store.currentCategory === item.key }"
        @click="store.switchCategory(item.key)"
      >
        <i class="fa-solid text-[20px] mb-1" :class="item.icon"></i>
        <div class="text-[10px] font-bold leading-none">{{ item.label }}</div>
        <div v-if="item.badge" class="absolute top-1.25 right-1.25 w-4 h-4 bg-brand-accent text-white text-[9px] rounded-full flex justify-center items-center border-2 border-bg-base">
          {{ item.badge }}
        </div>
      </div>
    </div>

    <!-- Middle Chat List -->
    <div class="shrink-0 flex-1 bg-bg-surface flex flex-col pb-15 md:w-[320px] md:h-full md:flex-none md:border-r md:border-border-default md:pb-0 relative">
      <div class="p-4 shrink-0">
        <input type="text" placeholder="搜尋對話..." class="w-full bg-bg-base rounded-full px-4 py-2 text-sm text-fg-primary outline-none placeholder:text-fg-muted">
      </div>
      
      <div class="flex-1 overflow-y-auto px-2 no-scrollbar">
        <div 
          v-for="chat in store.currentChatList" :key="chat.id"
          class="flex items-center p-3 rounded-xl cursor-pointer hover:bg-bg-base mb-1 relative group transition-colors"
          :class="{'bg-bg-base': store.activeChatId === chat.id, 'bg-bg-base/50': chat.pinned}"
          @click="store.openChat(chat.id)"
          @contextmenu="openContextMenu($event, chat)"
        >
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" :style="{backgroundImage: `url(${chat.avatar})`}"></div>
            <div v-if="store.currentCategory === 'match' && chat.status !== 'pending'" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="font-bold text-fg-primary text-sm flex items-center gap-1">
                <i v-if="chat.pinned" class="fa-solid fa-thumbtack text-brand-primary text-xs rotate-45"></i>
                <span class="truncate">{{ chat.name }}</span>
                <span v-if="chat.status === 'matching'" class="bg-orange-100 text-orange-500 text-[10px] px-1 rounded">配對</span>
                <span v-if="chat.status === 'friend'" class="bg-green-100 text-green-600 text-[10px] px-1 rounded">好友</span>
                <span v-if="chat.type === 'knock'" class="bg-purple-100 text-purple-600 text-[10px] px-1 rounded">敲敲門</span>
              </div>
              <span class="text-[10px] text-fg-muted whitespace-nowrap">{{ chat.msgs.length ? chat.msgs[chat.msgs.length-1].time : '' }}</span>
            </div>
            <div class="text-xs text-fg-secondary truncate h-4">
              {{ chat.msgs.length ? chat.msgs[chat.msgs.length-1].text : '點擊開始聊天' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Context Menu -->
      <div v-if="contextMenu.visible" class="fixed bg-bg-surface shadow-xl rounded-lg py-2 w-32 z-9999 border border-border-default text-sm text-fg-primary" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
        <div class="px-4 py-2 hover:bg-bg-base cursor-pointer flex items-center gap-2" @click="handleMenuAction('pin')">
          <i class="fa-solid fa-thumbtack text-fg-muted"></i> {{ contextMenu.pinned ? '取消置頂' : '置頂' }}
        </div>
        <div class="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer flex items-center gap-2 border-t border-border-default mt-1" @click="handleMenuAction('delete')">
          <i class="fa-solid fa-trash-can"></i> 刪除/退出
        </div>
      </div>
    </div>

    <!-- Right Chat Area -->
    <div
class="
      flex-1 h-full min-w-0 bg-bg-base relative flex flex-col
      fixed inset-0 z-20 md:static md:translate-x-0 transition-transform duration-300 transform translate-x-full
    " :class="{ 'translate-x-0!': store.activeChatId }">
      
      <div v-if="!store.activeChat" class="hidden md:flex flex-col items-center justify-center h-full text-fg-muted">
        <i class="fa-solid fa-comments text-5xl mb-4 text-gray-200"></i>
        <p>請選擇一個對話開始聊天</p>
      </div>

      <div v-else class="flex flex-col h-full relative">
        <div class="h-17.5 bg-bg-surface border-b border-border-default flex items-center justify-between px-6 shrink-0 z-10">
          <div class="flex items-center gap-3">
             <i class="fa-solid fa-chevron-left md:hidden text-xl cursor-pointer text-fg-primary" @click="store.activeChatId=null"></i>
             <div class="w-10 h-10 rounded-full bg-cover bg-gray-200" :style="{backgroundImage: `url(${store.activeChat.avatar})`}"></div>
             <div>
               <div class="font-bold text-fg-primary flex items-center gap-2">
                   {{ store.activeChat.name }}
                   <span v-if="timeLeft" class="text-xs bg-red-100 text-red-500 px-2 rounded-full">{{ timeLeft }}</span>
               </div>
               <div class="text-xs text-fg-secondary">{{ store.activeChat.status === 'matching' ? '配對互動中' : '線上' }}</div>
             </div>
          </div>
          <div class="flex gap-4 text-fg-muted pr-10 md:pr-12">
              <i class="fa-solid fa-triangle-exclamation hover:text-red-500 cursor-pointer" @click="reportMessage"></i>
          </div>
        </div>

        <div v-if="store.activeChat.notice" class="bg-yellow-50 text-yellow-800 px-4 py-2 text-sm flex items-center border-b border-yellow-100 shrink-0">
          <i class="fa-solid fa-bullhorn mr-2"></i> {{ store.activeChat.notice }}
        </div>
        
        <!-- Knock Pending Banner -->
        <div v-if="store.activeChat.type === 'knock' && store.activeChat.status === 'pending'" class="absolute bottom-0 left-0 w-full bg-red-50 p-4 border-t border-red-100 z-20 flex flex-col items-center gap-2">
            <div class="text-red-500 font-bold text-sm">這是一則敲敲門訊息，是否接受？</div>
            <div class="flex gap-4">
                <button class="px-4 py-1 bg-gray-200 rounded-full text-gray-600 text-sm" @click="store.rejectStranger(store.activeChatId)">刪除</button>
                <button class="px-4 py-1 bg-brand-primary text-white rounded-full text-sm" @click="store.acceptStranger(store.activeChatId)">接受</button>
            </div>
        </div>
        
        <!-- Friend Request Banner -->
        <div v-if="isInputDisabled && store.activeChat.status !== 'pending' && store.activeChat.status !== 'friend'" class="absolute bottom-0 left-0 w-full bg-bg-base p-4 border-t border-border-default z-20 flex flex-col items-center gap-2">
            <div class="text-brand-primary font-bold text-sm">互動已達上限，是否成為好友？</div>
            <div class="flex gap-4">
                <button class="px-4 py-1 bg-gray-200 rounded-full text-gray-600 text-sm" @click="store.rejectFriend(store.activeChatId)">拒絕</button>
                <button class="px-4 py-1 bg-brand-primary text-white rounded-full text-sm" @click="store.becomeFriend(store.activeChatId)">成為好友</button>
            </div>
        </div>
        
        <!-- AI Prompts -->
        <div v-if="store.activeChat.type === 'ai'" class="bg-bg-base p-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-border-default shrink-0">
          <button v-for="prompt in store.activeChat.prompts" :key="prompt" class="whitespace-nowrap px-3 py-1 bg-bg-surface border border-brand-primary text-brand-primary rounded-full text-xs hover:bg-brand-primary hover:text-white" @click="store.sendAiPrompt(prompt)">{{ prompt }}</button>
        </div>

        <!-- Message Container -->
        <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-base no-scrollbar">
          <div v-for="msg in store.activeChat.msgs" :key="msg.id" class="flex" :class="msg.sender === 'me' ? 'justify-end' : 'justify-start'">
            <div v-if="msg.sender !== 'me'" class="w-9 h-9 rounded-full bg-gray-300 mr-2 bg-cover" :style="{backgroundImage: `url(${store.activeChat.avatar})`}"></div>
            <div class="group relative max-w-[70%]">
              <div 
                class="px-4 py-3 rounded-2xl text-sm leading-relaxed break-all shadow-sm" 
                :class="msg.sender === 'me' ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-bg-surface text-fg-primary rounded-bl-sm border border-border-default'"
              >
                {{ msg.text }}
              </div>
              <div v-if="msg.sender !== 'me'" class="hidden group-hover:block absolute -right-6 top-2 text-fg-muted hover:text-red-400 cursor-pointer" @click="reportMessage"><i class="fa-solid fa-flag"></i></div>
              <div class="text-[10px] text-fg-muted mt-1" :class="msg.sender==='me'?'text-right':''">{{ msg.time }} <span v-if="msg.sender==='me'">已讀 {{msg.read}}</span></div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div v-if="!isInputDisabled" class="p-4 bg-bg-surface border-t border-border-default flex items-end gap-3 shrink-0 pb-7.5 md:pb-4">
          <div class="flex-1 bg-bg-base rounded-2xl flex items-center px-4 py-2 relative border border-transparent focus-within:border-brand-primary transition-colors">
            <textarea v-model="messageInput" placeholder="輸入訊息..." rows="1" class="flex-1 bg-transparent border-none outline-none resize-none text-sm text-fg-primary placeholder:text-fg-muted max-h-20" @keydown.enter.prevent="handleSend"></textarea>
            <div v-if="store.activeChat.type === 'knock'" class="text-[10px] mr-2" :class="isOverCharLimit ? 'text-red-500 font-bold' : 'text-fg-muted'">{{ charCount }}/30</div>
            <i class="fa-solid fa-image text-fg-muted ml-2 cursor-pointer hover:text-brand-primary" @click="handleImageUpload"></i>
          </div>
          <button class="w-10 h-10 rounded-full bg-btn-primary flex items-center justify-center text-fg-primary hover:scale-95 transition-transform shadow-md" @click="handleSend"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>

  </div>
</template>