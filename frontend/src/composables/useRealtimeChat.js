import { ref, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

export function useRealtimeChat() {
  const channels = ref(new Map())
  const isConnected = ref(false)

  /**
   * 訂閱聊天室訊息
   * @param {string} roomId - 聊天室 ID
   * @param {Function} onNewMessage - 收到新訊息的回調函數
   */
  const subscribeToRoom = (roomId, onNewMessage) => {
    // 如果已經訂閱過這個房間，先取消訂閱
    if (channels.value.has(roomId)) {
      unsubscribeFromRoom(roomId)
    }

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          onNewMessage(payload.new)
        }
      )
      .subscribe((status) => {
        isConnected.value = status === 'SUBSCRIBED'
      })

    channels.value.set(roomId, channel)
    return channel
  }

  /**
   * 取消訂閱聊天室
   * @param {string} roomId - 聊天室 ID
   */
  const unsubscribeFromRoom = (roomId) => {
    const channel = channels.value.get(roomId)
    if (channel) {
      supabase.removeChannel(channel)
      channels.value.delete(roomId)
    }
  }

  /**
   * 發送訊息（直接寫入資料庫，Realtime 會自動推播）
   * @param {string} roomId - 聊天室 ID
   * @param {string} content - 訊息內容
   * @param {number} senderIdInt - 發送者 user_id_int
   * @param {string} messageType - 訊息類型 (text/image)
   * @param {string|null} imageUrl - 圖片 URL（可選）
   * @param {number|null} replyToId - 回覆的訊息 ID（可選）
   */
  const sendMessage = async (
    roomId,
    content,
    senderIdInt,
    messageType = 'text',
    imageUrl = null,
    replyToId = null
  ) => {
    try {
      const insertData = {
        room_id: roomId,
        content,
        message_type: messageType,
        sender_id_int: senderIdInt,
        read: false,
        image_url: imageUrl,
        parent_id: replyToId
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        // console.error('❌ Supabase error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      throw error
    }
  }

  /**
   * 取得歷史訊息
   * @param {string} roomId - 聊天室 ID
   * @param {number} limit - 訊息數量限制
   */
  const getMessages = async (roomId, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        // console.error('❌ Error fetching messages:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error)
      throw error
    }
  }

  /**
   * 標記訊息為已讀
   * @param {string} roomId - 聊天室 ID
   * @param {number} userIdInt - 使用者 ID
   */
  const markMessagesAsRead = async (roomId, userIdInt) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('room_id', roomId)
        .neq('sender_id_int', userIdInt)
        .eq('read', false)

      if (error) {
        // console.error('❌ Error marking messages as read:', error)
        throw error
      }

    } catch (error) {
      console.error('❌ Failed to mark messages as read:', error)
      throw error
    }
  }

  /**
   * 取得單一聊天室詳情 (含成員資料)
   * @param {string} roomId
   * @param {number} myUserIdInt
   */
  const fetchSingleChatRoom = async (roomId, myUserIdInt) => {
    try {
      // 1. 取得房間基本資料
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      // 2. 取得成員資料 (含 Profile)
      const { data: participants, error: partError } = await supabase
        .from('chat_room_participants')
        .select(
          `
          user_id_int,
          profiles:user_id_int (
            user_id_int,
            nick_name,
            avatar_url
          )
        `
        )
        .eq('room_id', roomId)

      if (partError) throw partError

      // 3. 整理回傳資料
      let partner = null
      if (room.type === 'private') {
        const other = participants.find((p) => p.user_id_int !== myUserIdInt)
        if (other && other.profiles) {
          partner = {
            id: other.profiles.user_id_int,
            name: other.profiles.nick_name,
            avatar: other.profiles.avatar_url
          }
        }
      }

      return {
        ...room,
        partner
      }
    } catch (error) {
      console.error('❌ Failed to fetch room details:', error)
      return null
    }
  }

  /**
   * 取消所有訂閱
   */
  const unsubscribeAll = () => {
    channels.value.forEach((channel, roomId) => {
      supabase.removeChannel(channel)
    })
    channels.value.clear()
    isConnected.value = false
  }

  // 組件卸載時自動清理
  onUnmounted(() => {
    unsubscribeAll()
  })

  return {
    isConnected,
    subscribeToRoom,
    unsubscribeFromRoom,
    sendMessage,
    getMessages,
    markMessagesAsRead,
    fetchSingleChatRoom,
    unsubscribeAll
  }
}
