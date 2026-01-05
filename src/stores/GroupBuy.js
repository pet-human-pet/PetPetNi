import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGroupBuyStore = defineStore('groupBuy', () => {
  const groupBuys = ref([
    {
      id: 201,
      title: '法鬥專用雨衣團購',
      price: 450,
      target: 30,
      img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
      desc: '這款雨衣透氣又防水,適合台灣潮濕的天氣。湊滿30件廠商給批發價!',
      status: 'approved'
    },
    {
      id: 202,
      title: '手工雞肉乾零食',
      price: 180,
      target: 50,
      img: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80',
      desc: '無添加防腐劑,自家烘焙,每包100g。需要冷藏保存。',
      status: 'approved'
    }
  ])

  const approvedGroupBuys = computed(() => groupBuys.value.filter((g) => g.status === 'approved'))

  const pendingGroupBuys = computed(() =>
    groupBuys.value
      .filter((g) => g.status === 'pending')
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  )

  function addGroupBuy(payload) {
    const newGb = {
      ...payload,
      status: payload.status ?? 'pending',
      createdAt: payload.createdAt ?? Date.now()
    }
    groupBuys.value.unshift(newGb)
    return newGb
  }

  return {
    groupBuys,
    approvedGroupBuys,
    pendingGroupBuys,
    addGroupBuy
  }
})
