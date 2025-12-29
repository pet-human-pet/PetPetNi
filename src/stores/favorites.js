import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const LS_KEY = 'favoriteEvents'

export const useFavoritesStore = defineStore('favorites', () => {
  // items: [{ id, title, desc }]
  const items = ref([])

  // init (兼容舊版：若存的是 id array 也能轉)
  const saved = localStorage.getItem(LS_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      // 新版：陣列物件
      if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === 'object') {
        items.value = parsed
      }
      // 舊版：陣列 id
      else if (Array.isArray(parsed)) {
        items.value = parsed.map((id) => ({ id, title: '', desc: '' }))
      } else {
        items.value = []
      }
    } catch {
      items.value = []
    }
  }

  // persist
  watch(items, (v) => localStorage.setItem(LS_KEY, JSON.stringify(v)), { deep: true })

  const count = computed(() => items.value.length)
  const ids = computed(() => items.value.map((x) => String(x.id)))

  function has(id) {
    return ids.value.includes(String(id))
  }

  // toggle 接收「活動物件」(至少有 id/title/desc)
  function toggle(evt) {
    const key = String(evt?.id ?? '')
    if (!key) return

    if (has(key)) {
      items.value = items.value.filter((x) => String(x.id) !== key)
      return
    }

    items.value = [
      ...items.value,
      {
        id: evt.id,
        title: evt.title ?? '',
        desc: evt.desc ?? ''
      }
    ]
  }

  function clear() {
    items.value = []
  }

  return { items, count, ids, has, toggle, clear }
})
