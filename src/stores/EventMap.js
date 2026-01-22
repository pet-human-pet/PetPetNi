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
            id: evt.user_id,
            name: '活動發起人', // TODO: 從 user 資料取得名稱
            avatar: ''
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
   */
  async function addEvent(payload) {
    isLoading.value = true
    error.value = null
    try {
      // TODO: 取得真實的 user_id
      const eventData = {
        user_id: 'temp-user-id', // 暫時使用假的 user_id，之後要從 auth store 取得
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
            id: newEvt.user_id,
            name: '我',
            avatar: ''
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

  return {
    baseLocations,
    events,
    visibleEvents,
    isLoading,
    error,
    fetchEvents,
    addEvent
  }
})
