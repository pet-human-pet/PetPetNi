import express from 'express'
import { userController } from '../controllers/userController.js'

const router = express.Router()

router.post('/profile', userController.createProfile)
router.put('/profile', userController.updateProfile)
router.get('/profile', userController.getProfile)

// 取得其他用戶的公開 Profile
router.get('/profile/:userIdInt', userController.getPublicProfile)

export default router
