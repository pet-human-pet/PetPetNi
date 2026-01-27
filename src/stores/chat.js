import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
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
  const replyingMsg = ref(null)

  const db = ref(INITIAL_DB)
  const hiddenChatIds = ref(JSON.parse(localStorage.getItem('hiddenChatIds') || '[]'))

  // --- 核心邏輯：自動初始化 ---
  // 監聽用戶 ID，一旦準備好就載入聊天室列表
  watch(
    () => currentUserIdInt.value,
    (newId) => {
      if (newId) {
        loadUserRooms()
      }
    },
    { immediate: true }
  )

  // --- 計算屬性 ---
  const unreadCounts = computed(() => {
    const counts = { match: 0 }

    // 統計 match 列表中的未讀 (包含 friend 和 matching)
    db.value.match.forEach((chat) => {
      const unreadInChat = chat.msgs.filter((m) => {
        // me 發的不算未讀
        if (m.sender === 'me') return false
        // 系統訊息對他人來說也算一種提醒 (由 server 觸發，故 sender_id 為 0 或 他人ID)
        return !m.read
      }).length

      // 無論是 friend 還是 matching，都算在 match (聊天) 裡
      counts.match += unreadInChat
    })

    return counts
  })

  const currentChatList = computed(() => {
    if (currentCategory.value === 'friendList') {
      return db.value.match.filter((c) => c.status === 'friend')
    }
    // 在聊天列表 (match) 中，過濾掉標記為隱藏的聊天室 (含本地持久化)
    if (currentCategory.value === 'match') {
      return db.value.match.filter((c) => !hiddenChatIds.value.includes(String(c.id)))
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
    if (!chat) return 'PET_MODE'

    // 社群和活動永遠是 REAL_MODE
    if (chat.type === 'community' || chat.type === 'event') {
      return 'REAL_MODE'
    }

    // 好友狀態
    if (chat.status === 'friend') {
      return 'REAL_MODE'
    }

    // 配對中或其他
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

    // 配對模式
    if (chat.status === 'matching') {
      return myMessageCount.value >= 10
    }

    return false
  })

  // --- Actions ---
  const processingFriendships = new Set()

  function switchCategory(cat) {
    currentCategory.value = cat
    activeChatId.value = null
    selectedFriendId.value = null
  }

  const subscribedRoomIds = new Set()

  function setupRoomSubscription(id) {
    if (subscribedRoomIds.has(id)) return
    subscribedRoomIds.add(id)

    realtime.subscribeToRoom(id, (newMessage) => {
      // 處理系統訊息 (觸發狀態更新)
      const isMe = newMessage.sender_id_int === currentUserIdInt.value

      if (newMessage.message_type === 'system' && (!isMe || newMessage.sender_id_int === 0)) {
        loadUserRooms()
      }

      // 尋找房間
      let foundChat = null
      for (const cat in db.value) {
        if (Array.isArray(db.value[cat])) {
          foundChat = db.value[cat].find((c) => c.id === id)
          if (foundChat) break
        }
      }

      if (foundChat) {
        // 1. 偵測特定系統訊息，立即更新房間狀態 (避免等待 loadUserRooms 回傳延遲)
        if (newMessage.message_type === 'system') {
          if (newMessage.content === 'FRIEND_CONFIRMED_BY_OTHER') {
            foundChat.status = 'friend_pending'
            foundChat.knockStatus = 'friend_pending'
          } else if (newMessage.content === 'FRIENDSHIP_ESTABLISHED') {
            foundChat.status = 'friend'
            foundChat.knockStatus = null
          }
        }

        // 樂觀更新比對 (Pending Message Match)
        if (isMe) {
          const pendingMsg = foundChat.msgs.find(
            (m) =>
              m.isPending &&
              m.content === newMessage.content &&
              (m.image === newMessage.image_url || (!m.image && !newMessage.image_url))
          )
          if (pendingMsg) {
            pendingMsg.id = newMessage.id
            pendingMsg.timestamp = new Date(newMessage.created_at).getTime()
            delete pendingMsg.isPending
            return
          }
        }

        // 避開重複
        if (!foundChat.msgs.find((m) => m.id === newMessage.id)) {
          const isActiveChat = activeChatId.value === id
          foundChat.msgs.push({
            id: newMessage.id,
            sender: isMe ? 'me' : 'other',
            content: newMessage.content,
            messageType: newMessage.message_type || 'text',
            image: newMessage.image_url,
            timestamp: new Date(newMessage.created_at).getTime(),
            read: isActiveChat ? true : false
          })

          // 更新未讀數 (如果不是目前視窗，且不是自己發的)
          if (!isActiveChat && !isMe) {
            foundChat.unreadCount = (foundChat.unreadCount || 0) + 1
          }
        }
      }
    })
  }

  async function openChat(id) {
    if (!id) return
    activeChatId.value = id
    selectedFriendId.value = null
    replyingMsg.value = null

    // 1. 如果本地 db 找不到，主動去後端抓取房間資料
    let chat = activeChat.value
    if (!chat && !id.toString().startsWith('ai')) {
      try {
        const response = await chatApi.getRoom(id)
        const room = response.data.data
        if (room) {
          const formatted = formatRoomToChat(room)
          // 根據類型存入對應分類
          if (room.type === 'private') {
            db.value.match.unshift(formatted)
          } else if (room.type === 'group') {
            db.value.community.unshift(formatted)
          } else if (room.type === 'event') {
            db.value.event.unshift(formatted)
          }
          chat = formatted
        }
      } catch {
        // Automatically caught below
      }
    }

    if (chat) {
      // 標記訊息為已讀 (本地即時更新 UX)
      chat.unreadCount = 0
      chat.msgs.forEach((m) => {
        if (m.sender !== 'me') m.read = true
      })

      // 呼叫後端同步
      try {
        await chatApi.markAsRead(id)
      } catch {
        /* Silently fail */
      }

      // 確保訂閱 (背景監控)
      setupRoomSubscription(id)

      // 如果是被隱藏的，重新顯示 (Reactive)
      hiddenChatIds.value = hiddenChatIds.value.filter((hid) => String(hid) !== String(id))
      localStorage.setItem('hiddenChatIds', JSON.stringify(hiddenChatIds.value))

      // 載入歷史訊息
      try {
        const history = await realtime.getMessages(id)
        if (history.length > 0) {
          chat.msgs = history.map((msg) => ({
            id: msg.id,
            sender: msg.sender_id_int === currentUserIdInt.value ? 'me' : 'other',
            content: msg.content,
            messageType: msg.message_type || 'text',
            image: msg.image_url,
            timestamp: new Date(msg.created_at).getTime(),
            read: true
          }))
        }
      } catch {
        /* Silently fail */
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
      .then(() => {})
      .catch(() => {
        // 發送失敗時可以加入錯誤處理邏輯
        const index = chat.msgs.findIndex((m) => m.id === tempMsg.id)
        if (index !== -1) {
          chat.msgs[index].error = true
        }
      })

    return { success: true }
  }

  async function becomeFriend(chatId) {
    if (processingFriendships.has(chatId)) return { success: false, error: '正在處理中...' }
    processingFriendships.add(chatId)

    try {
      // 這裡原本需要 confirmFriendApi，但現在點擊聊天即變好友
      // 為了相容性暫時保留結構，或將其簡化為直接回傳成功（如果相關 UI 還未移除）
      return { success: true, isFriend: true }
    } finally {
      processingFriendships.delete(chatId)
    }
  }

  function deleteChat(chatId) {
    if (!chatId) return

    // 從對應分類中徹底移除
    for (const cat in db.value) {
      if (Array.isArray(db.value[cat])) {
        // 如果是 match 列表（私訊），且該對象是好友，則只隱藏不刪除
        if (cat === 'match') {
          const chatIndex = db.value[cat].findIndex((c) => String(c.id) === String(chatId))
          if (chatIndex !== -1) {
            const chat = db.value[cat][chatIndex]
            if (chat.status === 'friend') {
              // 好友對話：本地隱藏 + 清空訊息
              chat.msgs = []
              chat.lastMessage = null
              const stringId = String(chatId)
              if (!hiddenChatIds.value.includes(stringId)) {
                hiddenChatIds.value.push(stringId)
                localStorage.setItem('hiddenChatIds', JSON.stringify(hiddenChatIds.value))
              }
            } else {
              // 非好友：徹底移除
              db.value[cat] = db.value[cat].filter((c) => String(c.id) !== String(chatId))
            }
          }
        } else {
          db.value[cat] = db.value[cat].filter((c) => String(c.id) !== String(chatId))
        }
      }
    }

    // 如果正在開著這個聊天室，關閉它並清除網址
    if (String(activeChatId.value) === String(chatId)) {
      activeChatId.value = null
      import('@/router').then((module) => {
        module.default.push({ name: 'chat' })
      })
    }
  }

  async function removeFriend(friendId) {
    try {
      // friendId 在這裡可能是字串格式的 ID (例如 'm1') 或是數字型的 user_id_int
      // 我們需要找到對應的聊天室以取得數字 ID，如果傳入的已經是數字則直接使用
      let targetUserIdInt = parseInt(friendId)
      if (isNaN(targetUserIdInt)) {
        const chat = db.value.match.find((c) => c.id === friendId)
        targetUserIdInt = chat?.targetUserIdInt
      }

      if (!targetUserIdInt) {
        console.error('❌ 找不到目標好友的數字 ID')
        return { success: false, error: '找不到好友資訊' }
      }

      await chatApi.removeFriend(targetUserIdInt)

      // 從對應分類中徹底移除（雙方私訊房間 ID 通常包含兩人的 ID）
      db.value.match = db.value.match.filter(
        (c) => c.id !== friendId && c.targetUserIdInt !== targetUserIdInt
      )

      if (
        activeChatId.value === friendId ||
        (activeChatId.value && activeChatId.value.includes(targetUserIdInt))
      ) {
        activeChatId.value = null
      }
      if (selectedFriendId.value === friendId || selectedFriendId.value === targetUserIdInt) {
        selectedFriendId.value = null
      }

      return { success: true }
    } catch (error) {
      console.error('❌ 解除好友失敗 (Store Action):', error)
      console.error('詳細錯誤資訊:', error.response?.data)
      return { success: false, error: error.response?.data?.message || '解除好友失敗' }
    }
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

  function createAiChat() {
    const newChatId = 'ai_' + Date.now()
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

      // 依照房間類型和 knock 狀態分類
      const friendRooms = [] // 好友私訊
      const knockRooms = [] // 敲敲門（陌生人）
      const groupRooms = []
      const eventRooms = []

      rooms.forEach((room) => {
        const formattedRoom = formatRoomToChat(room)

        // 尋找現有房間以保留訊息內容 (避免切換列表時清空)
        const findExisting = (id) => {
          for (const key in db.value) {
            if (Array.isArray(db.value[key])) {
              const found = db.value[key].find((c) => c.id === id)
              if (found) return found
            }
          }
          return null
        }

        const existing = findExisting(formattedRoom.id)
        if (existing) {
          formattedRoom.msgs = existing.msgs
        }

        if (room.type === 'private') {
          // 根據 knock 狀態分類
          if (formattedRoom.type === 'knock') {
            knockRooms.push(formattedRoom)
          } else {
            friendRooms.push(formattedRoom)
          }
        } else if (room.type === 'group') {
          groupRooms.push(formattedRoom)
        } else if (room.type === 'event') {
          eventRooms.push(formattedRoom)
        }
      })

      // 更新 db（保留 mock 資料作為 fallback）
      if (friendRooms.length > 0) {
        db.value.match = [...friendRooms, ...db.value.match.filter((c) => c.id.startsWith('m'))]
      }
      if (knockRooms.length > 0) {
        db.value.stranger = [
          ...knockRooms,
          ...db.value.stranger.filter((c) => c.id.startsWith('s'))
        ]
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

      // 4. 自動為所有房間建立 Realtime 訂閱（確保不打開視窗也能收到更新）
      rooms.forEach((r) => {
        setupRoomSubscription(r.id)
      })
    } catch {
      // Error handled
    }
  }

  /**
   * 將 API 回傳的房間格式轉換為前端格式
   */
  function formatRoomToChat(room) {
    // 找出對方的資訊（私訊時）
    const otherParticipant = room.participants?.find((p) => p.id !== currentUserIdInt.value)

    // 根據 knock 狀態決定 status 和 type
    let status = 'friend'
    let type = room.type

    if (room.myKnockStatus) {
      type = 'knock'
      const otherConfirmed = room.participants?.some(
        (p) =>
          (p.knockStatus === 'friend_confirmed' || p.knock_status === 'friend_confirmed') &&
          p.id !== currentUserIdInt.value
      )

      if (
        otherConfirmed &&
        (room.myKnockStatus === 'initiator_trial' || room.myKnockStatus === 'receiver_trial')
      ) {
        status = 'friend_pending'
      } else {
        switch (room.myKnockStatus) {
          case 'receiver_pending':
            status = 'pending' // LOCKED 模式
            break
          case 'initiator_trial':
          case 'receiver_trial':
            status = 'trial' // PET_MODE
            break
          case 'friend_pending':
          case 'friend_confirmed':
            status = 'friend_pending' // 等待確認好友
            break
        }
      }
    }

    return {
      id: room.id,
      type: type,
      name: room.name || otherParticipant?.nickName || '未命名',
      avatar: room.avatar || otherParticipant?.avatar || '',
      targetUserIdInt: otherParticipant?.id || otherParticipant?.user_id_int || null,
      status: status,
      knockStatus: room.myKnockStatus || null,
      knockMessageCount: room.myKnockMessageCount || 0,
      msgs: [],
      pinned: false,
      lastMessage: room.lastMessage,
      unreadCount: room.id === activeChatId.value ? 0 : room.unreadCount || 0,
      participants: room.participants,
      isHiddenFromChat: false
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

      // 永遠放入 match 列表（好友分頁會從這裡 filter）
      if (isNew) {
        db.value.match.unshift(formattedRoom)
      } else {
        const exists = db.value.match.find((c) => c.id === room.id)
        if (!exists) {
          db.value.match.unshift(formattedRoom)
        }
      }
      currentCategory.value = 'match'

      // 開啟聊天室
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
