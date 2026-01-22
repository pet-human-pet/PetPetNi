import { supabase } from './supabase.js'

export const eventService = {
  /**
   * 取得所有地點資料
   */
  async getLocations() {
    try {
      const { data, error } = await supabase
        .from('base_locations')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error fetching locations:', error)
      throw error
    }
  },

  /**
   * 取得活動列表（含地點資訊和參與人數）
   * @param {Object} filters - 篩選條件（可選）
   */
  async getEvents(filters = {}) {
    try {
      const { data, error } = await supabase
        .from('events_with_stats')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error fetching events:', error)
      throw error
    }
  },

  /**
   * 取得單一活動詳情
   * @param {string} eventId - 活動 ID
   */
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('events_with_stats')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error fetching event:', error)
      throw error
    }
  },

  /**
   * 建立新活動
   * @param {string} userId - 使用者 ID
   * @param {Object} eventData - 活動資料
   */
  async createEvent(userId, eventData) {
    try {
      const { title, location_id, capacity, start_at, end_at, contact, description } = eventData

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            user_id: userId,
            location_id,
            title,
            description,
            capacity,
            start_at,
            end_at,
            contact,
            status: 'open'
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating event:', error)
      throw error
    }
  },

  /**
   * 更新活動
   * @param {string} eventId - 活動 ID
   * @param {string} userId - 使用者 ID（用於權限驗證）
   * @param {Object} updates - 要更新的欄位
   */
  async updateEvent(eventId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', userId) // 確保只能更新自己的活動
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating event:', error)
      throw error
    }
  },

  /**
   * 刪除活動
   * @param {string} eventId - 活動 ID
   * @param {string} userId - 使用者 ID（用於權限驗證）
   */
  async deleteEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId) // 確保只能刪除自己的活動

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting event:', error)
      throw error
    }
  },

  /**
   * 加入活動
   * @param {string} eventId - 活動 ID
   * @param {string} userId - 使用者 ID
   */
  async joinEvent(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .insert([
          {
            event_id: eventId,
            user_id: userId,
            status: 'joined'
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error joining event:', error)
      throw error
    }
  },

  /**
   * 離開活動
   * @param {string} eventId - 活動 ID
   * @param {string} userId - 使用者 ID
   */
  async leaveEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('❌ Error leaving event:', error)
      throw error
    }
  },

  /**
   * 取得活動參與者列表
   * @param {string} eventId - 活動 ID
   */
  async getEventParticipants(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*, user:auth.users(id, email)')
        .eq('event_id', eventId)
        .eq('status', 'joined')

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error fetching participants:', error)
      throw error
    }
  }
}
