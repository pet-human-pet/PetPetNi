import api from './index'

export const eventApi = {
  /**
   * 取得所有地點
   */
  getLocations() {
    return api.get('/events/locations')
  },

  /**
   * 取得活動列表
   */
  getEvents() {
    return api.get('/events')
  },

  /**
   * 取得單一活動詳情
   */
  getEventById(eventId) {
    return api.get(`/events/${eventId}`)
  },

  /**
   * 建立新活動
   * @param {Object} eventData - 活動資料
   */
  createEvent(eventData) {
    return api.post('/events', eventData)
  },

  /**
   * 更新活動
   */
  updateEvent(eventId, updates) {
    return api.put(`/events/${eventId}`, updates)
  },

  /**
   * 刪除活動
   */
  deleteEvent(eventId) {
    return api.delete(`/events/${eventId}`)
  },

  /**
   * 加入活動
   */
  joinEvent(eventId) {
    return api.post(`/events/${eventId}/join`)
  },

  /**
   * 離開活動
   */
  leaveEvent(eventId) {
    return api.delete(`/events/${eventId}/leave`)
  },

  /**
   * 取得活動參與者列表
   */
  getParticipants(eventId) {
    return api.get(`/events/${eventId}/participants`)
  }
}
