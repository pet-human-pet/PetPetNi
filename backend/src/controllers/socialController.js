import { socialService } from '../services/socialService.js'
import { supabase } from '../services/supabase.js'

/**
 * Helper：從 Authorization header 取得並驗證使用者
 * @param {Object} req - Express request 物件
 * @returns {Promise<{uuid: string, userIdInt: number}|null>} 使用者資訊或 null
 */
async function getUserFromToken(req) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.error('❌ Token 驗證失敗:', authError)
      return null
    }

    const userUuid = authData.user.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id_int')
      .eq('user_id', userUuid)
      .single()

    if (profileError || !profile?.user_id_int) {
      console.error('❌ 查詢 user_id_int 失敗:', profileError)
      return null
    }

    return { uuid: userUuid, userIdInt: profile.user_id_int }
  } catch (error) {
    console.error('❌ Error in getUserFromToken:', error)
    return null
  }
}

export const socialController = {
  // 取得貼文列表
  async getPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10

      const user = await getUserFromToken(req)
      const userId = user?.uuid || null

      const result = await socialService.getPosts({ page, limit, userId })
      res.json(result)
    } catch (error) {
      console.error('API Error:', error)
      res.status(500).json({ error: 'Failed to fetch posts' })
    }
  },

  // 建立貼文
  async createPost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const { content, imageUrls, audience } = req.body

      if (!content && (!imageUrls || imageUrls.length === 0)) {
        return res.status(400).json({ error: 'Content or images are required' })
      }

      const newPost = await socialService.createPost(user.uuid, {
        content,
        images: imageUrls,
        audience
      })

      res.json(newPost)
    } catch (error) {
      console.error('API Error in createPost:', error)
      res.status(500).json({ error: 'Failed to create post', details: error.message })
    }
  },

  // 按讚
  async likePost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      await socialService.likePost(user.uuid, postId)
      res.json({ success: true })
    } catch (error) {
      console.error('Like Error:', error)
      res.status(500).json({ error: 'Failed to like post' })
    }
  },

  // 取消讚
  async unlikePost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      await socialService.unlikePost(user.uuid, postId)
      res.json({ success: true })
    } catch (error) {
      console.error('Unlike Error:', error)
      res.status(500).json({ error: 'Failed to unlike post' })
    }
  },

  // 收藏貼文
  async bookmarkPost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      await socialService.bookmarkPost(user.uuid, postId)
      res.json({ success: true })
    } catch (error) {
      console.error('Bookmark Error:', error)
      res.status(500).json({ error: 'Failed to bookmark post' })
    }
  },

  // 取消收藏
  async unbookmarkPost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      await socialService.unbookmarkPost(user.uuid, postId)
      res.json({ success: true })
    } catch (error) {
      console.error('Unbookmark Error:', error)
      res.status(500).json({ error: 'Failed to unbookmark post' })
    }
  },

  // 刪除貼文
  async deletePost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      await socialService.deletePost(user.uuid, postId)
      res.json({ success: true })
    } catch (error) {
      console.error('API delete post error:', error)
      res.status(500).json({ error: 'Failed to delete post' })
    }
  },

  // 更新貼文
  async updatePost(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      const { content, images, audience } = req.body

      const updatedPost = await socialService.updatePost(user.uuid, postId, {
        content,
        images,
        audience
      })
      res.json(updatedPost)
    } catch (error) {
      console.error('API update post error:', error)
      res.status(500).json({ error: 'Failed to update post' })
    }
  },

  // 取得留言
  async getComments(req, res) {
    try {
      const postId = req.params.id
      const comments = await socialService.getComments(postId)
      res.json(comments)
    } catch (error) {
      console.error('Get Comments Error:', error)
      res.status(500).json({ error: 'Failed to get comments' })
    }
  },

  // 建立留言
  async createComment(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const postId = req.params.id
      const { content } = req.body

      if (!content) return res.status(400).json({ error: 'Comment content is required' })

      const comment = await socialService.createComment(user.uuid, postId, content)
      res.json(comment)
    } catch (error) {
      console.error('Create Comment Error:', error)
      res.status(500).json({ error: 'Failed to create comment' })
    }
  },

  // 刪除留言
  async deleteComment(req, res) {
    try {
      const user = await getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: '未授權：請先登入' })
      }

      const commentId = req.params.id
      await socialService.deleteComment(user.uuid, commentId)
      res.json({ success: true })
    } catch (error) {
      console.error('Delete Comment Error:', error)
      res.status(500).json({ error: 'Failed to delete comment' })
    }
  }
}
