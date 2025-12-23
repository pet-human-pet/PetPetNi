import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 1. 狀態 (State)
  const currentCategory = ref('match') // 目前選中的分類
  const activeChatId = ref(null)       // 目前打開的聊天室 ID
  
  // 模擬用戶資料
  const userStats = ref({
    monthlyKnockUsage: 0, // 每月敲敲門使用次數
    maxKnocks: 3          // 上限 3 次
  })

  // 假資料
  const db = ref({
    community: [
        { id: 'c1', name: '貓派大聯盟 (官方)', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Cat', type: 'official', pinned: true, msgs: [], notice: '公告：本月罐罐團購開始囉！' },
        { id: 'c2', name: '週日大安森林公園散步', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Dog', type: 'user', pinned: false, msgs: [], notice: '置頂：遇雨取消，請大家留意。' }
    ],
    match: [
        { id: 'm1', name: 'Jacky & 豆皮', avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100', type: 'match', status: 'matching', pinned: true, msgs: [
            { id: 1, sender: 'them', text: '嗨！我看你們也喜歡去大安森林公園？', time: '10:00', read: 1 },
            { id: 2, sender: 'me', text: '對呀！豆皮超愛草地的', time: '10:05', read: 1, edited: false }
        ]},
        { id: 'm2', name: 'Sarah & 咪咪', avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100', type: 'match', status: 'friend', pinned: false, msgs: [
            { id: 1, sender: 'them', text: '下次一起出來玩！', time: '09:00', read: 1 }
        ]}
    ],
    event: [
        { id: 'e1', name: '12/25 聖誕寵物趴', avatar: 'https://api.dicebear.com/7.x/icons/svg?seed=Xmas', type: 'event', pinned: false, expiry: '剩餘 20 小時', msgs: [] }
    ],
    stranger: [
        { id: 's1', name: '想認識你的小白 (敲敲門)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stranger', type: 'knock', status: 'pending', msgs: [
            { id: 1, sender: 'them', text: '你好，我覺得你的狗狗很可愛！(虛擬分身)', time: '09:00', read: 0 }
        ] }
    ],
    ai: [
        {
            id: 'a1', name: '波波 (AI 溝通師)', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI', type: 'ai', pinned: true,
            prompts: ['狗狗一直抓耳朵', '推薦週末聚會', '貓咪一直盯著牆角', '幫我找鮮食食譜'],
            msgs: [
                { id: 1, sender: 'them', text: '你好！我是波波，有什麼關於寵物行為的問題想問我嗎？', time: '00:00', read: 0 }
            ]
        }
    ]
  })

  // 2. 計算屬性 (Getters)
	// 取得目前分類下的所有聊天室列表
  const currentChatList = computed(() => {
    return db.value[currentCategory.value] || []
  })

	// 取得目前正在聊天的那個物件
  const activeChat = computed(() => {
    if (!activeChatId.value) return null
    return currentChatList.value.find(c => c.id === activeChatId.value)
  })

  // 3. 動作 (Actions)
	// 切換分類
  function switchCategory(category) {
    currentCategory.value = category
    activeChatId.value = null // 切換分類時關閉聊天視窗
  }

	// 打開某個聊天室
  function openChat(id) {
    activeChatId.value = id
  }

  // 置頂/取消置頂
  function togglePin(chatId) {
    const chat = currentChatList.value.find(c => c.id === chatId)
    if (chat) {
      chat.pinned = !chat.pinned
      // 重新排序：置頂的要在上面 (簡單的排序邏輯)
      db.value[currentCategory.value].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    }
  }

  // 刪除對話
  function deleteChat(chatId) {
    const list = db.value[currentCategory.value]
    const index = list.findIndex(c => c.id === chatId)
    if (index !== -1) {
      list.splice(index, 1) // 從陣列移除
      if (activeChatId.value === chatId) {
        activeChatId.value = null // 如果正在看這個對話，就關掉
      }
    }
  }

	//發送訊息
  function sendMessage(text) {
    if (!activeChat.value || !text.trim()) return

    // 1.建立新訊息
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit'}),
      read: 0,
      edited: false
    }
    
    // 2.推入訊息陣列
    activeChat.value.msgs.push(newMsg)
    
    // 3. 處理自動回覆邏輯 (AI 或 自動回話)
    handleAutoReply(activeChat.value, text)
  }

	// --- 內部輔助函式：處理自動回覆 ---
  function handleAutoReply(chat, userText) {
    // 定義延遲回覆的時間 (模擬打字感，1秒)
    const replyTime = new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit'})
    
    // A. AI波波
    if (chat.type === 'ai') {
        setTimeout(() => {
            const replyText = generateAIResponse(userText) // 呼叫下方的 AI 產生器
            chat.msgs.push({
                id: Date.now() + 1,
                sender: 'them',
                text: replyText,
                time: replyTime,
                read: 0
            })
        }, 1000)
    } 
    // B. 配對(matching)或敲敲門試聊(trial)或好友
    // 模擬只要傳訊，對方就會回一句「自動回覆」
    else if (['matching', 'trial', 'friend'].includes(chat.status)) {
        setTimeout(() => {
            chat.msgs.push({
                id: Date.now() + 1,
                sender: 'them',
                text: '這是一則自動回覆 👋 (模擬對方回應)',
                time: replyTime,
                read: 0
            })
        }, 1000)
    }
  }

  // --- 內部輔助函式：AI 關鍵字邏輯 (從 prototype 搬過來的) ---
  function generateAIResponse(text) {
    const forbidden = /(code|script|program|html|css|javascript|python|java|kill|abuse|porn|sex)/i;
    const health = /(生病|痛|抓|吐|拉|症狀|看|叫|行為|為什麼|怎麼辦)/;
    const platform = /(活動|聚會|貼文|推薦|找)/;

    if (forbidden.test(text)) return "我是寵物溝通師，無法回答程式碼、羶腥色或暴力相關的內容喔！請專注在毛孩身上 🐶";
    if (health.test(text)) return "感應到毛孩可能想表達不舒服或焦慮... (通靈解釋) 🔮\n\n⚠️ 溫馨提醒：我僅能提供行為上的感知參考，實際健康狀況請務必諮詢專業獸醫！";
    if (platform.test(text)) return "沒問題！幫您找到了平台上相關的熱門討論與活動 📋 (模擬搜尋結果)";
    return "我是波波，您可以問我關於寵物照護、行為理解或平台活動的問題喔！";
  }

  return {
    currentCategory,
    activeChatId,
    db,
    currentChatList,
    activeChat,
    switchCategory,
    openChat,
    togglePin,
    deleteChat,
    sendMessage,
    userStats
  }
})