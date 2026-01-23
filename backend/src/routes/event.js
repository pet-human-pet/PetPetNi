import express from 'express'
import { eventController } from '../controllers/eventController.js'

const router = express.Router()

// 地點相關
router.get('/locations', eventController.getLocations)

// 活動 CRUD
router.get('/', eventController.getEvents)
router.get('/my', eventController.getMyEvents) // 取得我的活動（需在 /:id 之前）
router.get('/:id', eventController.getEventById)
router.post('/', eventController.createEvent)
router.put('/:id', eventController.updateEvent)
router.delete('/:id', eventController.deleteEvent)

// 活動參與
router.post('/:id/join', eventController.joinEvent)
router.delete('/:id/leave', eventController.leaveEvent)
router.get('/:id/participants', eventController.getParticipants)

export default router
