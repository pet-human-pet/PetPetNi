import { supabase } from './supabase.js'

// Helper: 將 Supabase 格式轉換為前端所需格式
const formatMessageForFrontend = (msg) => ({
  id: msg.id,
  roomId: msg.room_id,
  content: msg.content,
  messageType: msg.message_type || 'text',
  sender: 'other',
  senderId: msg.sender_id_int,
  timestamp: msg.created_at,
  read: msg.read || false,
  imageUrl: msg.image_url || null
})

// Helper: 格式化房間資料
const formatRoomForFrontend = (room, participants = []) => ({
  id: room.id,
  type: room.type,
  name: room.name,
  avatar: room.avatar,
  createdAt: room.created_at,
  participants: participants.map((p) => ({
    id: p.user_id_int,
    role: p.role || 'member',
    nickName: p.profiles?.nick_name,
    avatar: p.profiles?.avatar_url
  }))
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

  // ========================================
  // 私訊功能
  // ========================================

  /**
   * 查詢兩人之間是否已有私訊房間
   */
  findExistingPrivateRoom: async (userIdInt, targetUserIdInt) => {
    // 查詢 user 參與的所有 private 房間
    const { data: userRooms, error: userError } = await supabase
      .from('chat_room_participants')
      .select('room_id, chat_rooms!inner(id, type)')
      .eq('user_id_int', userIdInt)
      .eq('chat_rooms.type', 'private')

    if (userError || !userRooms.length) {
      return null
    }

    // 檢查 target 是否也在這些房間中
    const roomIds = userRooms.map((r) => r.room_id)
    const { data: targetRooms, error: targetError } = await supabase
      .from('chat_room_participants')
      .select('room_id')
      .eq('user_id_int', targetUserIdInt)
      .in('room_id', roomIds)

    if (targetError || !targetRooms.length) {
      return null
    }

    // 找到共同的房間
    return targetRooms[0].room_id
  },

  /**
   * 找到或建立私訊房間
   */
  findOrCreatePrivateRoom: async (userIdInt, targetUserIdInt) => {
    // 1. 先檢查是否已有房間
    const existingRoomId = await chatService.findExistingPrivateRoom(userIdInt, targetUserIdInt)
    if (existingRoomId) {
      const room = await chatService.getRoomById(existingRoomId)
      return { room, isNew: false }
    }

    // 2. 建立新房間
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({ type: 'private' })
      .select()
      .single()

    if (roomError) {
      console.error('❌ Error creating private room:', roomError)
      throw roomError
    }

    // 3. 加入兩位參與者
    const { error: participantError } = await supabase.from('chat_room_participants').insert([
      { room_id: newRoom.id, user_id_int: userIdInt, role: 'member' },
      { room_id: newRoom.id, user_id_int: targetUserIdInt, role: 'member' }
    ])

    if (participantError) {
      console.error('❌ Error adding participants:', participantError)
      // 回滾：刪除房間
      await supabase.from('chat_rooms').delete().eq('id', newRoom.id)
      throw participantError
    }

    const room = await chatService.getRoomById(newRoom.id)
    return { room, isNew: true }
  },

  // ========================================
  // 群聊功能
  // ========================================

  /**
   * 建立群組聊天室
   */
  createGroupRoom: async (creatorIdInt, name, memberIds = [], avatar = null) => {
    // 1. 建立房間
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        type: 'group',
        name,
        avatar
      })
      .select()
      .single()

    if (roomError) {
      console.error('❌ Error creating group room:', roomError)
      throw roomError
    }

    // 2. 加入創建者為管理員
    const participants = [{ room_id: newRoom.id, user_id_int: creatorIdInt, role: 'admin' }]

    // 3. 加入其他成員
    memberIds.forEach((memberId) => {
      if (memberId !== creatorIdInt) {
        participants.push({ room_id: newRoom.id, user_id_int: memberId, role: 'member' })
      }
    })

    const { error: participantError } = await supabase
      .from('chat_room_participants')
      .insert(participants)

    if (participantError) {
      console.error('❌ Error adding group participants:', participantError)
      // 回滾
      await supabase.from('chat_rooms').delete().eq('id', newRoom.id)
      throw participantError
    }

    const room = await chatService.getRoomById(newRoom.id)
    return room
  },

  /**
   * 加入群組成員 (僅管理員可操作)
   */
  addGroupMembers: async (roomId, adminIdInt, memberIds) => {
    // 1. 檢查是否為管理員
    const isAdmin = await chatService.isRoomAdmin(roomId, adminIdInt)
    if (!isAdmin) {
      throw new Error('只有管理員可以加入成員')
    }

    // 2. 取得現有成員，避免重複加入
    const { data: existingMembers } = await supabase
      .from('chat_room_participants')
      .select('user_id_int')
      .eq('room_id', roomId)

    const existingIds = existingMembers?.map((m) => m.user_id_int) || []
    const newMemberIds = memberIds.filter((id) => !existingIds.includes(id))

    if (newMemberIds.length === 0) {
      return { addedCount: 0 }
    }

    // 3. 加入新成員
    const newParticipants = newMemberIds.map((id) => ({
      room_id: roomId,
      user_id_int: id,
      role: 'member'
    }))

    const { error } = await supabase.from('chat_room_participants').insert(newParticipants)

    if (error) {
      console.error('❌ Error adding members:', error)
      throw error
    }

    return { addedCount: newMemberIds.length }
  },

  /**
   * 移除群組成員 (僅管理員可操作)
   */
  removeGroupMember: async (roomId, adminIdInt, targetUserIdInt) => {
    // 1. 檢查是否為管理員
    const isAdmin = await chatService.isRoomAdmin(roomId, adminIdInt)
    if (!isAdmin) {
      throw new Error('只有管理員可以移除成員')
    }

    // 2. 不能移除自己
    if (adminIdInt === targetUserIdInt) {
      throw new Error('不能移除自己')
    }

    // 3. 移除成員
    const { error } = await supabase
      .from('chat_room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id_int', targetUserIdInt)

    if (error) {
      console.error('❌ Error removing member:', error)
      throw error
    }

    return { success: true }
  },

  /**
   * 檢查使用者是否為房間管理員
   */
  isRoomAdmin: async (roomId, userIdInt) => {
    const { data, error } = await supabase
      .from('chat_room_participants')
      .select('role')
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)
      .single()

    if (error || !data) {
      return false
    }
    return data.role === 'admin'
  },

  // ========================================
  // 通用功能
  // ========================================

  /**
   * 取得房間詳細資料（含參與者）
   */
  getRoomById: async (roomId) => {
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError) {
      console.error('❌ Error getting room:', roomError)
      return null
    }

    // 取得參與者資料（包含 profile）
    const { data: participants, error: partError } = await supabase
      .from('chat_room_participants')
      .select(
        `
        user_id_int,
        role,
        profiles ( nick_name, avatar_url )
      `
      )
      .eq('room_id', roomId)

    if (partError) {
      console.error('❌ Error getting participants:', partError)
    }

    return formatRoomForFrontend(room, participants || [])
  },

  /**
   * 取得使用者的所有房間（含詳細資料）
   */
  getUserRoomsWithDetails: async (userIdInt) => {
    // 1. 取得使用者參與的所有房間 ID
    const { data: participations, error: partError } = await supabase
      .from('chat_room_participants')
      .select(
        `
        room_id,
        chat_rooms (
          id,
          type,
          name,
          avatar,
          created_at
        )
      `
      )
      .eq('user_id_int', userIdInt)
      .eq('is_blocked', false)

    if (partError) {
      console.error('❌ Error getting user rooms:', partError)
      return []
    }

    // 2. 取得每個房間的最後一則訊息和未讀數量
    const rooms = await Promise.all(
      participations.map(async (p) => {
        const room = p.chat_rooms

        // 取得最後一則訊息
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content, created_at, sender_id_int')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // 取得未讀數量
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('read', false)
          .neq('sender_id_int', userIdInt)

        // 取得參與者資料
        const { data: participants } = await supabase
          .from('chat_room_participants')
          .select(
            `
            user_id_int,
            role,
            profiles ( nick_name, avatar_url )
          `
          )
          .eq('room_id', room.id)

        return {
          ...formatRoomForFrontend(room, participants || []),
          lastMessage: lastMsg
            ? {
                content: lastMsg.content,
                timestamp: lastMsg.created_at,
                senderId: lastMsg.sender_id_int
              }
            : null,
          unreadCount: unreadCount || 0
        }
      })
    )

    // 3. 按最後訊息時間排序
    return rooms.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.createdAt
      const timeB = b.lastMessage?.timestamp || b.createdAt
      return new Date(timeB) - new Date(timeA)
    })
  },

  /**
   * 取得房間參與者
   */
  getRoomParticipants: async (roomId) => {
    const { data, error } = await supabase
      .from('chat_room_participants')
      .select(
        `
        user_id_int,
        role,
        profiles ( nick_name, avatar_url )
      `
      )
      .eq('room_id', roomId)

    if (error) {
      console.error('❌ Error getting participants:', error)
      return []
    }

    return data.map((p) => ({
      id: p.user_id_int,
      role: p.role || 'member',
      nickName: p.profiles?.nick_name,
      avatar: p.profiles?.avatar_url
    }))
  }
}
