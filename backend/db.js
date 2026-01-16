import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 載入 .env 環境變數
dotenv.config()

// 初始化 Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export const db = {
  // 取得用戶參與的所有聊天室 ID
  getUserRooms: async (userId) => {
    // MVP 簡化版：暫時回傳所有預設房間 ID (對應前端 chatMockData.js)
    // TODO: 未來改為從 Supabase 查詢該 userId 實際參與的聊天室
    const defaultRooms = [
      // community
      'c1',
      'c2',
      // match (含 friend)
      'm1',
      'm2',
      'm3',
      'm4',
      // stranger (敲敲門)
      's1',
      's2',
      // event
      'e1',
      'e2'
    ]
    return defaultRooms
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

      // 轉換 Supabase 格式為前端所需格式
      return data.map((msg) => ({
        id: msg.id,
        roomId: msg.room_id,
        content: msg.content,
        messageType: msg.message_type || 'text',
        sender: 'other', // 前端會根據 senderId 判斷
        senderId: msg.sender_id,
        timestamp: msg.created_at,
        read: msg.read || false,
        imageUrl: msg.image_url || null
      }))
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
        image_url: message.imageUrl || null
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

      // 轉換為前端格式
      return {
        id: data.id,
        roomId: data.room_id,
        content: data.content,
        messageType: data.message_type,
        sender: 'other',
        senderId: data.sender_id,
        timestamp: data.created_at,
        read: data.read,
        imageUrl: data.image_url
      }
    } catch (error) {
      console.error('❌ Exception in saveMessage:', error)
      return null
    }
  }
}
