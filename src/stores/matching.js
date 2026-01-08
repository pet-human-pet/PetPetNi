import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMatchingStore = defineStore('matching', () => {
  // State
  const hasMatchedToday = ref(false)
  const lastMatchDate = ref(null)
  const currentMatch = ref(null)
  const matchHistory = ref([])

  // Getters
  const canMatchToday = computed(() => {
    if (!lastMatchDate.value) return true
    const today = new Date().toDateString()
    const lastMatch = new Date(lastMatchDate.value).toDateString()
    return today !== lastMatch
  })

  // Actions
  function saveMatch(matchResult) {
    currentMatch.value = matchResult
    hasMatchedToday.value = true
    lastMatchDate.value = new Date().toISOString()
    matchHistory.value.push(matchResult)

    // 存入 LocalStorage
    localStorage.setItem('pet_match_date', lastMatchDate.value)
    localStorage.setItem('pet_match_current', JSON.stringify(matchResult))
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('pet_match_date')
    if (stored) {
      lastMatchDate.value = stored
      const today = new Date().toDateString()
      const lastMatch = new Date(stored).toDateString()
      hasMatchedToday.value = today === lastMatch
    }

    // 載入當前配對結果
    const currentStored = localStorage.getItem('pet_match_current')
    if (currentStored) {
      try {
        currentMatch.value = JSON.parse(currentStored)
      } catch (e) {
        console.error('Failed to parse stored match data:', e)
      }
    }
  }

  function resetDaily() {
    hasMatchedToday.value = false
    currentMatch.value = null
  }

  return {
    // State
    hasMatchedToday,
    lastMatchDate,
    currentMatch,
    matchHistory,

    // Getters
    canMatchToday,

    // Actions
    saveMatch,
    loadFromStorage,
    resetDaily
  }
})
