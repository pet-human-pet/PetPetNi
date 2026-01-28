import { aiService } from '../services/aiService.js'

export const aiController = {
  /**
   * 處理 AI 聊天 (支援存檔)
   */
  async chat(req, res) {
    try {
      const { message, history, sessionId } = req.body

      if (!message) {
        return res.status(400).json({ error: '請提供訊息內容' })
      }

      const { reply, updatedTitle } = await aiService.getChatResponse(
        message,
        history || [],
        sessionId
      )

      res.json({
        reply,
        updatedTitle,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('❌ AI Controller (chat) Error:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * 取得使用者的所有對話列表
   */
  async getSessions(req, res) {
    try {
      const { userId } = req.query

      if (!userId) {
        return res.status(400).json({ error: '缺少必要參數: userId' })
      }

      const sessions = await aiService.getUserSessions(userId)
      res.json(sessions)
    } catch (error) {
      console.error('❌ AI Controller (getSessions) Error:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * 建立新的對話
   */
  async createSession(req, res) {
    try {
      const { userId, title } = req.body
      const session = await aiService.createSession(userId, title)
      res.json(session)
    } catch (error) {
      console.error('❌ AI Controller (createSession) Error:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * 取得特定對話的歷史訊息
   */
  async getMessages(req, res) {
    try {
      const { id } = req.params
      const messages = await aiService.getSessionMessages(id)
      res.json(messages)
    } catch (error) {
      console.error('❌ AI Controller (getMessages) Error:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * 刪除對話
   */
  async deleteSession(req, res) {
    try {
      const { id } = req.params
      await aiService.deleteSession(id)
      res.json({ success: true })
    } catch (error) {
      console.error('❌ AI Controller (deleteSession) Error:', error)
      res.status(500).json({ error: error.message })
    }
  }
}
