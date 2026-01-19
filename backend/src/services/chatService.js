import { supabase } from './supabase.js'

// Helper: 將 Supabase 格式轉換為前端所需格式
const formatMessageForFrontend = (msg) => ({
  id: msg.id,
  roomId: msg.room_id,
  content: msg.content,
  messageType: msg.message_type || 'text',
  sender: 'other',
  senderId: msg.sender_id,
  timestamp: msg.created_at,
  read: msg.read || false,
  imageUrl: msg.image_url || null
})

export const chatService = {
  // 取得用戶參與的所有聊天室 ID
  getUserRooms: async (userId) => {
    const { data, error } = await supabase
      .from('chat_room_participants')
      .select(
        `
        room_id,
        chat_rooms ( id, type, name, avatar )
      `
      )
      .eq('user_id', userId)
      .eq('is_blocked', false)

    if (error) {
      console.error('❌ Error getting user rooms:', error)
      return []
    }
    return data.map((p) => p.room_id)
  },

  // 取得某個房間的歷史訊息
  getMessages: async (roomId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error getting messages:', error)
      return []
    }
    return data.map(formatMessageForFrontend)
  },

  // 儲存訊息
  saveMessage: async (roomId, message) => {
    const newMessage = {
      room_id: roomId,
      content: message.content,
      message_type: message.messageType || 'text',
      sender_id: message.senderId,
      read: false,
      image_url: message.imageUrl || null,
      parent_id: message.replyTo || null
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(newMessage)
      .select()
      .single()

    if (error) {
      console.error('❌ Error saving message:', error)
      return null
    }
    return formatMessageForFrontend(data)
  }
}
