import express from 'express'
import { followController } from '../controllers/followController.js'

const router = express.Router()

// 追蹤用戶
router.post('/:userIdInt', followController.followUser)

// 取消追蹤
router.delete('/:userIdInt', followController.unfollowUser)

// 取得追蹤狀態
router.get('/status/:userIdInt', followController.getFollowStatus)

// 取得粉絲數和追蹤數
router.get('/counts/:userIdInt', followController.getFollowCounts)

// 取得粉絲列表
router.get('/followers/:userIdInt', followController.getFollowersList)

// 取得追蹤中列表
router.get('/following/:userIdInt', followController.getFollowingList)

export default router
