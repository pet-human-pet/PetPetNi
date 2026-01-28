import api from './index'

export const chatApi = {
  // ========================================
  // 聊天室管理
  // ========================================

  /**
   * 取得使用者的所有聊天室
   */
  getRooms() {
    return api.get('/api/chat/rooms')
  },

  /**
   * 取得單一個聊天室資訊
   * @param {string} roomId - 房間 ID
   */
  getRoom(roomId) {
    return api.get(`/api/chat/rooms/${roomId}`)
  },

  /**
   * 取得房間成員列表
   * @param {string} roomId - 房間 ID
   */
  getRoomMembers(roomId) {
    return api.get(`/api/chat/rooms/${roomId}/members`)
  },

  /**
   * 取得歷史訊息
   * @param {string} roomId - 房間 ID
   */
  getHistory(roomId) {
    return api.get(`/api/chat/history/${roomId}`)
  },

  // ========================================
  // 私訊功能
  // ========================================

  /**
   * 開始私訊（找到或建立私訊房間）
   * @param {number} targetUserId - 對方的 user_id_int
   */
  startPrivateChat(targetUserId) {
    return api.post('/api/chat/private', { targetUserId })
  },

  // ========================================
  // 群聊功能
  // ========================================

  /**
   * 建立群組聊天室
   * @param {Object} data - { name: string, memberIds: number[], avatar?: string }
   */
  createGroup(data) {
    return api.post('/api/chat/group', data)
  },

  /**
   * 加入群組成員
   * @param {string} roomId - 房間 ID
   * @param {number[]} memberIds - 要加入的成員 ID 陣列
   */
  addMembers(roomId, memberIds) {
    return api.post(`/api/chat/group/${roomId}/members`, { memberIds })
  },

  /**
   * 移除群組成員
   * @param {string} roomId - 房間 ID
   * @param {number} userId - 要移除的成員 ID
   */
  removeMember(roomId, userId) {
    return api.delete(`/api/chat/group/${roomId}/members/${userId}`)
  },

  // ========================================
  // 敲敲門功能
  // ========================================

  /**
   * 接受敲敲門
   * @param {string} roomId - 房間 ID
   */
  acceptKnock(roomId) {
    return api.post(`/api/chat/knock/${roomId}/accept`)
  },

  /**
   * 拒絕敲敲門
   * @param {string} roomId - 房間 ID
   */
  rejectKnock(roomId) {
    return api.post(`/api/chat/knock/${roomId}/reject`)
  },

  /**
   * 確認成為好友
   * @param {string} roomId - 房間 ID
   */
  confirmFriend(roomId) {
    return api.post(`/api/chat/knock/${roomId}/confirm-friend`)
  },

  /**
   * 更新敲敲門訊息計數
   * @param {string} roomId - 房間 ID
   */
  incrementKnockCount(roomId) {
    return api.post(`/api/chat/knock/${roomId}/increment-count`)
  },

  /**
   * 標記房間訊息為已讀
   * @param {string} roomId - 房間 ID
   */
  markAsRead(roomId) {
    return api.post(`/api/chat/rooms/${roomId}/read`)
  },

  /**
   * 解除好友關係
   * @param {number} friendId - 好友的 user_id_int
   */
  removeFriend(friendId) {
    return api.delete(`/api/chat/friend/${friendId}`)
  },

  /**
   * 隱藏聊天室（刪除對話）
   * @param {string} roomId - 房間 ID
   */
  hideRoom(roomId) {
    return api.post(`/api/chat/rooms/${roomId}/hide`)
  }
}
