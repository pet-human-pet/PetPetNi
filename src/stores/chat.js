import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_DB, INITIAL_AI_DB, AI_WELCOME_MESSAGES } from '@/utils/chatMockData'
import { useSocket } from '@/composables/useSocket'

export const useChatStore = defineStore('chat', () => {
  // --- 0. Socket.IO 整合 (Align with Team Spec) ---
  const {
    isConnected,
    initSocket,
    joinRoom,
    sendMessage: sendSocketMessage,
    onNewMessage,
    onHistoryReceived,
    markRead,
    startTyping,
    stopTyping
  } = useSocket()

  // 系統啟動時初始化 Socket (帶 userId 讓後端自動加入所有房間)
  initSocket('u_123456')

  // 監聽接收訊息 (Spec: new_message)
  onNewMessage((msg) => {
    const chat = findChat(msg.roomId)
    if (chat) {
      // 確保格式一致，避免重複加入
      if (!chat.msgs.find((m) => m.id === msg.id)) {
        // 判斷是否為當前開啟的聊天室
        const isActiveChat = activeChatId.value === msg.roomId
        chat.msgs.push({
          ...msg,
          // 如果是當前聊天室，直接標記已讀；否則標記未讀
          read: isActiveChat ? true : false
        })
      }
    }
  })

  // 監聽歷史訊息 (可選，視後端實作而定)
  onHistoryReceived((history) => {
    // 這裡暫時只對目前開啟的聊天室生效，實務上可能需要更複雜的邏輯
    if (activeChat.value && activeChat.value.msgs.length === 0) {
      activeChat.value.msgs = history
    }
  })

  // --- 狀態資料 ---
  const currentCategory = ref('ai')
  const activeChatId = ref(null)
  const currentUserId = ref('u_123456')

  // UI 協調狀態
  const privateSubTab = ref('friend')
  const selectedFriendId = ref(null)
  const isFriendListExpanded = ref(true)
  const replyingMsg = ref(null)
  const isAiDrawerOpen = ref(false)

  const db = ref(INITIAL_DB)
  const aiDb = ref(INITIAL_AI_DB)

  // --- 內部輔助：搜尋所有分類的聊天室 (For Socket) ---
  function findChat(id) {
    if (id === currentUserId.value) return db.value.myProfile

    // 找 AI
    const ai = aiDb.value.history.find((c) => c.id === id)
    if (ai) return ai

    // 找一般聊天室
    for (const key in db.value) {
      if (Array.isArray(db.value[key])) {
        const found = db.value[key].find((c) => c.id === id)
        if (found) return found
      }
    }
    return null
  }

  // --- 計算屬性 (未讀數量)---
  const unreadCounts = computed(() => {
    const counts = { match: 0, community: 0, event: 0, ai: 0 }
    ;['match', 'community', 'event', 'stranger'].forEach((cat) => {
      if (!db.value[cat]) return
      db.value[cat].forEach((chat) => {
        const unreadInChat = chat.msgs.filter((m) => m.sender !== 'me' && !m.read).length
        const targetCat = cat === 'stranger' ? 'match' : cat
        counts[targetCat] += unreadInChat
      })
    })
    return counts
  })

  const currentChatList = computed(() => {
    if (currentCategory.value === 'friendList') {
      return db.value.match.filter((c) => c.status === 'friend')
    }
    if (currentCategory.value === 'ai') {
      return aiDb.value.history
    }
    return db.value[currentCategory.value] || []
  })

  const activeChat = computed(() => {
    if (!activeChatId.value) return null
    if (activeChatId.value === currentUserId.value) return db.value.myProfile
    if (currentCategory.value === 'ai')
      return aiDb.value.history.find((c) => c.id === activeChatId.value)

    for (const key in db.value) {
      if (Array.isArray(db.value[key])) {
        const found = db.value[key].find((c) => c.id === activeChatId.value)
        if (found) return found
      }
    }
    return null
  })

  const selectedFriend = computed(() => {
    if (!selectedFriendId.value) return null
    if (selectedFriendId.value === currentUserId.value) return db.value.myProfile
    return db.value.match.find((f) => f.id === selectedFriendId.value)
  })

  const chatMode = computed(() => {
    const chat = activeChat.value
    if (!chat) return 'LOCKED'

    if (
      chat.type === 'community' ||
      chat.type === 'ai' ||
      chat.type === 'event' ||
      chat.status === 'friend'
    ) {
      return 'REAL_MODE'
    }
    if (chat.type === 'knock' && chat.status === 'pending') {
      return 'LOCKED'
    }
    return 'PET_MODE'
  })

  const myMessageCount = computed(() => {
    const chat = activeChat.value
    if (!chat) return 0
    return chat.msgs.filter((m) => m.sender === 'me').length
  })

  const isLimitReached = computed(() => {
    const chat = activeChat.value
    if (!chat || chatMode.value !== 'PET_MODE') return false

    if (chat.type === 'knock' && chat.status === 'trial') {
      return myMessageCount.value >= 3
    }
    if (chat.type === 'match' && chat.status === 'matching') {
      return myMessageCount.value >= 10
    }
    return false
  })

  // --- 3. Actions ---
  function switchCategory(cat) {
    currentCategory.value = cat
    activeChatId.value = null
    selectedFriendId.value = null
  }

  function openChat(id) {
    activeChatId.value = id
    selectedFriendId.value = null
    replyingMsg.value = null
    const chat = activeChat.value // 利用 computed 取得 chat 物件

    if (chat) {
      // 1. 標記已讀
      if (chat.msgs.length > 0) {
        chat.msgs.forEach((m) => {
          if (m.sender !== 'me') m.read = 1
        })
      }

      // 2. [Socket] 加入房間
      joinRoom(id)
    }
  }

  function checkSensitiveContent(text) {
    const cleanText = text.replace(/["\s\-.( )[\]{}（）「」【】]/g, '').toLowerCase()
    const digitsOnly = text.replace(/\D/g, '')

    if (/09\d{8}/.test(digitsOnly)) return true
    if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(cleanText)) return true
    if (/(line|lai|賴|連|唉居|ig|fb|thread|discord).*?[a-z0-9_]{4,}/i.test(cleanText)) return true
    if (/(id|帳號).*?[a-z0-9_]{4,}/i.test(cleanText)) return true

    return false
  }

  function sendMessage(text, isImage = false, replyTo = null) {
    if (!activeChat.value && currentCategory.value === 'ai') {
      createAiChat()
      const chat = aiDb.value.history.find((c) => c.id === activeChatId.value)
      if (chat) {
        chat.title = text.substring(0, 10) + (text.length > 10 ? '...' : '')
      }
    }

    if (!activeChat.value) return { success: false, error: 'No active chat' }

    const mode = chatMode.value

    if (mode === 'LOCKED') {
      return { success: false, error: '請先接受敲敲門請求才能回覆喔！' }
    }

    if (isLimitReached.value) {
      const limit = activeChat.value.type === 'knock' ? 3 : 10
      return { success: false, error: `已達到 ${limit} 句互動上限，請升級為好友繼續聊天！` }
    }

    if (mode === 'PET_MODE' && !isImage) {
      const lastMsg = activeChat.value.msgs[activeChat.value.msgs.length - 1]
      if (lastMsg && lastMsg.sender === 'me') {
        return { success: false, error: '該模式要輪流說話喔！請等待對方回覆 (喵!)' }
      }

      if (text.length > 30) {
        return { success: false, error: '訊息不能超過 30 字喔！(汪!)' }
      }

      if (checkSensitiveContent(text)) {
        return { success: false, error: '偵測到敏感資訊！禁止交換個資 (Line/IG/電話)。' }
      }
    }

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      content: isImage ? '[圖片]' : text,
      image: isImage ? text : null,
      timestamp: Date.now(),
      read: false,
      replyTo: replyTo
    }

    // 1. 前端先顯示 (Optimistic UI)
    activeChat.value.msgs.push(newMsg)

    // 2. [Socket] 如果不是 AI，發送給後端
    if (activeChat.value.type !== 'ai') {
      sendSocketMessage({
        roomId: activeChat.value.id,
        content: newMsg.content, // Spec: content
        messageType: isImage ? 'image' : 'text' // Spec: messageType
      })
    }

    // 3. 處理自動回覆 (AI 或是模擬用)
    handleAutoReply(activeChat.value, text)

    return { success: true }
  }

  function handleAutoReply(chat, userText) {
    // 只有 AI 才會有本地自動回覆
    // 真人與群組對話應該依賴 Socket 接收對方的訊息
    if (chat.type !== 'ai') return

    setTimeout(() => {
      chat.msgs.push({
        id: Date.now() + 1,
        sender: 'them',
        content: generateAIResponse(userText),
        timestamp: Date.now(),
        read: false
      })
    }, 1000)
  }

  function generateAIResponse(text) {
    const forbidden = /(code|script|program|html|css|javascript|python|java|kill|abuse|porn|sex)/i
    const health = /(生病|痛|抓|吐|拉|症狀|看|叫|行為|為什麼|怎麼辦)/
    const platform = /(活動|聚會|貼文|推薦|找)/

    if (forbidden.test(text))
      return '我是寵物溝通師，無法回答程式碼、羶腥色或暴力相關的內容喔！請專注在毛孩身上 🐶'
    if (health.test(text))
      return '感應到毛孩可能想表達不舒服或焦慮... (通靈解釋) 🔮\n\n⚠️ 溫馨提醒：我僅能提供行為上的感知參考，實際健康狀況請務必諮詢專業獸醫！'
    if (platform.test(text)) return '沒問題！幫您找到了平台上相關的熱門討論與活動 📋 (模擬搜尋結果)'
    return '我是波波，您可以問我關於寵物照護、行為理解或平台活動的問題喔！'
  }

  function createAiChat() {
    const newChatId = 'ai_' + Date.now()
    const newChat = {
      id: newChatId,
      name: aiDb.value.agent.name,
      title: '新對話',
      avatar: aiDb.value.agent.avatar,
      type: 'ai',
      pinned: false,
      msgs: [],
      timestamp: Date.now()
    }
    aiDb.value.history.unshift(newChat)
    currentCategory.value = 'ai'
    activeChatId.value = newChatId
  }

  function startAiFeature(featureText) {
    const title = featureText.split('：')[0]
    const welcomeMsg = AI_WELCOME_MESSAGES[title] || '你好！我是波波，有什麼我可以幫你的嗎？'

    if (activeChatId.value && currentCategory.value === 'ai') {
      const currentChat = aiDb.value.history.find((c) => c.id === activeChatId.value)
      if (currentChat && currentChat.msgs.length === 0) {
        currentChat.title = title
        currentChat.timestamp = Date.now()
        currentChat.msgs.push({
          id: Date.now(),
          sender: 'them',
          content: welcomeMsg,
          timestamp: Date.now(),
          read: false
        })
        return
      }
    }

    const newChatId = 'ai_' + Date.now()
    const newChat = {
      id: newChatId,
      name: aiDb.value.agent.name,
      title: title,
      avatar: aiDb.value.agent.avatar,
      type: 'ai',
      pinned: false,
      msgs: [
        {
          id: Date.now(),
          sender: 'them',
          content: welcomeMsg,
          timestamp: Date.now(),
          read: false
        }
      ],
      timestamp: Date.now()
    }

    aiDb.value.history.unshift(newChat)
    currentCategory.value = 'ai'
    activeChatId.value = newChatId
  }

  function acceptStranger(chatId) {
    const chat = db.value.stranger.find((c) => c.id === chatId)
    if (chat) {
      chat.status = 'trial'
      currentCategory.value = 'match'
      activeChatId.value = chatId
    }
  }

  function rejectStranger(chatId) {
    db.value.stranger = db.value.stranger.filter((c) => c.id !== chatId)
    if (activeChatId.value === chatId) activeChatId.value = null
  }

  function becomeFriend(chatId) {
    const strangerIndex = db.value.stranger.findIndex((c) => c.id === chatId)
    if (strangerIndex !== -1) {
      const chat = db.value.stranger[strangerIndex]
      chat.status = 'friend'
      chat.notice = '恭喜你們成為好友！現在可以無限制聊天囉！'
      db.value.match.push(chat)
      db.value.stranger.splice(strangerIndex, 1)
      privateSubTab.value = 'friend'
      return
    }

    const chat = db.value.match.find((c) => c.id === chatId)
    if (chat) {
      chat.status = 'friend'
      chat.notice = '恭喜你們成為好友！現在可以無限制聊天囉！'
      privateSubTab.value = 'friend'
    }
  }

  function deleteChat(chatId) {
    const aiIndex = aiDb.value.history.findIndex((c) => c.id === chatId)
    if (aiIndex !== -1) {
      aiDb.value.history = aiDb.value.history.filter((c) => c.id !== chatId)
      if (activeChatId.value === chatId) activeChatId.value = null
      return
    }

    for (const cat in db.value) {
      if (Array.isArray(db.value[cat])) {
        const list = db.value[cat]
        const chat = list.find((c) => c.id === chatId)
        if (chat) {
          if (cat === 'match') {
            chat.isDeleted = true
            chat.msgs = []
          } else {
            db.value[cat] = list.filter((c) => c.id !== chatId)
          }
          break
        }
      }
    }
    if (activeChatId.value === chatId) activeChatId.value = null
  }

  function removeFriend(friendId) {
    db.value.match = db.value.match.filter((c) => c.id !== friendId)
    if (activeChatId.value === friendId) activeChatId.value = null
  }

  function updateMyProfile(payload) {
    if (payload.statusMsg !== undefined) db.value.myProfile.statusMsg = payload.statusMsg
  }

  function clearNotice(chatId) {
    for (const cat in db.value) {
      if (Array.isArray(db.value[cat])) {
        const chat = db.value[cat].find((c) => c.id === chatId)
        if (chat) {
          delete chat.notice
          return
        }
      }
    }
  }

  function blockChat(chatId) {
    for (const cat in db.value) {
      if (Array.isArray(db.value[cat])) {
        const list = db.value[cat]
        const index = list.findIndex((c) => c.id === chatId)
        if (index !== -1) {
          const chat = list[index]
          if (chat.status === 'friend') {
            chat.isBlocked = true
          } else {
            list.splice(index, 1)
            if (activeChatId.value === chatId) activeChatId.value = null
          }
          return
        }
      }
    }
  }

  function unblockChat(chatId) {
    for (const cat in db.value) {
      if (Array.isArray(db.value[cat])) {
        const chat = db.value[cat].find((c) => c.id === chatId)
        if (chat) {
          chat.isBlocked = false
          return
        }
      }
    }
  }

  function togglePin(chatId) {
    for (const key in db.value) {
      if (Array.isArray(db.value[key])) {
        const list = db.value[key]
        const chat = list.find((c) => c.id === chatId)
        if (chat) {
          chat.pinned = !chat.pinned
          if (chat.pinned) {
            chat.pinnedAt = Date.now()
          } else {
            delete chat.pinnedAt
          }
          return
        }
      }
    }
  }

  return {
    currentCategory,
    activeChatId,
    currentUserId,
    privateSubTab,
    selectedFriendId,
    isFriendListExpanded,
    replyingMsg,
    isAiDrawerOpen,
    db,
    aiDb,
    currentChatList,
    activeChat,
    selectedFriend,
    chatMode,
    isLimitReached,
    myMessageCount,
    unreadCounts,
    switchCategory,
    openChat,
    createAiChat,
    startAiFeature,
    sendMessage,
    acceptStranger,
    rejectStranger,
    becomeFriend,
    deleteChat,
    blockChat,
    togglePin,
    removeFriend,
    updateMyProfile,
    clearNotice,
    unblockChat,
    isConnected // Export isConnected for UI status
  }
})
