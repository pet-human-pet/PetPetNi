import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_DB } from '@/utils/chatMockData'
import { useSocket } from '@/composables/useSocket'

export const useChatStore = defineStore('chat', () => {
  // --- 0. Socket.IO 整合 ---
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

  // 系統啟動時初始化 Socket
  initSocket('u_123456')

  // 監聽接收訊息
  onNewMessage((msg) => {
    const chat = findChat(msg.roomId)
    if (chat) {
      if (!chat.msgs.find((m) => m.id === msg.id)) {
        const isActiveChat = activeChatId.value === msg.roomId
        chat.msgs.push({
          ...msg,
          read: isActiveChat ? true : false
        })
      }
    }
  })

  // 監聽歷史訊息
  onHistoryReceived((history) => {
    if (activeChat.value && activeChat.value.msgs.length === 0) {
      activeChat.value.msgs = history
    }
  })

  // --- 狀態資料 ---
  const currentCategory = ref('match')
  const activeChatId = ref(null)
  const currentUserId = ref('u_123456')

  // UI 協調狀態
  const privateSubTab = ref('friend')
  const selectedFriendId = ref(null)
  const isFriendListExpanded = ref(true)
  const replyingMsg = ref(null)

  const db = ref(INITIAL_DB)

  // --- 內部輔助 ---
  function findChat(id) {
    if (id === currentUserId.value) return db.value.myProfile
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
    if (activeChatId.value === currentUserId.value) return db.value.myProfile

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

  function openChat(id) {
    activeChatId.value = id
    selectedFriendId.value = null
    replyingMsg.value = null
    const chat = activeChat.value

    if (chat) {
      if (chat.msgs.length > 0) {
        chat.msgs.forEach((m) => {
          if (m.sender !== 'me') m.read = 1
        })
      }
      joinRoom(id)
    }
  }

  function sendMessage(text, isImage = false, replyTo = null) {
    if (!activeChat.value) return { success: false, error: 'No active chat' }

    const mode = chatMode.value

    if (mode === 'LOCKED') {
      return { success: false, error: '請先接受敲敲門請求才能回覆喔！' }
    }

    if (isLimitReached.value) {
      const limit = activeChat.value.type === 'knock' ? 3 : 10
      return { success: false, error: `已達到 ${limit} 句互動上限，請升級為好友繼續聊天！` }
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

    activeChat.value.msgs.push(newMsg)

    sendSocketMessage({
      roomId: activeChat.value.id,
      content: newMsg.content,
      messageType: isImage ? 'image' : 'text',
      imageUrl: isImage ? text : null,
      replyTo: replyTo?.id || null
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

  return {
    currentCategory,
    activeChatId,
    currentUserId,
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
