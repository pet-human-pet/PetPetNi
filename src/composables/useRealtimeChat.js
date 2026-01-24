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
          console.log('📨 New message received:', payload.new)
          onNewMessage(payload.new)
        }
      )
      .subscribe((status) => {
        console.log(`🔌 Subscription status for room ${roomId}:`, status)
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
      console.log(`🔌 Unsubscribed from room ${roomId}`)
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
  const sendMessage = async (roomId, content, senderIdInt, messageType = 'text', imageUrl = null, replyToId = null) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          content,
          message_type: messageType,
          sender_id_int: senderIdInt,
          read: false,
          image_url: imageUrl,
          parent_id: replyToId
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error sending message:', error)
        throw error
      }

      console.log('✅ Message sent:', data)
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
        console.error('❌ Error fetching messages:', error)
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
        console.error('❌ Error marking messages as read:', error)
        throw error
      }

      console.log(`✅ Messages marked as read in room ${roomId}`)
    } catch (error) {
      console.error('❌ Failed to mark messages as read:', error)
      throw error
    }
  }

  /**
   * 取消所有訂閱
   */
  const unsubscribeAll = () => {
    channels.value.forEach((channel, roomId) => {
      supabase.removeChannel(channel)
      console.log(`🔌 Unsubscribed from room ${roomId}`)
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
    unsubscribeAll
  }
}
