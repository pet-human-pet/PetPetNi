import express from 'express'
import { socialController } from '../controllers/socialController.js'

const router = express.Router()

// 貼文
router.get('/posts', socialController.getPosts)
router.post('/posts', socialController.createPost)
router.delete('/posts/:id', socialController.deletePost)
router.put('/posts/:id', socialController.updatePost)

// 按讚
router.post('/posts/:id/like', socialController.likePost)
router.delete('/posts/:id/like', socialController.unlikePost)

// 收藏
router.get('/posts/bookmarks', socialController.getBookmarkedPosts)
router.post('/posts/:id/bookmark', socialController.bookmarkPost)
router.delete('/posts/:id/bookmark', socialController.unbookmarkPost)

// 留言
router.get('/posts/:id/comments', socialController.getComments)
router.post('/posts/:id/comments', socialController.createComment)
router.delete('/comments/:id', socialController.deleteComment)

export default router
