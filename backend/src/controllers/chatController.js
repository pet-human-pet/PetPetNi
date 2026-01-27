import { chatService } from '../services/chatService.js'
import { supabase } from '../services/supabase.js'

/**
 * Helper：從 Authorization header 取得並驗證使用者
 */
async function getUserFromToken(req) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.error('❌ Token 驗證失敗:', authError)
      return null
    }

    const userUuid = authData.user.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id_int')
      .eq('user_id', userUuid)
      .single()

    if (profileError || !profile?.user_id_int) {
      console.error('❌ 查詢 user_id_int 失敗:', profileError)
      return null
    }

    return { uuid: userUuid, userIdInt: profile.user_id_int }
  } catch (error) {
    console.error('❌ Error in getUserFromToken:', error)
    return null
  }
}

export const chatController = {
  /**
   * 取得歷史訊息
   * GET /api/chat/history/:roomId
   */
  async getHistory(req, res) {
    try {
      const { roomId } = req.params
      const messages = await chatService.getMessages(roomId)
      res.status(200).json({ success: true, data: messages })
    } catch (error) {
      console.error('❌ Error fetching history:', error)
      res.status(500).json({ success: false, message: '取得訊息失敗' })
    }
  },

  /**
   * 取得使用者的所有聊天室
   * GET /api/chat/rooms
   */
  async getRooms(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const rooms = await chatService.getUserRoomsWithDetails(user.userIdInt)
      res.status(200).json({ success: true, data: rooms })
    } catch (error) {
      console.error('❌ Error fetching rooms:', error)
      res.status(500).json({ success: false, message: '取得聊天室列表失敗' })
    }
  },

  /**
   * 開始私訊（找到或建立私訊房間）
   * POST /api/chat/private
   * Body: { targetUserId: number }
   */
  async startPrivateChat(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { targetUserId } = req.body
      if (!targetUserId) {
        return res.status(400).json({ success: false, message: '請提供目標使用者 ID' })
      }

      if (targetUserId === user.userIdInt) {
        return res.status(400).json({ success: false, message: '不能與自己開始私訊' })
      }

      const result = await chatService.findOrCreatePrivateRoom(user.userIdInt, targetUserId)
      res.status(result.isNew ? 201 : 200).json({
        success: true,
        data: result.room,
        isNew: result.isNew
      })
    } catch (error) {
      console.error('❌ Error starting private chat:', error)
      res.status(500).json({ success: false, message: '開始私訊失敗' })
    }
  },

  /**
   * 標記房間訊息為已讀
   * POST /api/chat/rooms/:roomId/read
   */
  async markAsRead(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { roomId } = req.params
      await chatService.markMessagesAsRead(roomId, user.userIdInt)

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('❌ Error marking as read:', error)
      res.status(500).json({ success: false, message: '標記已讀失敗' })
    }
  },

  /**
   * 解除好友關係
   * DELETE /api/chat/friend/:friendId
   */
  async removeFriend(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { friendId } = req.params
      if (!friendId) {
        return res.status(400).json({ success: false, message: '請提供好友 ID' })
      }

      const targetId = parseInt(friendId)
      console.log(`👤 User ${user.userIdInt} attempting to remove friend ${targetId}`)

      await chatService.removeFriendship(user.userIdInt, targetId)

      res.status(200).json({ success: true, message: '已解除好友關係' })
    } catch (error) {
      console.error('❌ Error removing friend! Full error object:', error)
      res.status(500).json({
        success: false,
        message: '解除好友失敗',
        error: error.message,
        code: error.code || error.status || 500
      })
    }
  },

  /**
   * 隱藏聊天室
   * POST /api/chat/rooms/:roomId/hide
   */
  async hideRoom(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { roomId } = req.params
      await chatService.hideRoom(roomId, user.userIdInt)

      res.status(200).json({ success: true, message: '聊天室已隱藏' })
    } catch (error) {
      console.error('❌ Error hiding room:', error)
      res.status(500).json({ success: false, message: '隱藏聊天室失敗' })
    }
  }
}
