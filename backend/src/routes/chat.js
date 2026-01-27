import express from 'express'
import { chatController } from '../controllers/chatController.js'

const router = express.Router()

// ========================================
// 聊天室管理
// ========================================

// 取得使用者的所有聊天室
router.get('/rooms', chatController.getRooms)

// 取得歷史訊息
router.get('/history/:roomId', chatController.getHistory)

// ========================================
// 私訊功能
// ========================================

// 開始私訊（找到或建立私訊房間）
router.post('/private', chatController.startPrivateChat)

// 標記已讀
router.post('/rooms/:roomId/read', chatController.markAsRead)

// 隱藏聊天室
router.post('/rooms/:roomId/hide', chatController.hideRoom)

// 解除好友關係
router.delete('/friend/:friendId', chatController.removeFriend)

export default router
