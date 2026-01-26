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
  // userId 為數字型的自增 ID
  getUserRooms: async (userId) => {
    const { data, error } = await supabase
      .from('chat_room_participants')
      .select(
        `
        room_id,
        chat_rooms ( id, type, name, avatar )
      `
      )
      .eq('user_id_int', userId)
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
      sender_id_int: message.senderId, // 直接使用數字 ID
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
  },

  // 尋找或建立私聊房間
  findOrCreatePrivateRoom: async (userA_Id, userB_Id) => {
    // 確保 ID 順序，方便查詢 private_chat_pairs (目前表結構是 user_1_int < user_2_int)
    const u1 = userA_Id < userB_Id ? userA_Id : userB_Id
    const u2 = userA_Id < userB_Id ? userB_Id : userA_Id

    // 1. 先查是否已存在
    const { data: existingPair, error: checkError } = await supabase
      .from('private_chat_pairs')
      .select('room_id')
      .eq('user_1_int', u1)
      .eq('user_2_int', u2)
      .single()

    if (existingPair) {
      console.log(`✅ 找到已存在的私聊房間: ${existingPair.room_id}`)
      return existingPair.room_id
    }

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is 'Row not found'
      console.error('❌ 檢查 private_chat_pairs 時發生錯誤:', checkError)
    }

    // 2. 建立新房間
    console.log('✨ 正在建立新私聊房間...')

    // (1) 建立聊天室
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        type: 'private',
        name: null // 私聊房間通常不需要名稱，或動態使用用戶名稱
      })
      .select('id')
      .single()

    if (roomError || !newRoom) {
      console.error('❌ 建立聊天室失敗:', roomError)
      throw new Error('建立聊天室失敗')
    }

    const roomId = newRoom.id

    // (2) 建立參與者
    const participants = [
      { room_id: roomId, user_id_int: u1 },
      { room_id: roomId, user_id_int: u2 }
    ]

    const { error: partError } = await supabase.from('chat_room_participants').insert(participants)

    if (partError) {
      console.error('❌ 加入參與者失敗:', partError)
      // 若失敗是否需要清理房間？暫時直接拋出錯誤
      throw partError
    }

    // (3) 新增至 private_chat_pairs 索引表
    const { error: pairError } = await supabase.from('private_chat_pairs').insert({
      user_1_int: u1,
      user_2_int: u2,
      room_id: roomId
    })

    if (pairError) {
      console.error('❌ 建立 private_chat_pair 記錄失敗:', pairError)
      throw pairError
    }

    console.log(`✅ 私聊房間已建立: ${roomId} (用戶 ${u1} & ${u2})`)
    return roomId
  }
}
