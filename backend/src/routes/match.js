import express from 'express'
import { matchController } from '../controllers/matchController.js'

const router = express.Router()

// 每日配對 API
router.post('/daily', matchController.performDailyMatch)

export default router
