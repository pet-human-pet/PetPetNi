import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEventMapStore = defineStore('event', () => {
  const baseLocations = {
    1: { name: '101 區域', x: 240, y: 420 },
    2: { name: '國父紀念館', x: 750, y: 300 },
    3: { name: '松菸區域', x: 1050, y: 250 },
    4: { name: '象山區域', x: 1490, y: 815 },
    5: { name: '市府區域', x: 900, y: 820 }
  }

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
    },
    {
      id: 3,
      locId: 3,
      title: '松山菸廠攝影競賽',
      desc: '歡迎拍攝好手，一起來參加攝影比賽!',
      status: 'ended',
      initiator: { id: 'u3', name: '張攝手', avatar: '' }
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
    events.value.push(newEvt)
    return newEvt
  }

  return {
    baseLocations,
    events,
    visibleEvents,
    addEvent
  }
})
