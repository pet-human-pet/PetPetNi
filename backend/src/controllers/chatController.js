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
   * 建立群組聊天室
   * POST /api/chat/group
   * Body: { name: string, memberIds: number[], avatar?: string }
   */
  async createGroup(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { name, memberIds, avatar } = req.body
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: '請提供群組名稱' })
      }

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ success: false, message: '請至少選擇一位成員' })
      }

      const room = await chatService.createGroupRoom(user.userIdInt, name.trim(), memberIds, avatar)
      res.status(201).json({ success: true, data: room })
    } catch (error) {
      console.error('❌ Error creating group:', error)
      res.status(500).json({ success: false, message: '建立群組失敗' })
    }
  },

  /**
   * 加入群組成員
   * POST /api/chat/group/:roomId/members
   * Body: { memberIds: number[] }
   */
  async addMembers(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { roomId } = req.params
      const { memberIds } = req.body

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ success: false, message: '請提供要加入的成員' })
      }

      const result = await chatService.addGroupMembers(roomId, user.userIdInt, memberIds)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      console.error('❌ Error adding members:', error)
      const message = error.message === '只有管理員可以加入成員' ? error.message : '加入成員失敗'
      res.status(error.message === '只有管理員可以加入成員' ? 403 : 500).json({
        success: false,
        message
      })
    }
  },

  /**
   * 移除群組成員
   * DELETE /api/chat/group/:roomId/members/:userId
   */
  async removeMember(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { roomId, userId } = req.params

      await chatService.removeGroupMember(roomId, user.userIdInt, parseInt(userId))
      res.status(200).json({ success: true, message: '成員已移除' })
    } catch (error) {
      console.error('❌ Error removing member:', error)
      const knownErrors = ['只有管理員可以移除成員', '不能移除自己']
      const message = knownErrors.includes(error.message) ? error.message : '移除成員失敗'
      res.status(knownErrors.includes(error.message) ? 403 : 500).json({
        success: false,
        message
      })
    }
  },

  /**
   * 取得房間成員
   * GET /api/chat/rooms/:roomId/members
   */
  async getRoomMembers(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const { roomId } = req.params
      const members = await chatService.getRoomParticipants(roomId)
      res.status(200).json({ success: true, data: members })
    } catch (error) {
      console.error('❌ Error fetching members:', error)
      res.status(500).json({ success: false, message: '取得成員列表失敗' })
    }
  }
}
