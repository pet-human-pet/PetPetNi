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
  }
}
