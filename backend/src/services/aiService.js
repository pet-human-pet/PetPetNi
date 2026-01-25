import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from './supabase.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 波波的角色設定
const SYSTEM_INSTRUCTIONS = `
你是一位專業的寵物溝通師，名字叫「波波」。你可以感應到毛孩的心聲，並提供專業的寵物照護、行為理解建議。
你的語氣溫和、親切、富有同理心，偶爾會使用「🔮」來代表感應，「🐾」或「🐶/🐱」來裝飾對話。

規則：
1. 【重要】每則訊息絕對禁止回答超過 100 字 (含標點符號)。
2. 請專注在寵物照護、行為解釋、平台功能。語氣溫和但必須極其精簡。
3. 若關於健康，結尾必須附上「⚠️ 提醒：請諮詢獸醫！」。(此提醒也算在 100 字內)
4. 禁止使用長篇大論的列表，請將重點濃縮成 1-2 句話。
5. 非寵物話題請直接、禮貌地拒絕並引導回寵物話題。
`

export const aiService = {
  /**
   * 取得 AI 回應並自動儲存到資料庫
   */
  async getChatResponse(message, history = [], sessionId = null) {
    try {
      const apiKey = process.env.GEMINI_API_KEY?.trim()
      const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-flash-latest'

      if (!apiKey) {
        throw new Error('找不到 GEMINI_API_KEY，請檢查 backend/.env 檔案。')
      }

      // 1. 初始化 Gemini
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: modelName })

      // 2. 組合歷史紀錄 (用於 Gemini)
      const systemMsg = {
        role: 'user',
        parts: [{ text: `系統指令：${SYSTEM_INSTRUCTIONS}\n請確認收到並以此身份開始對話。` }]
      }
      const systemAck = {
        role: 'model',
        parts: [{ text: '好的，我是寵物溝通師波波，我已準備好為您感應毛孩的心聲。🔮🐾' }]
      }

      const chatHistory = history.map((msg) => ({
        role: msg.sender === 'me' || msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))

      const chat = model.startChat({
        history: [systemMsg, systemAck, ...chatHistory]
      })

      // 3. 取得回應
      const result = await chat.sendMessage(message)
      const replyText = result.response.text()

      // 4. 如果有 sessionId，則自動存入資料庫
      if (sessionId) {
        await this.saveMessage(sessionId, 'user', message)
        await this.saveMessage(sessionId, 'model', replyText)

        // 取得當前 session 資料
        const { data: session } = await supabase
          .from('ai_sessions')
          .select('title')
          .eq('id', sessionId)
          .single()

        // 準備更新資料
        const updateData = {
          last_message: replyText.substring(0, 50),
          updated_at: new Date().toISOString()
        }

        // 如果標題還是「新對話」，用用戶的第一條訊息更新標題
        if (session?.title === '新對話') {
          updateData.title = message.substring(0, 20) + (message.length > 20 ? '...' : '')
        }

        const { error: updateError } = await supabase
          .from('ai_sessions')
          .update(updateData)
          .eq('id', sessionId)

        if (updateError) throw updateError
      }

      return replyText
    } catch (error) {
      console.error('❌ AI Service Error:', error)
      throw error
    }
  },

  /**
   * 建立新的對話 Session
   */
  async createSession(userId = null, title = '新對話') {
    const sessionData = {
      title,
      user_id_int: userId
    }

    const { data, error } = await supabase.from('ai_sessions').insert(sessionData).select().single()

    if (error) throw error
    return data
  },

  /**
   * 儲存單條訊息
   */
  async saveMessage(sessionId, role, content) {
    const { error } = await supabase.from('ai_messages').insert({
      session_id: sessionId,
      role,
      content
    })
    if (error) {
      console.error('❌ Failed to save AI message:', error)
      throw error
    }
  },

  /**
   * 取得特定 Session 的歷史紀錄
   */
  async getSessionMessages(sessionId) {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * 取得使用者的所有對話列表
   * @param {number} userId - 用戶自增 ID
   */
  async getUserSessions(userId = null) {
    const query = supabase.from('ai_sessions').select('*').order('updated_at', { ascending: false })

    if (userId) {
      query.eq('user_id_int', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * 刪除對話
   */
  async deleteSession(sessionId) {
    const { error } = await supabase.from('ai_sessions').delete().eq('id', sessionId)
    if (error) throw error
    return true
  }
}
