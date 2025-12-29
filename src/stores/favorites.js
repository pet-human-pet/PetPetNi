import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  // 用字串統一 id，避免 Number/String 比對問題
  const ids = ref([])

  // init
  const saved = localStorage.getItem('favoriteEventIds')
  if (saved) {
    try {
      ids.value = JSON.parse(saved) || []
    } catch {
      ids.value = []
    }
  }

  // persist
  watch(ids, (v) => localStorage.setItem('favoriteEventIds', JSON.stringify(v)), { deep: true })

  const count = computed(() => ids.value.length)

  function has(id) {
    return ids.value.includes(String(id))
  }

  function toggle(id) {
    const key = String(id)
    if (has(key)) ids.value = ids.value.filter((x) => x !== key)
    else ids.value = [...ids.value, key]
  }

  function clear() {
    ids.value = []
  }

  return { ids, count, has, toggle, clear }
})
