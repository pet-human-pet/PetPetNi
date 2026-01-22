import express from 'express'
import { userController } from '../controllers/userController.js'

const router = express.Router()

router.post('/profile', userController.createProfile)

export default router
