/* eslint-disable no-console */
import express from 'express'
import { socialService } from '../services/socialService.js'

const router = express.Router()

console.log('✅ Social Routes Loaded!')

// 取得貼文列表
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // TODO: 未來實作 Auth Middleware 後，從 req.user.id 取得
    const userId = req.headers['x-user-id'] || null

    const result = await socialService.getPosts({ page, limit, userId })
    res.json(result)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

// 建立貼文
// TODO: 未來在獨立 issue 中實作 auth middleware
router.post('/posts', async (req, res) => {
  try {
    // 暫時由前端傳 userId，未來改由 token 解析 (req.user.id)
    const userId = req.body.userId || req.headers['x-user-id'] || 'uuid-placeholder'
    const { content, imageUrls, audience } = req.body

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
// TODO: 實作 auth middleware
router.post('/posts/:id/like', async (req, res) => {
  console.log(`[API] Like Request: Post ${req.params.id}`)
  try {
    const postId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']

    await socialService.likePost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    console.error('Like Error:', error)
    res.status(500).json({ error: 'Failed to like post' })
  }
})

// 取消讚
router.delete('/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']

    await socialService.unlikePost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    console.error('Unlike Error:', error)
    res.status(500).json({ error: 'Failed to unlike post' })
  }
})

// 收藏貼文
router.post('/posts/:id/bookmark', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']

    await socialService.bookmarkPost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    console.error('Bookmark Error:', error)
    res.status(500).json({ error: 'Failed to bookmark post' })
  }
})

// 取消收藏
router.delete('/posts/:id/bookmark', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']

    await socialService.unbookmarkPost(userId, postId)
    res.json({ success: true })
  } catch (error) {
    console.error('Unbookmark Error:', error)
    res.status(500).json({ error: 'Failed to unbookmark post' })
  }
})

// 刪除貼文
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']
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
    const userId = req.body.userId || req.headers['x-user-id']
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

// 取得留言
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id
    const comments = await socialService.getComments(postId)
    res.json(comments)
  } catch (error) {
    console.error('Get Comments Error:', error)
    res.status(500).json({ error: 'Failed to get comments' })
  }
})

// 建立留言
// TODO: 實作 auth middleware
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']
    const { content } = req.body

    if (!content) return res.status(400).json({ error: 'Comment content is required' })

    const comment = await socialService.createComment(userId, postId, content)
    res.json(comment)
  } catch (error) {
    console.error('Create Comment Error:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

// 刪除留言
router.delete('/comments/:id', async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.body.userId || req.headers['x-user-id']

    await socialService.deleteComment(userId, commentId)
    res.json({ success: true })
  } catch (error) {
    console.error('Delete Comment Error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

export default router
