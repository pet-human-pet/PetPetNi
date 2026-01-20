import { ref } from 'vue'
import { io } from 'socket.io-client'

const socket = ref(null)
const isConnected = ref(false)

// 儲存等待註冊的監聽器 (解決 store 比 socket 更早初始化的問題)
const pendingListeners = ref([])

export function useSocket() {
  const initSocket = (userId) => {
    // 如果 socket 已存在且已連線，直接返回
    if (socket.value?.connected) {
      return socket.value
    }

    // 如果有舊 socket 但未連線，先清理
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    socket.value = io(baseUrl, {
      auth: { userId } // 連線時帶上 userId，讓後端自動加入房間
    })

    socket.value.on('connect', () => {
      isConnected.value = true

      // 連線成功後，註冊所有等待中的監聽器
      pendingListeners.value.forEach(({ event, callback }) => {
        socket.value.on(event, callback)
      })
      pendingListeners.value = []
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    return socket.value
  }

  // 通用的安全監聽器註冊函式
  const safeOn = (event, callback) => {
    if (socket.value?.connected) {
      // Socket 已連線，直接註冊
      socket.value.on(event, callback)
    } else {
      // Socket 尚未連線，先存起來
      pendingListeners.value.push({ event, callback })
    }
  }

  // --- Emits (前端 -> 後端) ---
  const joinRoom = (roomId) => {
    if (socket.value) socket.value.emit('join_room', roomId)
  }

  const leaveRoom = (roomId) => {
    if (socket.value) socket.value.emit('leave_room', roomId)
  }

  const sendMessage = (payload) => {
    // payload: { roomId, content, messageType }
    if (socket.value) socket.value.emit('send_message', payload)
  }

  const startTyping = (roomId) => {
    if (socket.value) socket.value.emit('typing_start', roomId)
  }

  const stopTyping = (roomId) => {
    if (socket.value) socket.value.emit('typing_stop', roomId)
  }

  const markRead = (roomId) => {
    if (socket.value) socket.value.emit('mark_read', { roomId })
  }

  // --- Listeners (後端 -> 前端) ---
  // 使用 safeOn 確保監聽器會在 socket 連線後註冊
  const onNewMessage = (callback) => {
    safeOn('new_message', callback)
  }

  const onUserTyping = (callback) => {
    safeOn('user_typing', callback)
  }

  const onUserStopTyping = (callback) => {
    safeOn('user_stop_typing', callback)
  }

  const onUserJoined = (callback) => {
    safeOn('user_joined', callback)
  }

  const onUserLeft = (callback) => {
    safeOn('user_left', callback)
  }

  const onMessagesRead = (callback) => {
    safeOn('messages_read', callback)
  }

  // Custom: 歷史訊息 (Spec沒寫，但功能需要)
  const onHistoryReceived = (callback) => {
    safeOn('history_messages', callback)
  }

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  return {
    socket,
    isConnected,
    initSocket,
    disconnectSocket,
    // Emits
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markRead,
    // Listeners
    onNewMessage, // renamed from onMessageReceived
    onUserTyping,
    onUserStopTyping,
    onUserJoined,
    onUserLeft,
    onMessagesRead,
    onHistoryReceived
  }
}
