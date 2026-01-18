import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 載入 .env 環境變數
dotenv.config()

// 初始化 Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Helper: 將 Supabase 格式轉換為前端所需格式
const formatMessageForFrontend = (msg) => ({
  id: msg.id,
  roomId: msg.room_id,
  content: msg.content,
  messageType: msg.message_type || 'text',
  sender: 'other', // 前端會根據 senderId 判斷
  senderId: msg.sender_id,
  timestamp: msg.created_at,
  read: msg.read || false,
  imageUrl: msg.image_url || null
})

export const db = {
  // 取得用戶參與的所有聊天室 ID
  getUserRooms: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_room_participants')
        .select(
          `
          room_id,
          status,
          pinned,
          pinned_at,
          is_blocked,
          chat_rooms (
            id,
            type,
            name,
            avatar,
            metadata
          )
        `
        )
        .eq('user_id', userId)
        .eq('is_blocked', false)
        .order('pinned', { ascending: false })
        .order('pinned_at', { ascending: false })

      if (error) {
        console.error('❌ Error getting user rooms:', error)
        return []
      }

      // 只回傳 room_id 陣列（與原本的格式一致）
      return data.map((p) => p.room_id)
    } catch (error) {
      console.error('❌ Exception in getUserRooms:', error)
      return []
    }
  },

  // 取得某個房間的歷史訊息
  getMessages: async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error getting messages from Supabase:', error)
        return []
      }

      // 使用 helper function 轉換格式
      return data.map(formatMessageForFrontend)
    } catch (error) {
      console.error('❌ Exception in getMessages:', error)
      return []
    }
  },

  // 儲存訊息到房間
  saveMessage: async (roomId, message) => {
    try {
      const newMessage = {
        room_id: roomId,
        content: message.content,
        message_type: message.messageType || 'text',
        sender_id: message.senderId,
        read: false,
        image_url: message.imageUrl || null,
        parent_id: message.replyTo || null // 支援回覆訊息
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select()
        .single()

      if (error) {
        console.error('❌ Error saving message to Supabase:', error)
        return null
      }

      console.log('✅ Message saved to Supabase:', data.id)

      // 使用 helper function 轉換格式
      return formatMessageForFrontend(data)
    } catch (error) {
      console.error('❌ Exception in saveMessage:', error)
      return null
    }
  }
}
