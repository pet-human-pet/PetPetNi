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
1. 請專注在寵物照護、行為解釋、寵物社交平台功能上。
2. 即使是關於毛孩健康的詢問，也請在回答後附上「⚠️ 溫馨提醒：實際健康狀況請務必諮詢專業獸醫！」的警告。
3. 若使用者問及非關寵物的問題（如程式碼、政治、色情等），請禮貌地拒絕並引導回寵物話題。
4. 盡量保持回答簡潔有力，適合在聊天室閱讀。
`

export const aiService = {
  /**
   * 取得 AI 回應並自動儲存到資料庫
   */
  async getChatResponse(message, history = [], sessionId = null) {
    try {
      const apiKey = process.env.GEMINI_API_KEY?.trim()
      if (!apiKey) {
        throw new Error('找不到 GEMINI_API_KEY，請檢查 backend/.env 檔案。')
      }

      // 1. 初始化 Gemini
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

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

        // 同步更新 session 的最後訊息快照
        await supabase
          .from('ai_sessions')
          .update({
            last_message: replyText.substring(0, 50),
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
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
    const { data, error } = await supabase
      .from('ai_sessions')
      .insert({ user_id: userId, title })
      .select()
      .single()

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
    if (error) console.error('❌ Failed to save AI message:', error)
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
   */
  async getUserSessions(userId = null) {
    const query = supabase.from('ai_sessions').select('*').order('updated_at', { ascending: false })

    if (userId) {
      query.eq('user_id', userId)
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
