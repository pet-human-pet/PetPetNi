import { chatService } from '../services/chatService.js'

export const chatController = {
  // 取得歷史訊息 (HTTP API 範例)
  getHistory: async (req, res) => {
    try {
      const { roomId } = req.params
      const messages = await chatService.getMessages(roomId)
      res.status(200).json(messages)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' })
    }
  }

  // 以後可以在這裡加：更新已讀、發送圖片等邏輯
}
