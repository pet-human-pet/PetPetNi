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
   * @param {number} userIdInt - 使用者 ID (BIGINT，來自 profiles.user_id_int)
   * @param {Object} eventData - 活動資料
   */
  async createEvent(userIdInt, eventData) {
    try {
      const { title, location_id, capacity, start_at, end_at, contact, description } = eventData

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            user_id_int: userIdInt,
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
   * @param {number} userIdInt - 使用者 ID（用於權限驗證，來自 profiles.user_id_int）
   * @param {Object} updates - 要更新的欄位
   */
  async updateEvent(eventId, userIdInt, updates) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id_int', userIdInt) // 確保只能更新自己的活動
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
   * @param {number} userIdInt - 使用者 ID（用於權限驗證，來自 profiles.user_id_int）
   */
  async deleteEvent(eventId, userIdInt) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id_int', userIdInt) // 確保只能刪除自己的活動

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
   * @param {number} userIdInt - 使用者 ID (BIGINT，來自 profiles.user_id_int)
   */
  async joinEvent(eventId, userIdInt) {
    try {
      // 1. 檢查活動是否存在，並取得人數上限和當前參加人數
      const { data: eventData, error: eventError } = await supabase
        .from('events_with_stats')
        .select('capacity, participants_count, status')
        .eq('id', eventId)
        .single()

      if (eventError || !eventData) {
        throw new Error('找不到此活動')
      }

      // 2. 檢查活動狀態
      if (eventData.status !== 'open' && eventData.status !== 'active') {
        throw new Error('此活動已關閉報名')
      }

      // 3. 檢查人數是否已滿
      const currentCount = eventData.participants_count || 0
      if (currentCount >= eventData.capacity) {
        const error = new Error('活動報名人數已滿')
        error.code = 'EVENT_FULL'
        throw error
      }

      // 4. 加入活動
      const { data, error } = await supabase
        .from('event_participants')
        .insert([
          {
            event_id: eventId,
            user_id_int: userIdInt,
            status: 'joined'
          }
        ])
        .select()
        .single()

      if (error) throw error

      console.log(`✅ 使用者 ${userIdInt} 成功加入活動 ${eventId}`)
      return data
    } catch (error) {
      console.error('❌ Error joining event:', error)
      throw error
    }
  },

  /**
   * 離開活動
   * @param {string} eventId - 活動 ID
   * @param {number} userIdInt - 使用者 ID (BIGINT，來自 profiles.user_id_int)
   */
  async leaveEvent(eventId, userIdInt) {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id_int', userIdInt)

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
        .select(`
          *,
          profiles:user_id_int (
            user_id_int,
            nick_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'joined')

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error fetching participants:', error)
      throw error
    }
  },

  /**
   * 取得使用者發起的活動列表
   * @param {number} userIdInt - 使用者 ID (BIGINT，來自 profiles.user_id_int)
   */
  async getUserEvents(userIdInt) {
    try {
      const { data, error } = await supabase
        .from('events_with_stats')
        .select('*')
        .eq('user_id_int', userIdInt)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching user events:', error)
      throw error
    }
  }
}
