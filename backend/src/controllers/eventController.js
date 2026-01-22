import { eventService } from '../services/eventService.js'

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
      // TODO: 從 JWT token 或 session 取得 userId
      // 暫時從 request body 取得（開發階段）
      let userId = req.body.user_id || req.user?.id

      // 開發階段：如果 userId 不是有效的 UUID，使用測試用的 UUID
      if (!userId || userId === 'temp-user-id') {
        userId = '00000000-0000-0000-0000-000000000000' // 測試用的假 UUID
        console.log('⚠️ 使用測試 UUID，請之後整合真實的使用者認證')
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

      const newEvent = await eventService.createEvent(userId, eventData)
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
      const userId = req.body.user_id || req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      const updates = req.body
      delete updates.user_id // 移除 user_id，避免被修改

      const updatedEvent = await eventService.updateEvent(id, userId, updates)
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
      const userId = req.body.user_id || req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      await eventService.deleteEvent(id, userId)
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
      const userId = req.body.user_id || req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      const participation = await eventService.joinEvent(id, userId)
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
      const userId = req.body.user_id || req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: '未授權：需要登入' })
      }

      await eventService.leaveEvent(id, userId)
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
