import express from 'express'
import { authController } from '../controllers/authController.js'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/me', authController.getCurrentUser) // 取得當前用戶資料

export default router
