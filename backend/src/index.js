import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 1. 導入路徑與服務 (New Structure)
import chatRoutes from './routes/chat.js'
import aiRoutes from './routes/ai.js'
import { chatService } from './services/chatService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
const app = express()
const httpServer = createServer(app)

// 配置
const PORT = process.env.PORT || 3000
const FRONTEND_URL = 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

// 2. 註冊路由
app.use('/api/chat', chatRoutes)
app.use('/api/ai', aiRoutes)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PetPetNi API Server is running!' })
})

// 3. Socket.io 初始化 (與之前逻辑一致但改用 chatService)
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL }
})

io.on('connection', async (socket) => {
  try {
    const userId = socket.handshake.auth?.userId
    socket.userId = userId

    if (userId) {
      const userRooms = await chatService.getUserRooms(userId)
      userRooms.forEach((roomId) => socket.join(roomId))
    }
  } catch (error) {
    console.error('❌ Socket connection error:', error)
    socket.disconnect()
  }

  // 加入房間
  socket.on('join_room', async (roomId) => {
    try {
      socket.join(roomId)
      const history = await chatService.getMessages(roomId)
      socket.emit('history_messages', history)
    } catch (error) {
      console.error('❌ Error in join_room:', error)
      socket.emit('error', { message: '無法加入房間', details: error.message })
    }
  })

  // 發送訊息
  socket.on('send_message', async (data) => {
    try {
      const { roomId, content, messageType, imageUrl, replyTo } = data

      const messagePayload = {
        content,
        messageType: messageType || 'text',
        senderId: socket.userId || socket.id,
        imageUrl: imageUrl || null,
        replyTo: replyTo || null
      }

      const savedMessage = await chatService.saveMessage(roomId, messagePayload)

      if (savedMessage) {
        socket.to(roomId).emit('new_message', savedMessage)
      } else {
        console.error('❌ Failed to save message: saveMessage returned null')
        socket.emit('error', { message: '訊息儲存失敗', details: 'Database insertion failed' })
      }
    } catch (error) {
      console.error('❌ Error in send_message:', error)
      socket.emit('error', { message: '訊息傳送失敗', details: error.message })
    }
  })

  // 輸入中狀態
  socket.on('typing_start', (roomId) => {
    socket.to(roomId).emit('user_typing', { userId: socket.userId })
  })

  socket.on('typing_stop', (roomId) => {
    socket.to(roomId).emit('user_stop_typing', { userId: socket.userId })
  })

  socket.on('disconnect', () => {})
})

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
