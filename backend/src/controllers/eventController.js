import { eventService } from '../services/eventService.js'
import { supabase } from '../services/supabase.js'

/**
 * Helper 函式：從 Authorization header 取得並驗證使用者
 * @param {Object} req - Express request 物件
 * @returns {Promise<{uuid: string, userIdInt: number}|null>} 使用者資訊或 null
 */
async function getUserFromToken(req) {
  try {
    // 1. 從 Authorization header 取得 token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ 未提供授權 token')
      return null
    }

    const token = authHeader.split(' ')[1]

    // 2. 驗證 token 並取得使用者資料
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.error('❌ Token 驗證失敗:', authError)
      return null
    }

    const userUuid = authData.user.id
    console.log('✅ Token 驗證成功，使用者 UUID:', userUuid)

    // 3. 從 profiles 表查詢對應的 user_id_int
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id_int')
      .eq('user_id', userUuid)
      .single()

    if (profileError || !profile?.user_id_int) {
      console.error('❌ 查詢 user_id_int 失敗:', profileError)
      return null
    }

    console.log('✅ 取得 user_id_int:', profile.user_id_int)

    return {
      uuid: userUuid,
      userIdInt: profile.user_id_int
    }
  } catch (error) {
    console.error('❌ Error in getUserFromToken:', error)
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
      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '未授權：請先登入'
        })
      }

      const userIdInt = user.userIdInt

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

      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const updates = req.body
      delete updates.user_id // 移除 user_id，避免被修改
      delete updates.user_id_int // 移除 user_id_int，避免被修改

      const updatedEvent = await eventService.updateEvent(id, user.userIdInt, updates)
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

      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      await eventService.deleteEvent(id, user.userIdInt)
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

      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const participation = await eventService.joinEvent(id, user.userIdInt)
      res.status(201).json({ success: true, data: participation, message: '成功加入活動' })
    } catch (error) {
      console.error('❌ Error in joinEvent:', error)

      // 處理不同類型的錯誤
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: '您已經加入此活動' })
      }

      if (error.code === 'EVENT_FULL') {
        return res.status(400).json({ success: false, message: '活動報名人數已滿' })
      }

      if (error.message.includes('找不到此活動')) {
        return res.status(404).json({ success: false, message: '找不到此活動' })
      }

      if (error.message.includes('已關閉報名')) {
        return res.status(400).json({ success: false, message: '此活動已關閉報名' })
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

      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      await eventService.leaveEvent(id, user.userIdInt)
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
  },

  /**
   * GET /api/events/my - 取得當前使用者發起的活動列表
   */
  async getMyEvents(req, res) {
    try {
      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const events = await eventService.getUserEvents(user.userIdInt)
      res.json({ success: true, data: events })
    } catch (error) {
      console.error('❌ Error in getMyEvents:', error)
      res.status(500).json({ success: false, message: '取得我的活動失敗', error: error.message })
    }
  },

  /**
   * GET /api/events/participated - 取得當前使用者參加的活動列表
   */
  async getMyParticipatedEvents(req, res) {
    try {
      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const events = await eventService.getUserParticipatedEvents(user.userIdInt)
      res.json({ success: true, data: events })
    } catch (error) {
      console.error('❌ Error in getMyParticipatedEvents:', error)
      res.status(500).json({
        success: false,
        message: '取得參加的活動失敗',
        error: error.message
      })
    }
  },

  /**
   * GET /api/events/:id/check-participation - 檢查是否已參加活動
   */
  async checkParticipation(req, res) {
    try {
      const { id } = req.params

      // 從 JWT token 取得真實登入的使用者
      const user = await getUserFromToken(req)

      if (!user) {
        return res.status(401).json({ success: false, message: '未授權：請先登入' })
      }

      const isParticipating = await eventService.checkUserParticipation(id, user.userIdInt)
      res.json({ success: true, data: { isParticipating } })
    } catch (error) {
      console.error('❌ Error in checkParticipation:', error)
      res.status(500).json({
        success: false,
        message: '檢查參加狀態失敗',
        error: error.message
      })
    }
  }
}
