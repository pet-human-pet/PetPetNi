import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_DB } from '@/utils/chatMockData'
import { useRealtimeChat } from '@/composables/useRealtimeChat'
import { checkSensitiveContent } from '@/utils/validators'
import { useAuthStore } from '@/stores/auth'
import { chatApi } from '@/api/chat'

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
        const isMe = newMessage.sender_id_int === currentUserIdInt.value

        // 如果是我發送的,優先尋找並更新「等待中(Pending)」的樂觀更新訊息
        if (isMe) {
          const pendingMsg = chat.msgs.find(
            (m) =>
              m.isPending &&
              m.content === newMessage.content &&
              (m.image === newMessage.image_url || (!m.image && !newMessage.image_url))
          )

          if (pendingMsg) {
            // 更新狀態為真實資料
            pendingMsg.id = newMessage.id
            pendingMsg.timestamp = new Date(newMessage.created_at).getTime()
            delete pendingMsg.isPending
            console.log('🔄 Updated pending message with real data:', newMessage.id)
            return
          }
        }

        // 如果不是我發送的,或是沒找到對應的 Pending 訊息,則直接加入
        if (!chat.msgs.find((m) => m.id === newMessage.id)) {
          const isActiveChat = activeChatId.value === id
          chat.msgs.push({
            id: newMessage.id,
            sender: isMe ? 'me' : 'other',
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
      id: `temp-${Date.now()}`,
      sender: 'me',
      content: isImage ? '[圖片]' : text,
      image: isImage ? text : null,
      timestamp: Date.now(),
      read: false,
      replyTo: replyTo,
      isPending: true // 標記為等待資料庫回傳
    }

    chat.msgs.push(tempMsg)

    // 發送訊息到 Supabase（異步處理）
    realtime
      .sendMessage(
        chat.id,
        tempMsg.content,
        currentUserIdInt.value || 0,
        isImage ? 'image' : 'text',
        isImage ? text : null,
        replyTo?.id || null
      )
      .catch((error) => {
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

  // ========================================
  // 私訊與群聊功能
  // ========================================

  /**
   * 從 API 載入使用者的所有聊天室
   */
  async function loadUserRooms() {
    if (!currentUserIdInt.value) {
      console.warn('⚠️ 尚未登入，無法載入聊天室')
      return
    }

    try {
      const response = await chatApi.getRooms()
      const rooms = response.data.data || []

      // 依照房間類型分類
      const privateRooms = []
      const groupRooms = []
      const eventRooms = []

      rooms.forEach((room) => {
        const formattedRoom = formatRoomToChat(room)
        if (room.type === 'private') {
          privateRooms.push(formattedRoom)
        } else if (room.type === 'group') {
          groupRooms.push(formattedRoom)
        } else if (room.type === 'event') {
          eventRooms.push(formattedRoom)
        }
      })

      // 更新 db（保留 mock 資料作為 fallback）
      if (privateRooms.length > 0) {
        db.value.match = [...privateRooms, ...db.value.match.filter((c) => c.id.startsWith('m'))]
      }
      if (groupRooms.length > 0) {
        db.value.community = [
          ...groupRooms,
          ...db.value.community.filter((c) => c.id.startsWith('c'))
        ]
      }
      if (eventRooms.length > 0) {
        db.value.event = [...eventRooms, ...db.value.event.filter((c) => c.id.startsWith('e'))]
      }

      console.log('✅ 聊天室列表已載入:', rooms.length, '個房間')
    } catch (error) {
      console.error('❌ 載入聊天室失敗:', error)
    }
  }

  /**
   * 將 API 回傳的房間格式轉換為前端格式
   */
  function formatRoomToChat(room) {
    // 找出對方的資訊（私訊時）
    const otherParticipant = room.participants?.find((p) => p.id !== currentUserIdInt.value)

    return {
      id: room.id,
      type: room.type,
      name: room.name || otherParticipant?.nickName || '未命名',
      avatar: room.avatar || otherParticipant?.avatar || '',
      status: 'friend', // 預設為朋友狀態
      msgs: [],
      pinned: false,
      lastMessage: room.lastMessage,
      unreadCount: room.unreadCount || 0,
      participants: room.participants
    }
  }

  /**
   * 開始私訊（找到或建立私訊房間）
   * @param {number} targetUserId - 對方的 user_id_int
   */
  async function startPrivateChat(targetUserId) {
    try {
      const response = await chatApi.startPrivateChat(targetUserId)
      const { data: room, isNew } = response.data

      // 格式化房間資料
      const formattedRoom = formatRoomToChat(room)

      // 如果是新房間，加入列表
      if (isNew) {
        db.value.match.unshift(formattedRoom)
      } else {
        // 檢查是否已存在，如果不存在則加入
        const exists = db.value.match.find((c) => c.id === room.id)
        if (!exists) {
          db.value.match.unshift(formattedRoom)
        }
      }

      // 開啟聊天室
      currentCategory.value = 'match'
      await openChat(room.id)

      return { success: true, room: formattedRoom, isNew }
    } catch (error) {
      console.error('❌ 開始私訊失敗:', error)
      return { success: false, error: error.response?.data?.message || '開始私訊失敗' }
    }
  }

  /**
   * 建立群組聊天室
   * @param {string} name - 群組名稱
   * @param {number[]} memberIds - 成員 ID 陣列
   * @param {string} avatar - 群組頭像 URL（可選）
   */
  async function createGroup(name, memberIds, avatar = null) {
    try {
      const response = await chatApi.createGroup({ name, memberIds, avatar })
      const room = response.data.data

      // 格式化並加入列表
      const formattedRoom = formatRoomToChat(room)
      db.value.community.unshift(formattedRoom)

      // 開啟聊天室
      currentCategory.value = 'community'
      await openChat(room.id)

      return { success: true, room: formattedRoom }
    } catch (error) {
      console.error('❌ 建立群組失敗:', error)
      return { success: false, error: error.response?.data?.message || '建立群組失敗' }
    }
  }

  /**
   * 加入群組成員
   * @param {string} roomId - 房間 ID
   * @param {number[]} memberIds - 要加入的成員 ID 陣列
   */
  async function addGroupMembers(roomId, memberIds) {
    try {
      const response = await chatApi.addMembers(roomId, memberIds)
      console.log('✅ 成員已加入:', response.data.data)
      return { success: true, ...response.data.data }
    } catch (error) {
      console.error('❌ 加入成員失敗:', error)
      return { success: false, error: error.response?.data?.message || '加入成員失敗' }
    }
  }

  /**
   * 移除群組成員
   * @param {string} roomId - 房間 ID
   * @param {number} userId - 要移除的成員 ID
   */
  async function removeGroupMember(roomId, userId) {
    try {
      await chatApi.removeMember(roomId, userId)
      console.log('✅ 成員已移除')
      return { success: true }
    } catch (error) {
      console.error('❌ 移除成員失敗:', error)
      return { success: false, error: error.response?.data?.message || '移除成員失敗' }
    }
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
    isConnected,
    // 私訊與群聊
    loadUserRooms,
    startPrivateChat,
    createGroup,
    addGroupMembers,
    removeGroupMember
  }
})
