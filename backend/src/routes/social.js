import express from 'express'
import { socialService } from '../services/socialService.js'

const router = express.Router()

// 取得貼文列表
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // TODO: 從 token 取得 userId (req.user.id)
    const userId = req.headers['x-user-id'] // 暫時用 header 或之後整合 auth middleware

    const result = await socialService.getPosts({ page, limit, userId })
    res.json(result)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

// 建立貼文
router.post('/posts', async (req, res) => {
  try {
    // TODO: 整合真正的 Auth Middleware
    const userId = req.body.userId || 'uuid-placeholder'

    const { content, imageUrls, audience } = req.body

    // 簡單驗證
    if (!content && (!imageUrls || imageUrls.length === 0)) {
      return res.status(400).json({ error: 'Content or images are required' })
    }

    const newPost = await socialService.createPost(userId, {
      content,
      images: imageUrls,
      audience
    })

    res.json(newPost)
  } catch (error) {
    console.error('API Error in createPost:', error)
    res.status(500).json({ error: 'Failed to create post', details: error.message })
  }
})

// 按讚
router.post('/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId
    await socialService.likePost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' })
  }
})

// 取消讚
router.delete('/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId
    await socialService.unlikePost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike post' })
  }
})

// 刪除貼文
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id
    // TODO: 目前刪除不需要 userId，或者從 header/token 取得
    const userId = req.headers['x-user-id']
    await socialService.deletePost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    console.error('API delete post error:', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// 更新貼文
router.put('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.headers['x-user-id'] // TODO: Auth
    const { content, images, audience } = req.body

    const updatedPost = await socialService.updatePost(userId, postId, {
      content,
      images,
      audience
    })
    res.json(updatedPost)
  } catch (error) {
    console.error('API update post error:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

export default router
