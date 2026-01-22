import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useEventMapStore = defineStore('event', () => {
  const baseLocations = reactive({
    1: { name: '101 區域', x: 250, y: 515 },
    2: { name: '國父紀念館', x: 750, y: 470 },
    3: { name: '松菸區域', x: 1050, y: 380 },
    4: { name: '象山區域', x: 1490, y: 939 },
    5: { name: '市府區域', x: 845, y: 640 }
  })

  const events = ref([
    {
      id: 1,
      locId: 1,
      title: '101 狗狗散步團',
      desc: '在 101 大樓下方的草地集合，享受週末陽光。',
      status: 'open',
      initiator: { id: 'u1', name: '王小明', avatar: '' }
    },
    {
      id: 2,
      locId: 2,
      title: '國父紀念館飛盤賽',
      desc: '歡迎各路飛盤好狗前來挑戰！',
      status: 'active',
      initiator: { id: 'u2', name: '李大華', avatar: '' }
    }
  ])

  const visibleEvents = computed(() =>
    events.value.filter((e) => e.status !== 'pending' && e.status !== 'ended')
  )

  function addEvent(payload) {
    const newEvt = {
      id: Date.now(),
      status: 'open',
      initiator: { id: 'me', name: '我', avatar: '' },
      ...payload
    }
    events.value.unshift(newEvt)
    return newEvt
  }

  return {
    baseLocations,
    events,
    visibleEvents,
    addEvent
  }
})
