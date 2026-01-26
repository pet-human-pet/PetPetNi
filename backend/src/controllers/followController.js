import { supabase } from '../services/supabase.js'
import { followService } from '../services/followService.js'

/**
 * 從 token 取得當前用戶的 user_id_int
 */
const getUserIdIntFromToken = async (token) => {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    throw new Error('Token 無效或已過期')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id_int')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('找不到用戶資料')
  }

  return profile.user_id_int
}

export const followController = {
  /**
   * 追蹤用戶
   * POST /api/follow/:userIdInt
   */
  async followUser(req, res) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供授權 token' })
      }

      const token = authHeader.split(' ')[1]
      const followerIdInt = await getUserIdIntFromToken(token)
      const followingIdInt = parseInt(req.params.userIdInt, 10)

      if (isNaN(followingIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      await followService.followUser(followerIdInt, followingIdInt)

      // 取得最新的粉絲數（給被追蹤者）
      const { followersCount } = await followService.getFollowCounts(followingIdInt)

      // 取得追蹤者的最新追蹤數
      const { followingCount } = await followService.getFollowCounts(followerIdInt)

      res.status(200).json({
        success: true,
        message: '追蹤成功',
        data: {
          isFollowing: true,
          targetFollowersCount: followersCount,
          myFollowingCount: followingCount
        }
      })
    } catch (error) {
      console.error('❌ followUser 錯誤:', error)

      if (error.message === '無法追蹤自己') {
        return res.status(400).json({ error: error.message })
      }
      if (error.message === '已經追蹤此用戶') {
        return res.status(409).json({ error: error.message })
      }

      res.status(500).json({ error: error.message || '追蹤失敗' })
    }
  },

  /**
   * 取消追蹤
   * DELETE /api/follow/:userIdInt
   */
  async unfollowUser(req, res) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供授權 token' })
      }

      const token = authHeader.split(' ')[1]
      const followerIdInt = await getUserIdIntFromToken(token)
      const followingIdInt = parseInt(req.params.userIdInt, 10)

      if (isNaN(followingIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      await followService.unfollowUser(followerIdInt, followingIdInt)

      // 取得最新的粉絲數（給被追蹤者）
      const { followersCount } = await followService.getFollowCounts(followingIdInt)

      // 取得追蹤者的最新追蹤數
      const { followingCount } = await followService.getFollowCounts(followerIdInt)

      res.status(200).json({
        success: true,
        message: '已取消追蹤',
        data: {
          isFollowing: false,
          targetFollowersCount: followersCount,
          myFollowingCount: followingCount
        }
      })
    } catch (error) {
      console.error('❌ unfollowUser 錯誤:', error)
      res.status(500).json({ error: error.message || '取消追蹤失敗' })
    }
  },

  /**
   * 取得追蹤狀態
   * GET /api/follow/status/:userIdInt
   */
  async getFollowStatus(req, res) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供授權 token' })
      }

      const token = authHeader.split(' ')[1]
      const myIdInt = await getUserIdIntFromToken(token)
      const targetIdInt = parseInt(req.params.userIdInt, 10)

      if (isNaN(targetIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      const isFollowing = await followService.isFollowing(myIdInt, targetIdInt)

      res.status(200).json({
        success: true,
        data: { isFollowing }
      })
    } catch (error) {
      console.error('❌ getFollowStatus 錯誤:', error)
      res.status(500).json({ error: error.message || '取得追蹤狀態失敗' })
    }
  },

  /**
   * 取得粉絲數和追蹤數
   * GET /api/follow/counts/:userIdInt
   */
  async getFollowCounts(req, res) {
    try {
      const userIdInt = parseInt(req.params.userIdInt, 10)

      if (isNaN(userIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      const counts = await followService.getFollowCounts(userIdInt)

      res.status(200).json({
        success: true,
        data: counts
      })
    } catch (error) {
      console.error('❌ getFollowCounts 錯誤:', error)
      res.status(500).json({ error: error.message || '取得追蹤數量失敗' })
    }
  },

  /**
   * 取得粉絲列表
   * GET /api/follow/followers/:userIdInt
   */
  async getFollowersList(req, res) {
    try {
      const userIdInt = parseInt(req.params.userIdInt, 10)
      const limit = parseInt(req.query.limit, 10) || 20
      const offset = parseInt(req.query.offset, 10) || 0

      if (isNaN(userIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      const followers = await followService.getFollowersList(userIdInt, limit, offset)

      res.status(200).json({
        success: true,
        data: followers
      })
    } catch (error) {
      console.error('❌ getFollowersList 錯誤:', error)
      res.status(500).json({ error: error.message || '取得粉絲列表失敗' })
    }
  },

  /**
   * 取得追蹤中列表
   * GET /api/follow/following/:userIdInt
   */
  async getFollowingList(req, res) {
    try {
      const userIdInt = parseInt(req.params.userIdInt, 10)
      const limit = parseInt(req.query.limit, 10) || 20
      const offset = parseInt(req.query.offset, 10) || 0

      if (isNaN(userIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      const following = await followService.getFollowingList(userIdInt, limit, offset)

      res.status(200).json({
        success: true,
        data: following
      })
    } catch (error) {
      console.error('❌ getFollowingList 錯誤:', error)
      res.status(500).json({ error: error.message || '取得追蹤列表失敗' })
    }
  }
}

export default followController
