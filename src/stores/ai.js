import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_AI_DB, AI_WELCOME_MESSAGES } from '@/utils/chatMockData'

export const useAIStore = defineStore('ai', () => {
  // --- 狀態 ---
  const isDrawerOpen = ref(false)
  const aiDb = ref(INITIAL_AI_DB)
  const activeSessionId = ref(null)

  // --- 計算屬性 ---
  const activeChat = computed(() => {
    if (!activeSessionId.value) return null
    return aiDb.value.history.find((c) => c.id === activeSessionId.value)
  })

  const history = computed(() => aiDb.value.history)

  // --- 方法 ---
  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
    // 如果打開時沒有選中對話，預設開啟第一個或建立新對話
    if (isDrawerOpen.value && !activeSessionId.value) {
      if (aiDb.value.history.length > 0) {
        activeSessionId.value = aiDb.value.history[0].id
      } else {
        createAiChat()
      }
    }
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  function openSession(id) {
    activeSessionId.value = id
    isDrawerOpen.value = true
  }

  function sendMessage(text) {
    if (!activeChat.value) {
      createAiChat()
      const chat = aiDb.value.history.find((c) => c.id === activeSessionId.value)
      if (chat) {
        chat.title = text.substring(0, 10) + (text.length > 10 ? '...' : '')
      }
    }

    if (!activeChat.value) return

    // 使用者的訊息
    const userMsg = {
      id: Date.now(),
      sender: 'me',
      content: text,
      timestamp: Date.now(),
      read: true
    }
    activeChat.value.msgs.push(userMsg)

    // 自動回覆邏輯 (Mock)
    handleAutoReply(activeChat.value, text)
  }

  function handleAutoReply(chat, userText) {
    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'them',
        content: generateAIResponse(userText),
        timestamp: Date.now(),
        read: false
      }
      chat.msgs.push(aiMsg)
    }, 1000)
  }

  function generateAIResponse(text) {
    const forbidden = /(code|script|program|html|css|javascript|python|java|kill|abuse|porn|sex)/i
    const health = /(生病|痛|抓|吐|拉|症狀|看|叫|行為|為什麼|怎麼辦)/
    const platform = /(活動|聚會|貼文|推薦|找)/

    if (forbidden.test(text))
      return '我是寵物溝通師，無法回答程式碼、羶腥色或暴力相關的內容喔！請專注在毛孩身上 🐶'
    if (health.test(text))
      return '感應到毛孩可能不太舒服... (通靈解釋) 🔮\n\n⚠️ 溫馨提醒：我僅能提供行為上的感知參考，實際健康狀況請務必諮詢專業獸醫！'
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
    activeSessionId.value = newChatId
  }

  function startAiFeature(featureText) {
    const title = featureText.split('：')[0]
    const welcomeMsg = AI_WELCOME_MESSAGES[title] || '你好！我是波波，有什麼我可以幫你的嗎？'

    if (activeSessionId.value) {
      const currentChat = aiDb.value.history.find((c) => c.id === activeSessionId.value)
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
        isDrawerOpen.value = true
        return
      }
    }

    createAiChat()
    activeChat.value.title = title
    activeChat.value.msgs.push({
      id: Date.now(),
      sender: 'them',
      content: welcomeMsg,
      timestamp: Date.now(),
      read: false
    })
    isDrawerOpen.value = true
  }

  return {
    isDrawerOpen,
    activeSessionId,
    activeChat,
    history,
    aiDb,
    toggleDrawer,
    closeDrawer,
    openSession,
    sendMessage,
    createAiChat,
    startAiFeature
  }
})
