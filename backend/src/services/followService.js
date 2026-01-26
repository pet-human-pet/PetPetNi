import { supabase } from './supabase.js'

// 追蹤服務處理用戶追蹤相關的資料庫操作
export const followService = {
  /**
   * 追蹤用戶
   * @param {number} followerIdInt - 追蹤者的 user_id_int
   * @param {number} followingIdInt - 被追蹤者的 user_id_int
   */
  async followUser(followerIdInt, followingIdInt) {
    // 防止自己追蹤自己
    if (followerIdInt === followingIdInt) {
      throw new Error('無法追蹤自己')
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id_int: followerIdInt,
        following_id_int: followingIdInt
      })
      .select()
      .single()

    if (error) {
      // 已經追蹤過的情況
      if (error.code === '23505') {
        throw new Error('已經追蹤此用戶')
      }
      console.error('❌ 追蹤失敗:', error)
      throw error
    }

    console.log(`✅ 用戶 ${followerIdInt} 追蹤了 ${followingIdInt}`)
    return data
  },

  /**
   * 取消追蹤
   * @param {number} followerIdInt - 追蹤者的 user_id_int
   * @param {number} followingIdInt - 被追蹤者的 user_id_int
   */
  async unfollowUser(followerIdInt, followingIdInt) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id_int', followerIdInt)
      .eq('following_id_int', followingIdInt)

    if (error) {
      console.error('❌ 取消追蹤失敗:', error)
      throw error
    }

    console.log(`✅ 用戶 ${followerIdInt} 取消追蹤了 ${followingIdInt}`)
    return true
  },

  /**
   * 檢查是否已追蹤
   * @param {number} followerIdInt - 追蹤者的 user_id_int
   * @param {number} followingIdInt - 被追蹤者的 user_id_int
   * @returns {Promise<boolean>}
   */
  async isFollowing(followerIdInt, followingIdInt) {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id_int')
      .eq('follower_id_int', followerIdInt)
      .eq('following_id_int', followingIdInt)
      .maybeSingle()

    if (error) {
      console.error('❌ 檢查追蹤狀態失敗:', error)
      throw error
    }

    return !!data
  },

  /**
   * 取得粉絲數量（有多少人追蹤此用戶）
   * @param {number} userIdInt - 用戶的 user_id_int
   * @returns {Promise<number>}
   */
  async getFollowersCount(userIdInt) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id_int', userIdInt)

    if (error) {
      console.error('❌ 取得粉絲數失敗:', error)
      throw error
    }

    return count || 0
  },

  /**
   * 取得追蹤中數量（此用戶追蹤了多少人）
   * @param {number} userIdInt - 用戶的 user_id_int
   * @returns {Promise<number>}
   */
  async getFollowingCount(userIdInt) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id_int', userIdInt)

    if (error) {
      console.error('❌ 取得追蹤數失敗:', error)
      throw error
    }

    return count || 0
  },

  /**
   * 取得粉絲數和追蹤數
   * @param {number} userIdInt - 用戶的 user_id_int
   * @returns {Promise<{followersCount: number, followingCount: number}>}
   */
  async getFollowCounts(userIdInt) {
    const [followersCount, followingCount] = await Promise.all([
      this.getFollowersCount(userIdInt),
      this.getFollowingCount(userIdInt)
    ])

    return { followersCount, followingCount }
  },

  /**
   * 取得粉絲列表
   * @param {number} userIdInt - 用戶的 user_id_int
   * @param {number} limit - 限制數量
   * @param {number} offset - 偏移量
   */
  async getFollowersList(userIdInt, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        follower_id_int,
        profiles:follower_id_int (
          user_id_int,
          nick_name,
          avatar_url
        ),
        created_at
      `
      )
      .eq('following_id_int', userIdInt)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ 取得粉絲列表失敗:', error)
      throw error
    }

    return data.map((item) => ({
      userIdInt: item.profiles?.user_id_int,
      nickName: item.profiles?.nick_name || '未知用戶',
      avatarUrl: item.profiles?.avatar_url || null,
      followedAt: item.created_at
    }))
  },

  /**
   * 取得追蹤中列表
   * @param {number} userIdInt - 用戶的 user_id_int
   * @param {number} limit - 限制數量
   * @param {number} offset - 偏移量
   */
  async getFollowingList(userIdInt, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(
        `
        following_id_int,
        profiles:following_id_int (
          user_id_int,
          nick_name,
          avatar_url
        ),
        created_at
      `
      )
      .eq('follower_id_int', userIdInt)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ 取得追蹤列表失敗:', error)
      throw error
    }

    return data.map((item) => ({
      userIdInt: item.profiles?.user_id_int,
      nickName: item.profiles?.nick_name || '未知用戶',
      avatarUrl: item.profiles?.avatar_url || null,
      followedAt: item.created_at
    }))
  }
}

export default followService
