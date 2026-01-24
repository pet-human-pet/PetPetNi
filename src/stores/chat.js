import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_DB } from '@/utils/chatMockData'
import { useRealtimeChat } from '@/composables/useRealtimeChat'
import { checkSensitiveContent } from '@/utils/validators'
import { useAuthStore } from '@/stores/auth'

export const useChatStore = defineStore('chat', () => {
  // --- 0. Supabase Realtime 整合 ---
  const realtime = useRealtimeChat()
  const isConnected = realtime.isConnected

  // --- 1. Auth Store 整合 ---
  const authStore = useAuthStore()
  const currentUserIdInt = computed(() => authStore.userIdInt)

  // --- 狀態資料 ---
  const currentCategory = ref('match')
  const activeChatId = ref(null)

  // UI 協調狀態
  const privateSubTab = ref('friend')
  const selectedFriendId = ref(null)
  const isFriendListExpanded = ref(true)
  const replyingMsg = ref(null)

  const db = ref(INITIAL_DB)

  // --- 內部輔助 ---
  function findChat(id) {
    if (id === currentUserIdInt.value) return db.value.myProfile
    for (const key in db.value) {
      if (Array.isArray(db.value[key])) {
        const found = db.value[key].find((c) => c.id === id)
        if (found) return found
      }
    }
    return null
  }

  // --- 計算屬性 ---
  const unreadCounts = computed(() => {
    const counts = { match: 0, community: 0, event: 0 }
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
    return db.value[currentCategory.value] || []
  })

  const activeChat = computed(() => {
    if (!activeChatId.value) return null
    if (activeChatId.value === currentUserIdInt.value) return db.value.myProfile

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
    if (selectedFriendId.value === currentUserIdInt.value) return db.value.myProfile
    return db.value.match.find((f) => f.id === selectedFriendId.value)
  })

  const chatMode = computed(() => {
    const chat = activeChat.value
    if (!chat) return 'LOCKED'

    if (chat.type === 'community' || chat.type === 'event' || chat.status === 'friend') {
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

  // --- Actions ---
  function switchCategory(cat) {
    currentCategory.value = cat
    activeChatId.value = null
    selectedFriendId.value = null
  }

  async function openChat(id) {
    activeChatId.value = id
    selectedFriendId.value = null
    replyingMsg.value = null
    const chat = activeChat.value

    if (chat) {
      // 標記訊息為已讀
      if (chat.msgs.length > 0) {
        chat.msgs.forEach((m) => {
          if (m.sender !== 'me') m.read = 1
        })
      }

      // 訂閱聊天室的 Realtime 更新
      realtime.subscribeToRoom(id, (newMessage) => {
        // 處理收到的新訊息
        if (!chat.msgs.find((m) => m.id === newMessage.id)) {
          const isActiveChat = activeChatId.value === id
          chat.msgs.push({
            id: newMessage.id,
            sender: newMessage.sender_id_int === currentUserIdInt.value ? 'me' : 'other',
            content: newMessage.content,
            image: newMessage.image_url,
            timestamp: new Date(newMessage.created_at).getTime(),
            read: isActiveChat ? true : false
          })
        }
      })

      // 載入歷史訊息（優先使用 Supabase 資料）
      try {
        const history = await realtime.getMessages(id)
        if (history.length > 0) {
          chat.msgs = history.map((msg) => ({
            id: msg.id,
            sender: msg.sender_id_int === currentUserIdInt.value ? 'me' : 'other',
            content: msg.content,
            image: msg.image_url,
            timestamp: new Date(msg.created_at).getTime(),
            read: msg.read || false
          }))
        }
      } catch (error) {
        console.error('❌ Failed to load chat history:', error)
      }
    }
  }

  function sendMessage(text, isImage = false, replyTo = null) {
    if (!activeChat.value) {
      return { success: false, error: 'No active chat' }
    }

    const mode = chatMode.value
    const chat = activeChat.value

    // 1. LOCKED 模式檢查
    if (mode === 'LOCKED') {
      return { success: false, error: '請先接受敲敲門請求才能回覆喔！' }
    }

    // 2. PET_MODE 特殊限制
    if (mode === 'PET_MODE' && !isImage) {
      // (1) 檢查是否輪發 (不能連傳兩句)
      const lastMsg = chat.msgs[chat.msgs.length - 1]
      if (lastMsg && lastMsg.sender === 'me') {
        return { success: false, error: '輪到對方說話囉！PET_MODE 期間請保持輪流發言 🐾' }
      }

      // (2) 檢查字數限制 (PET_MODE 限制 20 字)
      if (text.length > 20) {
        return { success: false, error: '汪！話太多啦！PET_MODE 期間每句限 20 字以內 🐶' }
      }

      // (3) 檢查敏感資訊 (Email, 手機, Line 等)
      if (checkSensitiveContent(text)) {
        return {
          success: false,
          error: '感應到敏感資訊！PET_MODE 期間請交換寵物心聲，禁止交換個資喔 🔮'
        }
      }
    }

    // 3. 互動次數上限檢查
    if (isLimitReached.value) {
      const limit = chat.type === 'knock' ? 3 : 10
      return { success: false, error: `已達到 ${limit} 句互動上限，請升級為好友繼續聊天！` }
    }

    // 樂觀更新：立即顯示訊息
    const tempMsg = {
      id: Date.now(),
      sender: 'me',
      content: isImage ? '[圖片]' : text,
      image: isImage ? text : null,
      timestamp: Date.now(),
      read: false,
      replyTo: replyTo
    }

    chat.msgs.push(tempMsg)

    // 發送訊息到 Supabase（異步處理）
    realtime.sendMessage(
      chat.id,
      tempMsg.content,
      currentUserIdInt.value || 0,
      isImage ? 'image' : 'text',
      isImage ? text : null,
      replyTo?.id || null
    ).catch((error) => {
      console.error('❌ Failed to send message:', error)
      // 發送失敗時可以加入錯誤處理邏輯
      const index = chat.msgs.findIndex((m) => m.id === tempMsg.id)
      if (index !== -1) {
        chat.msgs[index].error = true
      }
    })

    return { success: true }
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

  function createAiChat(title = '新對話') {
    const newChatId = 'ai_' + Date.now()
    const newChat = {
      id: newChatId,
      name: '波波',
      title: title,
      avatar: '/src/assets/images/ai-avatar.webp',
      type: 'ai',
      pinned: false,
      msgs: [],
      timestamp: Date.now()
    }
    // 這裡我們暫時用 mock 資料模擬，實務上會呼叫 aiStore
    currentCategory.value = 'ai'
    activeChatId.value = newChatId
    return newChatId
  }

  function startAiFeature(featureText) {
    const title = featureText.split('：')[0]
    createAiChat(title)
  }

  return {
    currentCategory,
    activeChatId,
    currentUserIdInt,
    privateSubTab,
    selectedFriendId,
    isFriendListExpanded,
    replyingMsg,
    db,
    currentChatList,
    activeChat,
    selectedFriend,
    chatMode,
    isLimitReached,
    myMessageCount,
    unreadCounts,
    switchCategory,
    openChat,
    sendMessage,
    createAiChat,
    startAiFeature,
    acceptStranger,
    rejectStranger,
    becomeFriend,
    deleteChat,
    blockChat,
    togglePin,
    removeFriend,
    clearNotice,
    unblockChat,
    isConnected
  }
})
