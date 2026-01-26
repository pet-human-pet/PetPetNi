import api from './index'

/**
 * 追蹤相關 API
 */
export const followApi = {
  /**
   * 追蹤用戶
   * @param {number} userIdInt - 目標用戶的 user_id_int
   */
  followUser(userIdInt) {
    return api.post(`/api/follow/${userIdInt}`)
  },

  /**
   * 取消追蹤
   * @param {number} userIdInt - 目標用戶的 user_id_int
   */
  unfollowUser(userIdInt) {
    return api.delete(`/api/follow/${userIdInt}`)
  },

  /**
   * 取得追蹤狀態
   * @param {number} userIdInt - 目標用戶的 user_id_int
   * @returns {Promise<{isFollowing: boolean}>}
   */
  getFollowStatus(userIdInt) {
    return api.get(`/api/follow/status/${userIdInt}`)
  },

  /**
   * 取得粉絲數和追蹤數
   * @param {number} userIdInt - 用戶的 user_id_int
   * @returns {Promise<{followersCount: number, followingCount: number}>}
   */
  getFollowCounts(userIdInt) {
    return api.get(`/api/follow/counts/${userIdInt}`)
  },

  /**
   * 取得粉絲列表
   * @param {number} userIdInt - 用戶的 user_id_int
   * @param {number} limit - 限制數量
   * @param {number} offset - 偏移量
   */
  getFollowersList(userIdInt, limit = 20, offset = 0) {
    return api.get(`/api/follow/followers/${userIdInt}`, { params: { limit, offset } })
  },

  /**
   * 取得追蹤中列表
   * @param {number} userIdInt - 用戶的 user_id_int
   * @param {number} limit - 限制數量
   * @param {number} offset - 偏移量
   */
  getFollowingList(userIdInt, limit = 20, offset = 0) {
    return api.get(`/api/follow/following/${userIdInt}`, { params: { limit, offset } })
  },

  /**
   * 取得其他用戶的公開 Profile
   * @param {number} userIdInt - 用戶的 user_id_int
   */
  getPublicProfile(userIdInt) {
    return api.get(`/api/user/profile/${userIdInt}`)
  }
}

export default followApi
