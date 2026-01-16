import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { db } from './db.js'

const app = express()
const httpServer = createServer(app)

// 允許的前端來源
const FRONTEND_URL = 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL, methods: ['GET', 'POST'] }))

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Socket.IO Server is running!' })
})

const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] }
})

io.on('connection', async (socket) => {
  // 從 handshake.auth 取得 userId，自動加入所有聊天室
  const userId = socket.handshake.auth?.userId
  if (userId) {
    const userRooms = await db.getUserRooms(userId)
    userRooms.forEach((roomId) => socket.join(roomId))
  }

  // 1. 加入聊天室
  socket.on('join_room', async (roomId) => {
    socket.join(roomId)

    // 通知其他人有人加入 (Spec: user_joined)
    socket.to(roomId).emit('user_joined', { userId: socket.id, userName: 'Guest' })

    // 傳回歷史訊息 (Custom Feature)
    const history = await db.getMessages(roomId)
    socket.emit('history_messages', history)
  })

  // 2. 離開聊天室
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user_left', { userId: socket.id, userName: 'Guest' })
  })

  // 3. 發送訊息
  socket.on('send_message', async (data) => {
    // Spec: { roomId, content, messageType }
    const { roomId, content, messageType } = data

    // 組裝訊息資料
    const messagePayload = {
      roomId,
      content,
      messageType: messageType || 'text',
      senderId: socket.id
    }

    // 存入 Supabase
    const savedMessage = await db.saveMessage(roomId, messagePayload)

    if (savedMessage) {
      // 廣播給房間內其他人 (Spec: new_message)
      // 這裡用 broadcast.to(roomId) 不傳給自己，因為前端有 Optimistic UI
      socket.to(roomId).emit('new_message', savedMessage)
    } else {
      console.error('❌ Failed to save message')
    }
  })

  // 4. 輸入狀態
  socket.on('typing_start', (roomId) => {
    socket.to(roomId).emit('user_typing', { userId: socket.id, userName: 'Guest' })
  })

  socket.on('typing_stop', (roomId) => {
    socket.to(roomId).emit('user_stop_typing', { userId: socket.id })
  })

  // 5. 標記已讀
  socket.on('mark_read', ({ roomId }) => {
    // 廣播給該房間的對方：你的訊息被已讀了
    socket.to(roomId).emit('messages_read', { userId: socket.id, readAt: Date.now() })
  })

  // 6. 收回訊息
  socket.on('recall_message', ({ roomId, messageId }) => {
    // 這裡應該要去 DB 刪除或標記
    // 廣播給房間所有人移除該訊息
    io.to(roomId).emit('message_recalled', { messageId })
  })

  socket.on('disconnect', () => {})
})

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {})
