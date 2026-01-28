import api from './index'

export const eventApi = {
  /**
   * 取得所有地點
   */
  getLocations() {
    return api.get('/api/events/locations')
  },

  /**
   * 取得活動列表
   */
  getEvents() {
    return api.get('/api/events')
  },

  /**
   * 取得單一活動詳情
   */
  getEventById(eventId) {
    return api.get(`/api/events/${eventId}`)
  },

  /**
   * 建立新活動
   * @param {Object} eventData - 活動資料
   */
  createEvent(eventData) {
    return api.post('/api/events', eventData)
  },

  /**
   * 更新活動
   */
  updateEvent(eventId, updates) {
    return api.put(`/api/events/${eventId}`, updates)
  },

  /**
   * 刪除活動
   */
  deleteEvent(eventId) {
    return api.delete(`/api/events/${eventId}`)
  },

  /**
   * 加入活動
   */
  joinEvent(eventId) {
    return api.post(`/api/events/${eventId}/join`)
  },

  /**
   * 離開活動
   */
  leaveEvent(eventId) {
    return api.delete(`/api/events/${eventId}/leave`)
  },

  /**
   * 取得活動參與者列表
   */
  getParticipants(eventId) {
    return api.get(`/api/events/${eventId}/participants`)
  },

  /**
   * 取得我發起的活動列表
   */
  getMyEvents() {
    return api.get('/api/events/my')
  },

  /**
   * 取得我參加的活動列表
   */
  getMyParticipatedEvents() {
    return api.get('/api/events/participated')
  },

  /**
   * 檢查是否已參加活動
   */
  checkParticipation(eventId) {
    return api.get(`/api/events/${eventId}/check-participation`)
  }
}
