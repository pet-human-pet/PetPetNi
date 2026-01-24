import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 1. 導入路徑與服務 (New Structure)
import chatRoutes from './routes/chat.js'
import aiRoutes from './routes/ai.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import eventRoutes from './routes/event.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
const app = express()

// 配置
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

// 2. 註冊路由
app.use('/api/chat', chatRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/events', eventRoutes)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PetPetNi API Server is running!' })
})

// 3. 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
