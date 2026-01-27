import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseMatchService } from '@/services/SupabaseMatchService'
import { useAuthStore } from '@/stores/auth'

export const useMatchingStore = defineStore('matching', () => {
  // State
  const hasMatchedToday = ref(false)
  const lastMatchDate = ref(null) // 仍可用於快速判斷，但主要依賴 DB 狀態
  const currentMatch = ref(null)

  // Auth store for User ID access
  const authStore = useAuthStore()

  // Getters
  const canMatchToday = computed(() => {
    // 依賴後端/DB狀態，若已檢查為 true 則不能配對
    return !hasMatchedToday.value
  })

  // Actions

  /**
   * 檢查當日配對狀態
   */
  async function checkMatchStatus() {
    // 必須有 User ID (這意味著 Auth 必須先 Ready)
    if (!authStore.user?.id) {
      console.warn('用戶未登入，無法檢查配對狀態')
      return
    }

    try {
      const { hasMatched } = await supabaseMatchService.getMatchStatus(authStore.user.id)
      hasMatchedToday.value = hasMatched
      if (hasMatched) {
        // 更新本地參考時間 (非強制，僅供參考)
        lastMatchDate.value = new Date().toISOString()
      }
    } catch (e) {
      console.error('Failed to check match status:', e)
    }
  }

  /**
   * 執行配對並儲存結果
   */
  async function performMatch() {
    if (!authStore.user?.id) {
      throw new Error('用戶未登入')
    }

    try {
      const result = await supabaseMatchService.performDailyMatch(authStore.user.id)

      if (result.success && result.match) {
        currentMatch.value = result.match
        hasMatchedToday.value = true
        lastMatchDate.value = new Date().toISOString()
        return result.match
      } else {
        throw new Error(result.message || '配對失敗')
      }
    } catch (e) {
      console.error('Match failed:', e)
      throw e
    }
  }

  // 移除 loadFromStorage / saveMatch (localStorage)
  // 讓資料流維持單向：DB -> Service -> Store -> View

  function resetDaily() {
    hasMatchedToday.value = false
    currentMatch.value = null
  }

  function reset() {
    hasMatchedToday.value = false
    currentMatch.value = null
    lastMatchDate.value = null
  }

  return {
    // State
    hasMatchedToday,
    lastMatchDate,
    currentMatch,

    // Getters
    canMatchToday,

    // Actions
    checkMatchStatus,
    performMatch,
    resetDaily,
    reset
  }
})
