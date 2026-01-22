import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_AI_DB, AI_WELCOME_MESSAGES } from '@/utils/chatMockData'

export const useAIStore = defineStore('ai', () => {
  // --- 狀態 ---
  const isDrawerOpen = ref(false)
  const isLoading = ref(false)
  const aiDb = ref(INITIAL_AI_DB)
  const activeSessionId = ref(null)

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/ai`

  // --- 計算屬性 ---
  const activeChat = computed(() => {
    if (!activeSessionId.value) return null
    return aiDb.value.history.find((c) => c.id === activeSessionId.value)
  })

  // 排序歷史：按照更新時間排序
  const history = computed(() => {
    return [...aiDb.value.history].sort((a, b) => b.timestamp - a.timestamp)
  })

  // --- 格式轉換工具 ---
  const formatMsgFromBackend = (m) => ({
    id: m.id,
    sender: m.role === 'user' ? 'me' : 'them',
    content: m.content,
    timestamp: new Date(m.created_at).getTime(),
    read: m.is_read
  })

  // --- 方法 ---

  /**
   * 初始化：從資料庫讀取所有歷史對話
   */
  async function loadSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`)
      const rawSessions = await response.json()

      // 轉換後端 session 格式
      aiDb.value.history = rawSessions.map((s) => ({
        id: s.id,
        name: aiDb.value.agent.name,
        title: s.title || '新對話',
        avatar: aiDb.value.agent.avatar,
        type: 'ai',
        pinned: false,
        msgs: [], // 點開時才抓訊息
        timestamp: new Date(s.updated_at).getTime(),
        loaded: false // 標記尚未加載訊息內容
      }))
    } catch (error) {
      console.error('❌ Failed to load AI sessions:', error)
    }
  }

  /**
   * 點開對話時，若尚未加載過訊息則向後端抓取
   */
  async function openSession(id) {
    activeSessionId.value = id
    isDrawerOpen.value = true

    const chat = aiDb.value.history.find((c) => c.id === id)
    if (chat && !chat.loaded) {
      try {
        const response = await fetch(`${API_BASE_URL}/sessions/${id}/messages`)
        const msgs = await response.json()
        chat.msgs = msgs.map(formatMsgFromBackend)
        chat.loaded = true
      } catch (error) {
        console.error('❌ Failed to load messages for session:', id, error)
      }
    }
  }

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
    if (isDrawerOpen.value && !activeSessionId.value) {
      if (aiDb.value.history.length > 0) {
        openSession(aiDb.value.history[0].id)
      } else {
        createAiChat()
      }
    }
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  async function sendMessage(text) {
    // 1. 如果沒有 activeSession，先建立一個
    if (!activeChat.value) {
      await createAiChat(text.substring(0, 10))
    }

    const sessionId = activeSessionId.value
    const currentChat = activeChat.value

    // 2. 本地預先顯示使用者的訊息
    const userMsg = {
      id: 'temp_' + Date.now(),
      sender: 'me',
      content: text,
      timestamp: Date.now(),
      read: true
    }
    currentChat.msgs.push(userMsg)

    // 3. 呼叫後端 API
    try {
      isLoading.value = true

      // 準備歷史紀錄 (給 Gemini 看的)
      const chatHistory = currentChat.msgs
        .filter((m) => !m.id.toString().startsWith('temp_')) // 排除剛加進去的暫存訊息
        .map((m) => ({
          role: m.sender === 'me' ? 'user' : 'model',
          content: m.content
        }))

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          sessionId: sessionId
        })
      })

      const data = await response.json()

      if (data.reply) {
        // 更新本地對話內容
        currentChat.msgs.push({
          id: Date.now() + 1,
          sender: 'them',
          content: data.reply,
          timestamp: data.timestamp || Date.now(),
          read: false
        })
        // 更新最後更新時間
        currentChat.timestamp = Date.now()
      } else {
        throw new Error(data.error || 'AI 回應格式錯誤')
      }
    } catch (error) {
      console.error('❌ AI Chat Error:', error)
      currentChat.msgs.push({
        id: 'err_' + Date.now(),
        sender: 'them',
        content: '抱歉，波波現在稍微有點感應不良，請稍候再試...',
        timestamp: Date.now(),
        read: false
      })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 在資料庫建立真實的 Session
   */
  async function createAiChat(title = '新對話') {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      const session = await response.json()

      const newChat = {
        id: session.id,
        name: aiDb.value.agent.name,
        title: session.title,
        avatar: aiDb.value.agent.avatar,
        type: 'ai',
        pinned: false,
        msgs: [
          {
            id: Date.now(),
            sender: 'them',
            content: '哈囉!我是波波，有什麼我可以幫你的嗎?',
            timestamp: Date.now(),
            read: false
          }
        ],
        timestamp: Date.now(),
        loaded: true // 剛建立的當然已經「加載」完了
      }

      aiDb.value.history.unshift(newChat)
      activeSessionId.value = session.id
      return session.id
    } catch (error) {
      console.error('❌ Failed to create AI session:', error)
    }
  }

  async function startAiFeature(featureText) {
    const title = featureText.split('：')[0]
    const welcomeMsg = AI_WELCOME_MESSAGES[title] || '哈囉!我是波波，有什麼我可以幫你的嗎?'

    // 建立新對話
    const sid = await createAiChat(title)
    const chat = aiDb.value.history.find((c) => c.id === sid)

    if (chat) {
      chat.msgs = [
        {
          id: Date.now(),
          sender: 'them',
          content: welcomeMsg,
          timestamp: Date.now(),
          read: false
        }
      ]
    }
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
    startAiFeature,
    loadSessions
  }
})
