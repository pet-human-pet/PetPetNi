import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { eventApi } from '@/api/event'

export const useEventMapStore = defineStore('event', () => {
  const baseLocations = reactive({
    1: { name: '101 區域', x: 250, y: 515 },
    2: { name: '國父紀念館', x: 750, y: 470 },
    3: { name: '松菸區域', x: 1050, y: 380 },
    4: { name: '象山區域', x: 1490, y: 939 },
    5: { name: '市府區域', x: 845, y: 640 }
  })

  const events = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const visibleEvents = computed(() =>
    events.value.filter((e) => e.status !== 'pending' && e.status !== 'ended')
  )

  /**
   * 從後端載入所有活動
   */
  async function fetchEvents() {
    isLoading.value = true
    error.value = null
    try {
      const response = await eventApi.getEvents()
      if (response.data.success) {
        // 轉換後端欄位名稱為前端格式
        events.value = response.data.data.map((evt) => ({
          id: evt.id,
          locId: evt.location_id,
          title: evt.title,
          desc: evt.description,
          capacity: evt.capacity,
          startAt: evt.start_at,
          endAt: evt.end_at,
          contact: evt.contact,
          status: evt.status,
          participantsCount: evt.participants_count || 0,
          createdAt: evt.created_at,
          initiator: {
            id: evt.user_id_int,
            name: evt.initiator_nick_name || '未知使用者',
            avatar: evt.initiator_avatar_url || ''
          }
        }))
      }
    } catch (err) {
      console.error('❌ 載入活動失敗:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 建立新活動
   * 注意：後端會從 JWT token 取得真實的使用者資訊
   */
  async function addEvent(payload) {
    isLoading.value = true
    error.value = null
    try {
      // 後端會從 Authorization header 的 JWT token 取得使用者資訊
      // 不需要在這裡傳送 user_id
      const eventData = {
        title: payload.title,
        locId: payload.locId,
        capacity: payload.capacity,
        startAt: payload.startAt,
        endAt: payload.endAt,
        contact: payload.contact,
        desc: payload.desc
      }

      const response = await eventApi.createEvent(eventData)

      if (response.data.success) {
        const newEvt = response.data.data
        const formattedEvent = {
          id: newEvt.id,
          locId: newEvt.location_id,
          title: newEvt.title,
          desc: newEvt.description,
          capacity: newEvt.capacity,
          startAt: newEvt.start_at,
          endAt: newEvt.end_at,
          contact: newEvt.contact,
          status: newEvt.status,
          participantsCount: 0,
          createdAt: newEvt.created_at,
          initiator: {
            id: newEvt.user_id_int,
            name: '我', // 目前使用者
            avatar: '' // TODO: 可從 auth store 取得當前使用者頭像
          }
        }

        events.value.unshift(formattedEvent)
        return formattedEvent
      }
    } catch (err) {
      console.error('❌ 建立活動失敗:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 參加活動
   * @param {string} eventId - 活動 ID
   */
  async function joinEvent(eventId) {
    try {
      const response = await eventApi.joinEvent(eventId)

      if (response.data.success) {
        // 更新本地活動的參與人數
        const event = events.value.find((e) => String(e.id) === String(eventId))
        if (event) {
          event.participantsCount = (event.participantsCount || 0) + 1
        }
        return { success: true, message: response.data.message }
      }
    } catch (err) {
      console.error('❌ 參加活動失敗:', err)
      const errorMessage = err.response?.data?.message || '參加活動失敗，請稍後再試'
      throw new Error(errorMessage)
    }
  }

  /**
   * 離開活動
   * @param {string} eventId - 活動 ID
   */
  async function leaveEvent(eventId) {
    try {
      const response = await eventApi.leaveEvent(eventId)

      if (response.data.success) {
        // 更新本地活動的參與人數
        const event = events.value.find((e) => String(e.id) === String(eventId))
        if (event && event.participantsCount > 0) {
          event.participantsCount = event.participantsCount - 1
        }
        return { success: true, message: response.data.message }
      }
    } catch (err) {
      console.error('❌ 離開活動失敗:', err)
      const errorMessage = err.response?.data?.message || '離開活動失敗，請稍後再試'
      throw new Error(errorMessage)
    }
  }

  /**
   * 取得我發起的活動列表
   */
  async function fetchMyEvents() {
    isLoading.value = true
    error.value = null
    try {
      const response = await eventApi.getMyEvents()
      if (response.data.success) {
        // 轉換後端欄位名稱為前端格式
        return response.data.data.map((evt) => ({
          id: evt.id,
          locId: evt.location_id,
          title: evt.title,
          desc: evt.description,
          capacity: evt.capacity,
          startAt: evt.start_at,
          endAt: evt.end_at,
          contact: evt.contact,
          status: evt.status,
          participantsCount: evt.participants_count || 0,
          createdAt: evt.created_at,
          initiator: {
            id: evt.user_id_int,
            name: evt.initiator_nick_name || '未知使用者',
            avatar: evt.initiator_avatar_url || ''
          }
        }))
      }
      return []
    } catch (err) {
      console.error('❌ 載入我的活動失敗:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刪除活動
   * @param {string} eventId - 活動 ID
   */
  async function deleteEvent(eventId) {
    try {
      const response = await eventApi.deleteEvent(eventId)

      if (response.data.success) {
        // 從本地列表中移除該活動
        const index = events.value.findIndex((e) => String(e.id) === String(eventId))
        if (index !== -1) {
          events.value.splice(index, 1)
        }
        return { success: true, message: response.data.message || '活動已刪除' }
      }
    } catch (err) {
      console.error('❌ 刪除活動失敗:', err)
      const errorMessage = err.response?.data?.message || '刪除活動失敗，請稍後再試'
      throw new Error(errorMessage)
    }
  }

  /**
   * 取得我參加的活動列表
   */
  async function fetchMyParticipatedEvents() {
    isLoading.value = true
    error.value = null
    try {
      const response = await eventApi.getMyParticipatedEvents()
      if (response.data.success) {
        // 轉換後端欄位名稱為前端格式
        return response.data.data.map((evt) => ({
          id: evt.id,
          locId: evt.location_id,
          title: evt.title,
          desc: evt.description,
          capacity: evt.capacity,
          startAt: evt.start_at,
          endAt: evt.end_at,
          contact: evt.contact,
          status: evt.status,
          participantsCount: evt.participants_count || 0,
          createdAt: evt.created_at,
          initiator: {
            id: evt.user_id_int,
            name: evt.initiator_nick_name || '未知使用者',
            avatar: evt.initiator_avatar_url || ''
          }
        }))
      }
      return []
    } catch (err) {
      console.error('❌ 載入參加的活動失敗:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 檢查是否已參加活動
   * @param {string} eventId - 活動 ID
   */
  async function checkParticipation(eventId) {
    try {
      const response = await eventApi.checkParticipation(eventId)
      if (response.data.success) {
        return response.data.data.isParticipating
      }
      return false
    } catch (err) {
      console.error('❌ 檢查參加狀態失敗:', err)
      return false
    }
  }

  return {
    baseLocations,
    events,
    visibleEvents,
    isLoading,
    error,
    fetchEvents,
    addEvent,
    joinEvent,
    leaveEvent,
    fetchMyEvents,
    deleteEvent,
    fetchMyParticipatedEvents,
    checkParticipation
  }
})
