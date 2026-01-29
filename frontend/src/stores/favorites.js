import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_KEY = 'favoriteEvents'

export const useFavoritesStore = defineStore('favorites', () => {
  // items: [{ id, title, desc }]
  const items = ref([])

  // init (簡潔版：直接讀取陣列)
  const saved = localStorage.getItem(LS_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        items.value = parsed
      }
    } catch {
      items.value = []
    }
  }

  // 模擬 API 呼叫的儲存動作
  function saveToLocalStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(items.value))
  }

  const count = computed(() => items.value.length)
  const ids = computed(() => items.value.map((x) => String(x.id)))

  function has(id) {
    return ids.value.includes(String(id))
  }

  // toggle 改為 async，並手動觸發儲存
  async function toggle(evt) {
    try {
      const key = String(evt?.id ?? '')
      if (!key) return

      if (has(key)) {
        items.value = items.value.filter((x) => String(x.id) !== key)
      } else {
        items.value = [
          ...items.value,
          {
            id: evt.id,
            title: evt.title ?? '',
            desc: evt.desc ?? ''
          }
        ]
      }

      // 手動儲存
      saveToLocalStorage()
    } catch (e) {}
  }

  async function clear() {
    try {
      items.value = []
      saveToLocalStorage()
    } catch (e) {}
  }

  return { items, count, ids, has, toggle, clear }
})
