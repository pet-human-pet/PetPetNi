import express from 'express'
import { userController } from '../controllers/userController.js'

const router = express.Router()

router.post('/profile', userController.createProfile)
router.get('/profile', userController.getProfile)

export default router
