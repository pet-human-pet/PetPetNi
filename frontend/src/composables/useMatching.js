import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchingStore } from '@/stores/matching'


/**
 * 配對功能 Composable
 * 封裝配對邏輯、狀態管理和路由導航
 */
export function useMatching() {
  // Router/Store 初始化
  const router = useRouter()
  const matchingStore = useMatchingStore()
  // const authStore = useAuthStore() // Unused

  // State
  const isMatching = ref(false)
  const matchResult = ref(null)

  // Computed
  const canMatch = computed(() => matchingStore.canMatchToday)

  /**
   * 執行配對
   * @returns {Promise<Object>} 配對結果
   */
  async function performMatch() {
    if (!matchingStore.canMatchToday) {
      throw new Error('今日已配對過')
    }

    isMatching.value = true

    try {
      // 改由 Store 統一處理 (Store 會呼叫 SupabaseMatchService)
      const result = await matchingStore.performMatch()

      // 更新本地 state
      matchResult.value = result
      return result
    } finally {
      isMatching.value = false
    }
  }

  /**
   * 跳轉至聊天室
   * @param {string} roomId - 聊天室 ID
   */
  function goToChat(roomId) {
    if (!roomId) {
      // eslint-disable-next-line no-console
      // console.error('No roomId provided for chat navigation')
      return
    }
    // 跳轉並帶入 roomId
    router.push({ name: 'chat', params: { roomId } })
  }

  return {
    // State
    isMatching,
    matchResult,

    // Computed
    canMatch,

    // Methods
    performMatch,
    goToChat
  }
}
