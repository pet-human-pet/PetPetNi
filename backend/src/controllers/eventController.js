import { eventService } from '../services/eventService.js'
import { supabase } from '../services/supabase.js'

/**
 * Helper 函式：從 UUID 取得對應的 user_id_int
 * @param {string} userUuid - 使用者的 UUID (來自 auth.users)
 * @returns {Promise<number|null>} user_id_int 或 null
 */
async function getUserIdInt(userUuid) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id_int')
      .eq('user_id', userUuid)
      .single()

    if (error) {
      console.error('❌ Error fetching user_id_int:', error)
      return null
    }

    return data?.user_id_int || null
  } catch (error) {
    console.error('❌ Error in getUserIdInt:', error)
    return null
  }
}

export const eventController = {
  /**
   * GET /api/events/locations - 取得所有地點
   */
  async getLocations(req, res) {
    try {
      const locations = await eventService.getLocations()
      res.json({ success: true, data: locations })
    } catch (error) {
      console.error('❌ Error in getLocations:', error)
      res.status(500).json({ success: false, message: '取得地點資料失敗', error: error.message })
    }
  },

  /**
   * GET /api/events - 取得活動列表
   */
  async getEvents(req, res) {
    try {
      const events = await eventService.getEvents()
      res.json({ success: true, data: events })
    } catch (error) {
      console.error('❌ Error in getEvents:', error)
      res.status(500).json({ success: false, message: '取得活動列表失敗', error: error.message })
    }
  },

  /**
   * GET /api/events/:id - 取得單一活動
   */
  async getEventById(req, res) {
    try {
      const { id } = req.params
      const event = await eventService.getEventById(id)

      if (!event) {
        return res.status(404).json({ success: false, message: '找不到此活動' })
      }

      res.json({ success: true, data: event })
    } catch (error) {
      console.error('❌ Error in getEventById:', error)
      res.status(500).json({ success: false, message: '取得活動詳情失敗', error: error.message })
    }
  },

  /**
   * POST /api/events - 建立新活動
   */
  async createEvent(req, res) {
    try {
      // 從 request 取得使用者 UUID
      let userUuid = req.body.user_id || req.user?.id

      // 開發階段：如果沒有 UUID，使用測試用的 UUID
      if (!userUuid || userUuid === 'temp-user-id') {
        userUuid = '00000000-0000-0000-0000-000000000000'
        console.log('⚠️ 使用測試 UUID，請之後整合真實的使用者認證')
      }

      // 從 profiles 表查詢對應的 user_id_int
      const userIdInt = await getUserIdInt(userUuid)

      if (!userIdInt) {
        return res.status(400).json({
          success: false,
          message: '無法取得使用者資訊，請確認使用者已完成註冊'
        })
      }

      const eventData = {
        title: req.body.title,
        location_id: req.body.location_id || req.body.locId,
        capacity: req.body.capacity,
        start_at: req.body.start_at || req.body.startAt,
        end_at: req.body.end_at || req.body.endAt,
        contact: req.body.contact,
        description: req.body.description || req.body.desc
      }

      // 驗證必填欄位
      const requiredFields = ['title', 'location_id', 'capacity', 'start_at', 'end_at', 'contact', 'description']
      const missingFields = requiredFields.filter(field => !eventData[field])

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: '缺少必填欄位',
          missingFields
        })
      }

      const newEvent = await eventService.createEvent(userIdInt, eventData)
      res.status(201).json({ success: true, data: newEvent })
    } catch (error) {
      console.error('❌ Error in createEvent:', error)
      res.status(500).json({ success: false, message: '建立活動失敗', error: error.message })
    }
  },

  /**
   * PUT /api/events/:id - 更新活動
   */
  async updateEvent(req, res) {
    try {
      const { id } = req.params
      const userUuid = req.body.user_id || req.user?.id

      if (!userUuid) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      // 從 profiles 表查詢對應的 user_id_int
      const userIdInt = await getUserIdInt(userUuid)

      if (!userIdInt) {
        return res.status(400).json({
          success: false,
          message: '無法取得使用者資訊'
        })
      }

      const updates = req.body
      delete updates.user_id // 移除 user_id，避免被修改
      delete updates.user_id_int // 移除 user_id_int，避免被修改

      const updatedEvent = await eventService.updateEvent(id, userIdInt, updates)
      res.json({ success: true, data: updatedEvent })
    } catch (error) {
      console.error('❌ Error in updateEvent:', error)
      res.status(500).json({ success: false, message: '更新活動失敗', error: error.message })
    }
  },

  /**
   * DELETE /api/events/:id - 刪除活動
   */
  async deleteEvent(req, res) {
    try {
      const { id } = req.params
      const userUuid = req.body.user_id || req.user?.id

      if (!userUuid) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      // 從 profiles 表查詢對應的 user_id_int
      const userIdInt = await getUserIdInt(userUuid)

      if (!userIdInt) {
        return res.status(400).json({
          success: false,
          message: '無法取得使用者資訊'
        })
      }

      await eventService.deleteEvent(id, userIdInt)
      res.json({ success: true, message: '活動已刪除' })
    } catch (error) {
      console.error('❌ Error in deleteEvent:', error)
      res.status(500).json({ success: false, message: '刪除活動失敗', error: error.message })
    }
  },

  /**
   * POST /api/events/:id/join - 加入活動
   */
  async joinEvent(req, res) {
    try {
      const { id } = req.params
      const userUuid = req.body.user_id || req.user?.id

      if (!userUuid) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      // 從 profiles 表查詢對應的 user_id_int
      const userIdInt = await getUserIdInt(userUuid)

      if (!userIdInt) {
        return res.status(400).json({
          success: false,
          message: '無法取得使用者資訊'
        })
      }

      const participation = await eventService.joinEvent(id, userIdInt)
      res.status(201).json({ success: true, data: participation })
    } catch (error) {
      console.error('❌ Error in joinEvent:', error)

      // 處理重複加入的錯誤
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: '您已經加入此活動' })
      }

      res.status(500).json({ success: false, message: '加入活動失敗', error: error.message })
    }
  },

  /**
   * DELETE /api/events/:id/leave - 離開活動
   */
  async leaveEvent(req, res) {
    try {
      const { id } = req.params
      const userUuid = req.body.user_id || req.user?.id

      if (!userUuid) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      // 從 profiles 表查詢對應的 user_id_int
      const userIdInt = await getUserIdInt(userUuid)

      if (!userIdInt) {
        return res.status(400).json({
          success: false,
          message: '無法取得使用者資訊'
        })
      }

      await eventService.leaveEvent(id, userIdInt)
      res.json({ success: true, message: '已離開活動' })
    } catch (error) {
      console.error('❌ Error in leaveEvent:', error)
      res.status(500).json({ success: false, message: '離開活動失敗', error: error.message })
    }
  },

  /**
   * GET /api/events/:id/participants - 取得活動參與者
   */
  async getParticipants(req, res) {
    try {
      const { id } = req.params
      const participants = await eventService.getEventParticipants(id)
      res.json({ success: true, data: participants })
    } catch (error) {
      console.error('❌ Error in getParticipants:', error)
      res.status(500).json({ success: false, message: '取得參與者列表失敗', error: error.message })
    }
  }
}
