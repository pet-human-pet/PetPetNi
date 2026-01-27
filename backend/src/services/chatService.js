import { supabase } from './supabase.js'
import { followService } from './followService.js'

// Knock 狀態常數
const KNOCK_STATUS = {
  INITIATOR_TRIAL: 'initiator_trial', // 發起者 - 試聊中
  RECEIVER_PENDING: 'receiver_pending', // 接收者 - 待接受
  RECEIVER_TRIAL: 'receiver_trial', // 接收者 - 已接受，試聊中
  FRIEND_PENDING: 'friend_pending', // 達到3句，等待確認好友
  FRIEND_CONFIRMED: 'friend_confirmed' // 已確認，等待對方
}

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
  // ========================================
  // 敲敲門相關功能
  // ========================================

  /**
   * 檢查兩人是否互相追蹤（好友）
   */
  checkMutualFollow: async (userIdInt, targetUserIdInt) => {
    // 檢查 A 追蹤 B
    const { data: aFollowsB } = await supabase
      .from('follows')
      .select('id')
      .eq('follower', userIdInt)
      .eq('following', targetUserIdInt)
      .maybeSingle()

    if (!aFollowsB) return false

    // 檢查 B 追蹤 A
    const { data: bFollowsA } = await supabase
      .from('follows')
      .select('id')
      .eq('follower', targetUserIdInt)
      .eq('following', userIdInt)
      .maybeSingle()

    return !!bFollowsA
  },

  /**
   * 建立互相追蹤關係（成為好友時使用）
   */
  createMutualFollow: async (userIdInt, targetUserIdInt) => {
    // 檢查並建立 A -> B
    const { data: existsAB } = await supabase
      .from('follows')
      .select('id')
      .eq('follower', userIdInt)
      .eq('following', targetUserIdInt)
      .maybeSingle()

    if (!existsAB) {
      await supabase.from('follows').insert({
        follower: userIdInt,
        following: targetUserIdInt
      })
    }

    // 檢查並建立 B -> A
    const { data: existsBA } = await supabase
      .from('follows')
      .select('id')
      .eq('follower', targetUserIdInt)
      .eq('following', userIdInt)
      .maybeSingle()

    if (!existsBA) {
      await supabase.from('follows').insert({
        follower: targetUserIdInt,
        following: userIdInt
      })
    }
  },

  /**
   * 接受敲敲門
   */
  acceptKnock: async (roomId, userIdInt) => {
    const { data: participant, error } = await supabase
      .from('chat_room_participants')
      .select('knock_status')
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)
      .single()

    if (error || participant?.knock_status !== KNOCK_STATUS.RECEIVER_PENDING) {
      throw new Error('無效的操作')
    }

    await supabase
      .from('chat_room_participants')
      .update({ knock_status: KNOCK_STATUS.RECEIVER_TRIAL })
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)

    return { success: true }
  },

  /**
   * 拒絕敲敲門
   */
  rejectKnock: async (roomId, userIdInt) => {
    await supabase
      .from('chat_room_participants')
      .update({ is_blocked: true, knock_status: 'rejected' })
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)

    return { success: true }
  },

  /**
   * 確認成為好友
   */
  confirmFriend: async (roomId, userIdInt) => {
    // 1. 更新自己的狀態為已確認
    await supabase
      .from('chat_room_participants')
      .update({ knock_status: KNOCK_STATUS.FRIEND_CONFIRMED })
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)

    // 2. 插入一則系統訊息，觸發對方的 Realtime 更新與未讀通知
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      content: 'FRIEND_CONFIRMED_BY_OTHER',
      message_type: 'system',
      sender_id_int: userIdInt,
      read: false
    })

    // 3. 檢查所有參與者的狀態
    const { data: participants } = await supabase
      .from('chat_room_participants')
      .select('user_id_int, knock_status')
      .eq('room_id', roomId)

    const allConfirmed = participants.every(
      (p) => p.knock_status === KNOCK_STATUS.FRIEND_CONFIRMED || p.knock_status === null
    )

    if (allConfirmed) {
      // 4. 雙方都確認，清除 knock 狀態，正式成為好友
      await supabase
        .from('chat_room_participants')
        .update({ knock_status: null, knock_message_count: 0 })
        .eq('room_id', roomId)

      // 5. 插入「正式成為好友」的系統訊息
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        content: 'FRIENDSHIP_ESTABLISHED',
        message_type: 'system',
        sender_id_int: 0, // 0 表示系統發送
        read: false
      })

      // 6. 建立互相追蹤關係
      const otherUser = participants.find((p) => p.user_id_int !== userIdInt)
      if (otherUser) {
        await chatService.createMutualFollow(userIdInt, otherUser.user_id_int)
      }
    }

    return { success: true, isFriend: allConfirmed }
  },

  /**
   * 更新敲敲門訊息計數（發送訊息後呼叫）
   */
  incrementKnockMessageCount: async (roomId, userIdInt) => {
    const { data: participant } = await supabase
      .from('chat_room_participants')
      .select('knock_status, knock_message_count')
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)
      .single()

    const knockStatus = participant?.knock_status
    if (
      knockStatus === KNOCK_STATUS.INITIATOR_TRIAL ||
      knockStatus === KNOCK_STATUS.RECEIVER_TRIAL
    ) {
      const newCount = (participant.knock_message_count || 0) + 1

      // 如果達到 3 句，更新狀態為等待確認好友
      const newStatus = newCount >= 3 ? KNOCK_STATUS.FRIEND_PENDING : knockStatus

      await supabase
        .from('chat_room_participants')
        .update({
          knock_message_count: newCount,
          knock_status: newStatus
        })
        .eq('room_id', roomId)
        .eq('user_id_int', userIdInt)

      return { newCount, newStatus }
    }

    return { newCount: participant?.knock_message_count || 0, newStatus: knockStatus }
  },

  // ========================================
  // 原有功能
  // ========================================

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
      const room = await chatService.getRoomByIdWithKnockStatus(existingRoomId, userIdInt)
      return { room, isNew: false, isKnock: false } // 永遠不是敲敲門
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

    // 3. 建立參與者（直接設為好友狀態，knock_status 為 null）
    const participantsData = [
      { room_id: newRoom.id, user_id_int: userIdInt, role: 'member', knock_status: null },
      { room_id: newRoom.id, user_id_int: targetUserIdInt, role: 'member', knock_status: null }
    ]

    const { error: participantError } = await supabase
      .from('chat_room_participants')
      .insert(participantsData)

    if (participantError) {
      console.error('❌ Error adding participants:', participantError)
      await supabase.from('chat_rooms').delete().eq('id', newRoom.id)
      throw participantError
    }

    // 4. 自動建立互相追蹤關係（變好友）
    await chatService.createMutualFollow(userIdInt, targetUserIdInt)

    const room = await chatService.getRoomByIdWithKnockStatus(newRoom.id, userIdInt)
    return { room, isNew: true, isKnock: false }
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
        knock_status,
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
   * 取得房間詳細資料（含當前用戶的 knock 狀態）
   */
  getRoomByIdWithKnockStatus: async (roomId, userIdInt) => {
    const room = await chatService.getRoomById(roomId)
    if (!room) return null

    // 取得當前用戶的 knock 狀態
    const { data: myParticipant } = await supabase
      .from('chat_room_participants')
      .select('knock_status, knock_message_count')
      .eq('room_id', roomId)
      .eq('user_id_int', userIdInt)
      .single()

    return {
      ...room,
      myKnockStatus: myParticipant?.knock_status || null,
      myKnockMessageCount: myParticipant?.knock_message_count || 0
    }
  },

  /**
   * 取得使用者的所有房間（含詳細資料）
   */
  getUserRoomsWithDetails: async (userIdInt) => {
    // 1. 取得使用者參與的所有房間 ID（含 knock 狀態）
    let participations = []
    try {
      const { data, error: partError } = await supabase
        .from('chat_room_participants')
        .select(
          `
          room_id,
          knock_status,
          knock_message_count,
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
      participations = data || []
    } catch (err) {
      console.error('❌ Exception in getUserRoomsWithDetails:', err)
      return []
    }

    if (!participations.length) {
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
            knock_status,
            profiles ( nick_name, avatar_url )
          `
          )
          .eq('room_id', room.id)

        return {
          ...formatRoomForFrontend(room, participants || []),
          myKnockStatus: p.knock_status || null,
          myKnockMessageCount: p.knock_message_count || 0,
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
        knock_status,
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
      knockStatus: p.knock_status,
      nickName: p.profiles?.nick_name,
      avatar: p.profiles?.avatar_url
    }))
  },

  /**
   * 標記房間訊息為已讀
   */
  markMessagesAsRead: async (roomId, userIdInt) => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('room_id', roomId)
      .neq('sender_id_int', userIdInt)
      .eq('read', false)

    if (error) {
      console.error('❌ Error marking as read:', error)
    }
    return { success: true }
  },

  /**
   * 解除好友關係（互相取消追蹤）
   */
  removeFriendship: async (userIdInt, targetUserIdInt) => {
    console.log(`🔍 Removing mutual friendship: user ${userIdInt} <-> user ${targetUserIdInt}`)

    // A -> B
    await followService.unfollowUser(userIdInt, targetUserIdInt)

    // B -> A
    await followService.unfollowUser(targetUserIdInt, userIdInt)

    return { success: true }
  }
}
