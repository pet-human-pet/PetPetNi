<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat.js'
import { useConfirm } from '@/composables/useConfirm'
import { useReport } from '@/composables/useReport'

const router = useRouter()
const store = useChatStore()
const { showConfirm } = useConfirm()
const { showReport } = useReport()

const success = (msg) => alert(msg)
const error = (msg) => alert(msg)

const messageInput = ref('')
const msgContainer = ref(null)
const timeLeft = ref('')
const privateSubTab = ref('friend')

// --- 左側導航資料 ---
const navItems = [
  { key: 'match', icon: 'fa-comments', label: '聊天', badge: 1 },
  { key: 'event', icon: 'fa-calendar-check', label: '活動揪團' },
  { key: 'community', icon: 'fa-users', label: '社群' },
  { key: 'ai', icon: 'fa-robot', label: 'AI 溝通師' }
]

// --- 頁面跳轉資料 ---
const pageNavItems = [
  { name: '首頁', icon: 'fa-house', route: 'home' },
  { name: '活動頁', icon: 'fa-calendar-days', route: 'Event' },
  { name: '配對頁', icon: 'fa-id-card', route: 'match' },
  { name: '動態牆', icon: 'fa-hashtag', route: 'Social' },
  { name: '個人檔案', icon: 'fa-user', route: 'Profile' }
]

const goToPage = (routeName) => {
  if (routeName === 'match') {
    alert('配對媒合頁面開發中！')
    return
  }
  router.push({ name: routeName })
}

// --- 列表過濾與排序邏輯 ---
const sortChats = (list) => {
  return [...list].sort((a, b) => {
    // 規則 1: 置頂優先
    if (a.pinned !== b.pinned) {
      return b.pinned ? 1 : -1
    }
    
    // 規則 2: 若都置頂，依據「置頂時間」排序 (新置頂在前)
    if (a.pinned && b.pinned) {
      const pinTimeA = a.pinnedAt || 0
      const pinTimeB = b.pinnedAt || 0
      if (pinTimeA !== pinTimeB) return pinTimeB - pinTimeA
    }

    // 規則 3: 依據「最後一則訊息的時間 (ID)」排序 (新的在前)
    const getLastTime = (chat) => chat.msgs && chat.msgs.length ? chat.msgs[chat.msgs.length-1].id : 0
    return getLastTime(b) - getLastTime(a)
  })
}

const filteredChatList = computed(() => {
  let list = []
  
  if (store.currentCategory === 'friendList') {
    list = store.db.match.filter(chat => chat.status === 'friend')
    return sortChats(list)
  }
  
  if (store.currentCategory === 'match') {
    // 敲敲門 Tab -> 讀取 stranger 資料並過濾刪除
    if (privateSubTab.value === 'knock') {
      list = store.db.stranger.filter(chat => !chat.isDeleted)
    } else {
      // 好友/配對 -> 讀取 match 資料並過濾狀態與刪除
      list = store.db.match.filter(chat => {
        const isMatchStatus = privateSubTab.value === 'friend' 
          ? chat.status === 'friend' 
          : chat.status === 'matching'
        return isMatchStatus && !chat.isDeleted
      })
    }
    return sortChats(list)
  }
  
  // 其他頻道 (如社群、活動) 使用 store 已經處理好的排序與過濾結果
  return store.currentChatList
})

// --- 右鍵選單邏輯 ---
const contextMenu = ref({ visible: false, x: 0, y: 0, chatId: null, chatType: null, pinned: false })

const openContextMenu = (e, chat) => {
  e.preventDefault()
  if (store.currentCategory === 'friendList') return // 好友列表暫不提供右鍵選單
  const chatType = store.currentCategory === 'community' ? 'community' : chat.type
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, chatId: chat.id, chatType, pinned: chat.pinned }
}
const closeContextMenu = () => { contextMenu.value.visible = false }
const handleMenuAction = async (action) => {
  const { chatId, chatType } = contextMenu.value
  
  if (action === 'pin') {
    store.togglePin(chatId)
  }
  
  if (action === 'leave') {
    const isConfirmed = await showConfirm({
      title: '退出確認',
      message: '確定要退出此社群嗎？',
      type: 'danger',
      confirmText: '退出'
    })

    if (isConfirmed) {
      // TODO: 實作 store.leaveChat(chatId)
      success('已退出社群')
      store.deleteChat(chatId)
    }
  }

  if (action === 'delete') {
    const isCommunity = chatType === 'community'
    const isConfirmed = await showConfirm({
      title: '刪除對話',
      message: isCommunity 
        ? '確定要刪除此對話紀錄嗎？' 
        : '確定要刪除此對話紀錄嗎？',
      type: 'danger',
      confirmText: '刪除'
    })

    if (isConfirmed) {
      store.deleteChat(chatId)
      success('對話已刪除')
    }
  }
  closeContextMenu()
}
onMounted(() => window.addEventListener('click', closeContextMenu))
onUnmounted(() => window.removeEventListener('click', closeContextMenu))

// --- 訊息互動選單邏輯 (Reply/Delete/Report) ---
const activeMsgId = ref(null)
const replyingMsg = ref(null)

const openMsgMenu = (id) => {
  if (activeMsgId.value === id) {
    activeMsgId.value = null
  } else {
    activeMsgId.value = id
  }
}

const closeMsgMenu = () => {
  activeMsgId.value = null
}

const handleMsgAction = async (action, msg) => {
  closeMsgMenu()
  
  if (action === 'reply') {
    replyingMsg.value = { id: msg.id, content: msg.text }
  }
  
  if (action === 'delete') {
    const isConfirmed = await showConfirm({
      title: '刪除訊息',
      message: '確定要收回這則訊息嗎？',
      type: 'danger',
      confirmText: '收回'
    })
    if (isConfirmed) {
      store.deleteMessage(msg.id)
      success('訊息已收回')
    }
  }
  
  if (action === 'report') {
    const { confirmed, reason } = await showReport()
    if (confirmed) {
      console.log('檢舉原因:', reason)
      success('已收到檢舉，感謝您的回報')
      
      // 串接封鎖流程 (使用 ConfirmDialog)
      const blockConfirmed = await showConfirm({
        title: '已檢舉',
        message: '要封鎖此用戶嗎？封鎖後將不再收到對方的訊息。',
        type: 'danger',
        confirmText: '封鎖',
        cancelText: '取消'
      })

      if (blockConfirmed) {
        store.blockChat(store.activeChat.id) // 標記為封鎖
        success('已封鎖此用戶')
        // 封鎖後自動退出該對話
        store.activeChatId = null
      }
    }
  }
}

// 監聽全域點擊以關閉選單
const closeAllMenus = (e) => {
  // 如果點擊的是選單觸發點本身，不要關閉 (由 toggle 控制)
  if (e.target.closest('.msg-bubble')) return
  
  closeContextMenu()
  closeMsgMenu()
}

onMounted(() => window.addEventListener('click', closeAllMenus))
onUnmounted(() => window.removeEventListener('click', closeAllMenus))

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
  // 傳入 replyingMsg 作為第三個參數
  const result = store.sendMessage(messageInput.value, false, replyingMsg.value)
  if (result.success) {
    messageInput.value = ''
    replyingMsg.value = null // 清空回覆狀態
  }
  else if (result.error) alert(result.error)
}

const handleImageUpload = () => {
  const result = store.sendMessage('[圖片]', true)
  if (!result.success && result.error) alert(result.error)
}

const reportMessage = async () => {
  const isConfirmed = await showConfirm({
    title: '檢舉訊息',
    message: '確定要檢舉此訊息嗎？系統將進行審核。',
    type: 'danger',
    confirmText: '檢舉'
  })

  if (isConfirmed) {
    success('已收到檢舉，感謝您的回報。')
  }
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
  <div class="relative w-screen h-dvh overflow-hidden bg-bg-surface flex flex-col md:flex-row font-sans">
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 z-70 flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface/80 text-fg-secondary shadow-md transition-all hover:bg-bg-base hover:text-brand-accent"
      title="關閉"
      type="button"
      @click="router.back()"
    >
      <i class="fa-solid fa-xmark text-xl"></i>
    </button>
    
    <!-- Left Nav -->
    <div
class="
      shrink-0 w-full h-16 bg-bg-surface border-t border-border-default flex flex-row items-center fixed bottom-0 left-0 z-40 overflow-x-auto no-scrollbar justify-start px-2 gap-2
      md:static md:w-56 md:h-full md:bg-bg-base md:border-t-0 md:border-r md:flex-col md:justify-start md:pt-6 md:z-auto md:overflow-visible md:px-3 md:gap-1
    ">
      
      <!-- Section: Friend List -->
      <div class="hidden md:flex w-full justify-start px-3 mt-2 mb-2">
        <span class="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-black rounded-md tracking-wider">
          好友
        </span>
      </div>

      <div 
        class="
          relative flex flex-col justify-center items-center cursor-pointer text-fg-muted transition-all duration-200
          w-13 h-full md:w-full md:h-12 md:flex-row md:justify-start md:gap-3 md:px-3 md:rounded-lg shrink-0
          hover:bg-black/5 hover:text-brand-primary
        "
        :class="{ 'bg-brand-primary! text-white! shadow-lg shadow-brand-primary/30': store.currentCategory === 'friendList' }"
        @click="store.switchCategory('friendList')"
      >
        <i class="fa-solid text-[18px] md:text-[16px] mb-1 md:mb-0 fa-address-book"></i>
        <div class="text-[10px] md:text-sm font-bold leading-none">好友列表</div>
      </div>

      <!-- Divider -->
      <div
class="
        shrink-0 border-border-strong
        h-10 border-l mx-2
        md:w-full md:h-0 md:border-l-0 md:border-t md:mx-auto md:my-4 opacity-50
      "></div>

      <!-- Section: Channels -->
      <div
class="
        shrink-0 flex items-center justify-start w-5 md:w-full h-full md:h-auto mt-0 md:mt-2 mb-0 md:mb-2 md:px-3
      ">
        <span class="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] md:text-xs font-black rounded-full md:rounded-md tracking-wider [writing-mode:vertical-lr] md:[writing-mode:horizontal-tb]">
          頻道
        </span>
      </div>

      <div 
        v-for="item in navItems" :key="item.key"
        class="
          relative flex flex-col justify-center items-center cursor-pointer text-fg-muted transition-all duration-200
          w-13 h-full md:w-full md:h-12 md:flex-row md:justify-start md:gap-3 md:px-3 md:rounded-lg shrink-0
          hover:bg-black/5 hover:text-brand-primary
        "
        :class="{ 'bg-brand-primary! text-white! shadow-lg shadow-brand-primary/30': store.currentCategory === item.key }"
        @click="store.switchCategory(item.key)"
      >
        <i class="fa-solid text-[18px] md:text-[16px] mb-1 md:mb-0" :class="item.icon"></i>
        <div class="text-[10px] md:text-sm font-bold leading-none">{{ item.label }}</div>
        <div v-if="item.badge" class="absolute top-1 right-1 md:top-auto md:right-3 w-3.5 h-3.5 bg-brand-accent text-white text-[9px] rounded-full flex justify-center items-center border-2 border-bg-base md:border-transparent">
          {{ item.badge }}
        </div>
      </div>

      <!-- Divider -->
      <div
class="
        shrink-0 border-border-strong
        h-10 border-l mx-2
        md:w-full md:h-0 md:border-l-0 md:border-t md:mx-auto md:my-4 opacity-50
      "></div>

      <!-- Section: Explore -->
      <div
class="
        shrink-0 flex items-center justify-start w-5 md:w-full h-full md:h-auto mt-0 md:mt-1 mb-0 md:mb-2 md:px-3
      ">
        <span class="px-1.5 py-0.5 bg-fg-muted/10 text-fg-muted text-[9px] md:text-xs font-black rounded-full md:rounded-md tracking-wider [writing-mode:vertical-lr] md:[writing-mode:horizontal-tb]">
          探索
        </span>
      </div>

      <div 
        v-for="item in pageNavItems" 
        :key="item.name"
        class="
          relative flex flex-col justify-center items-center cursor-pointer text-fg-secondary transition-all duration-200
          w-13 h-full md:w-full md:h-12 md:flex-row md:justify-start md:gap-3 md:px-3 md:rounded-lg shrink-0
          hover:bg-black/5 hover:text-brand-primary
        "
        @click="goToPage(item.route)"
      >
        <i class="fa-solid text-[18px] md:text-[16px] mb-1 md:mb-0" :class="item.icon"></i>
        <div class="text-[10px] md:text-sm font-bold leading-none">{{ item.name }}</div>
      </div>
    </div>

    <!-- Middle Chat List -->
    <div class="shrink-0 flex-1 bg-bg-surface flex flex-col pb-16 md:w-95 md:h-full md:flex-none md:border-r md:border-border-default md:pb-0 relative">
      <div class="p-4 shrink-0">
        <input type="text" placeholder="搜尋對話..." class="w-full bg-bg-base rounded-full px-4 py-2 text-sm text-fg-primary outline-none placeholder:text-fg-muted">
      </div>

      <!-- Private Sub-Tabs -->
      <div v-if="store.currentCategory === 'match'" class="px-4 pb-2 flex gap-2 shrink-0">
        <button 
          class="flex-1 py-1.5 text-xs font-bold rounded-full border transition-all duration-200"
          :class="privateSubTab === 'friend' ? 'bg-brand-primary text-white border-transparent shadow-sm' : 'bg-transparent text-fg-muted border-border-default hover:bg-bg-base'"
          @click="privateSubTab = 'friend'"
        >
          好友
        </button>
        <button 
          class="flex-1 py-1.5 text-xs font-bold rounded-full border transition-all duration-200 whitespace-nowrap"
          :class="privateSubTab === 'match' ? 'bg-brand-primary text-white border-transparent shadow-sm' : 'bg-transparent text-fg-muted border-border-default hover:bg-bg-base'"
          @click="privateSubTab = 'match'"
        >
          配對中
        </button>
        <button 
          class="flex-1 py-1.5 text-xs font-bold rounded-full border transition-all duration-200 whitespace-nowrap"
          :class="privateSubTab === 'knock' ? 'bg-brand-primary text-white border-transparent shadow-sm' : 'bg-transparent text-fg-muted border-border-default hover:bg-bg-base'"
          @click="privateSubTab = 'knock'"
        >
          敲敲門
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto px-2 no-scrollbar">
        <div 
          v-for="chat in filteredChatList" :key="chat.id"
          class="flex items-center p-3 rounded-xl cursor-pointer hover:bg-bg-base mb-1 relative group transition-colors"
          :class="{'bg-bg-base': store.activeChatId === chat.id, 'bg-bg-base/50': chat.pinned}"
          @click="store.openChat(chat.id)"
          @contextmenu="openContextMenu($event, chat)"
        >
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-cover bg-center bg-gray-200" :style="{backgroundImage: `url(${chat.avatar})`, filter: chat.isBlocked ? 'grayscale(100%)' : 'none'}"></div>
            <div v-if="store.currentCategory === 'match' && chat.status !== 'pending' && !chat.isBlocked" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="font-bold text-fg-primary text-sm flex items-center gap-1">
                <i v-if="chat.pinned" class="fa-solid fa-thumbtack text-brand-primary text-xs rotate-45"></i>
                <i v-if="chat.isBlocked" class="fa-solid fa-ban text-red-500 text-xs"></i>
                <span class="truncate" :class="{'text-fg-muted': chat.isBlocked}">{{ chat.name }}</span>
                <span v-if="chat.status === 'matching'" class="bg-orange-100 text-orange-500 text-[10px] px-1 rounded">配對</span>
                <span v-if="chat.status === 'friend'" class="bg-green-100 text-green-600 text-[10px] px-1 rounded">好友</span>
                <span v-if="chat.type === 'knock'" class="bg-purple-100 text-purple-600 text-[10px] px-1 rounded">敲敲門</span>
              </div>
              <span v-if="store.currentCategory !== 'friendList'" class="text-[10px] text-fg-muted whitespace-nowrap">{{ chat.msgs.length ? chat.msgs[chat.msgs.length-1].time : '' }}</span>
            </div>
            <div class="text-xs text-fg-secondary truncate h-4">
              <template v-if="chat.isBlocked">
                <span class="text-red-500">已封鎖此用戶</span>
              </template>
              <template v-else-if="store.currentCategory === 'friendList'">
                點擊頭像開始對話
              </template>
              <template v-else>
                {{ chat.msgs.length ? chat.msgs[chat.msgs.length-1].text : '點擊開始聊天' }}
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Context Menu -->
      <div v-if="contextMenu.visible" class="fixed bg-bg-surface shadow-xl rounded-lg py-2 w-32 z-9999 border border-border-default text-sm text-fg-primary" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
        <div class="px-4 py-2 hover:bg-bg-base cursor-pointer flex items-center gap-2" @click="handleMenuAction('pin')">
          <i class="fa-solid fa-thumbtack text-fg-muted"></i> {{ contextMenu.pinned ? '取消置頂' : '置頂' }}
        </div>
        
        <!-- 僅限社群的退出選項 -->
        <div v-if="contextMenu.chatType === 'community'" class="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer flex items-center gap-2 border-t border-border-default mt-1" @click="handleMenuAction('leave')">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> 退出社群
        </div>

        <!-- 所有對話都有的刪除選項 -->
        <div class="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer flex items-center gap-2 border-t border-border-default mt-1" @click="handleMenuAction('delete')">
          <i class="fa-solid fa-trash-can"></i> 刪除對話
        </div>
      </div>
    </div>

    <!-- Right Chat Area -->
    <div
class="
      flex-1 h-full min-w-0 bg-bg-base md:relative flex flex-col
      fixed inset-0 z-60 md:translate-x-0 transition-transform duration-300 transform translate-x-full
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
          <div class="flex gap-4 text-fg-muted"></div>
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
        
        <!-- Blocked User Banner -->
        <div v-if="store.activeChat.isBlocked" class="absolute bottom-0 left-0 w-full bg-red-50 p-4 border-t border-red-100 z-20 flex flex-col items-center gap-2">
            <div class="text-red-500 font-bold text-sm">您已封鎖此用戶</div>
            <div class="text-xs text-fg-secondary">如需傳送訊息，請先解除封鎖。</div>
        </div>

        <!-- Friend Request Banner -->
        <div v-if="isInputDisabled && store.activeChat.status !== 'pending' && store.activeChat.status !== 'friend' && !store.activeChat.isBlocked" class="absolute bottom-0 left-0 w-full bg-bg-base p-4 border-t border-border-default z-20 flex flex-col items-center gap-2">
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
        <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-base no-scrollbar" :class="{'pb-20': store.activeChat.isBlocked}">
          <div v-for="msg in store.activeChat.msgs" :key="msg.id" class="flex" :class="msg.sender === 'me' ? 'justify-end' : 'justify-start'">
            <div v-if="msg.sender !== 'me'" class="w-9 h-9 rounded-full bg-gray-300 mr-2 bg-cover" :style="{backgroundImage: `url(${store.activeChat.avatar})`}"></div>
            <div class="group relative max-w-[70%]">
              <!-- 訊息氣泡 (加上 msg-bubble class 供點擊判斷) -->
              <div 
                class="msg-bubble px-4 py-3 rounded-2xl text-sm leading-relaxed break-all shadow-sm cursor-pointer flex flex-col gap-1 relative" 
                :class="msg.sender === 'me' ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-bg-surface text-fg-primary rounded-bl-sm border border-border-default'"
                @contextmenu.prevent="openMsgMenu(msg.id)"
                @click="openMsgMenu(msg.id)"
              >
                <!-- 引用區塊 -->
                <div v-if="msg.replyTo" class="mb-1 rounded px-2 py-1 text-xs opacity-80" :class="msg.sender === 'me' ? 'bg-white/20 border-l-2 border-white' : 'bg-black/5 border-l-2 border-fg-muted'">
                  <div class="font-bold mb-0.5">回覆：</div>
                  <div class="truncate">{{ msg.replyTo.content }}</div>
                </div>
                
                <span>{{ msg.text }}</span>
              </div>

              <!-- 內嵌式選單 (CSS 定位) -->
              <div 
                v-if="activeMsgId === msg.id" 
                class="absolute top-full z-50 mt-1 w-32 overflow-hidden rounded-lg bg-bg-surface shadow-xl border border-border-default text-sm text-fg-primary"
                :class="msg.sender === 'me' ? 'right-0' : 'left-0'"
              >
                <div class="px-4 py-2 hover:bg-bg-base cursor-pointer flex items-center gap-2" @click.stop="handleMsgAction('reply', msg)">
                  <i class="fa-solid fa-reply text-fg-muted"></i> 回覆
                </div>
                
                <div v-if="msg.sender === 'me'" class="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer flex items-center gap-2 border-t border-border-default" @click.stop="handleMsgAction('delete', msg)">
                  <i class="fa-solid fa-trash-can"></i> 收回
                </div>
                
                <div v-if="msg.sender !== 'me'" class="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer flex items-center gap-2 border-t border-border-default" @click.stop="handleMsgAction('report', msg)">
                  <i class="fa-solid fa-triangle-exclamation"></i> 檢舉
                </div>
              </div>

              <div class="text-[10px] text-fg-muted mt-1" :class="msg.sender==='me'?'text-right':''">{{ msg.time }} <span v-if="msg.sender==='me'">已讀 {{msg.read}}</span></div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div v-if="!isInputDisabled && !store.activeChat.isBlocked" class="p-4 bg-bg-surface border-t border-border-default flex items-end gap-3 shrink-0 pb-7.5 md:pb-4">
          <div class="flex-1 bg-bg-base rounded-2xl flex flex-col relative border border-transparent focus-within:border-brand-primary transition-colors overflow-hidden">
            
            <!-- Reply Preview -->
            <div v-if="replyingMsg" class="flex items-center justify-between px-4 py-2 bg-black/5 border-b border-border-default">
              <div class="text-xs text-fg-secondary truncate border-l-2 border-brand-primary pl-2">
                回覆：{{ replyingMsg.content }}
              </div>
              <i class="fa-solid fa-xmark text-fg-muted cursor-pointer hover:text-fg-primary text-xs" @click="replyingMsg = null"></i>
            </div>

            <div class="flex items-center px-4 py-2 w-full">
              <textarea v-model="messageInput" placeholder="輸入訊息..." rows="1" class="flex-1 bg-transparent border-none outline-none resize-none text-sm text-fg-primary placeholder:text-fg-muted max-h-20" @keydown.enter.prevent="handleSend"></textarea>
              <div v-if="store.activeChat.type === 'knock'" class="text-[10px] mr-2" :class="isOverCharLimit ? 'text-red-500 font-bold' : 'text-fg-muted'">{{ charCount }}/30</div>
              <i class="fa-solid fa-image text-fg-muted ml-2 cursor-pointer hover:text-brand-primary" @click="handleImageUpload"></i>
            </div>
          </div>
          <button class="w-10 h-10 rounded-full bg-btn-primary flex items-center justify-center text-fg-primary hover:scale-95 transition-transform shadow-md" @click="handleSend"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>

  </div>
</template>