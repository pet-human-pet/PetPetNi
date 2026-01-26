import express from 'express'
import { chatController } from '../controllers/chatController.js'

const router = express.Router()

// ========================================
// 聊天室管理
// ========================================

// 取得使用者的所有聊天室
router.get('/rooms', chatController.getRooms)

// 取得房間成員
router.get('/rooms/:roomId/members', chatController.getRoomMembers)

// 取得歷史訊息
router.get('/history/:roomId', chatController.getHistory)

// ========================================
// 私訊功能
// ========================================

// 開始私訊（找到或建立私訊房間）
router.post('/private', chatController.startPrivateChat)

// ========================================
// 群聊功能
// ========================================

// 建立群組
router.post('/group', chatController.createGroup)

// 加入群組成員
router.post('/group/:roomId/members', chatController.addMembers)

// 移除群組成員
router.delete('/group/:roomId/members/:userId', chatController.removeMember)

export default router
