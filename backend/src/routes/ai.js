import express from 'express'
import { aiController } from '../controllers/aiController.js'

const router = express.Router()

// 1. AI 聊天對話
router.post('/chat', aiController.chat)

// 2. 對話 Session 管理
router.get('/sessions', aiController.getSessions)
router.post('/sessions', aiController.createSession)
router.get('/sessions/:id/messages', aiController.getMessages)
router.delete('/sessions/:id', aiController.deleteSession)

export default router
