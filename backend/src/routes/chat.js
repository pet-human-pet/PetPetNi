import express from 'express'
import { chatController } from '../controllers/chatController.js'

const router = express.Router()

// HTTP 取得歷史訊息路徑
router.get('/history/:roomId', chatController.getHistory)

export default router
