import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchingStore } from '@/stores/matching'
import { useAuthStore } from '@/stores/auth'
import { calculateRadarData, randomMatch } from '@/utils/radarAlgorithm'

/**
 * 配對功能 Composable
 * 封裝配對邏輯、狀態管理和路由導航
 */
export function useMatching() {
  // Router/Store 初始化
  const router = useRouter()
  const matchingStore = useMatchingStore()
  const authStore = useAuthStore()

  // State
  const isMatching = ref(false)
  const matchResult = ref(null)

  // Computed
  const canMatch = computed(() => matchingStore.canMatchToday)

  /**
   * 執行配對
   * @param {Array} allPets - 所有可配對的寵物清單
   * @returns {Promise<Object>} 配對結果
   */
  async function performMatch(allPets) {
    if (!matchingStore.canMatchToday) {
      throw new Error('今日已配對過')
    }

    isMatching.value = true

    try {
      // 模擬 API 延遲
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // TODO: 從 authStore 取得當前寵物資料
      // 目前使用 Mock Data 作為當前寵物
      const myPet = authStore.user?.currentPet || {
        id: 'my_pet_001',
        name: '我的寵物',
        species: 'DOG',
        avatarUrl: '🐕',
        location: 'Taipei',
        tags: ['#breed:柴犬', '#size:中型', '#gender:公', '親人', '愛散步']
      }

      const matched = randomMatch(myPet, allPets)

      if (!matched) {
        throw new Error('找不到配對對象')
      }

      const radarScores = calculateRadarData(myPet, matched)
      const avgScore = Math.round(radarScores.reduce((a, b) => a + b) / 5)

      matchResult.value = {
        pet: matched,
        radarScores,
        avgScore,
        timestamp: new Date().toISOString()
      }

      matchingStore.saveMatch(matchResult.value)

      return matchResult.value
    } finally {
      isMatching.value = false
    }
  }

  /**
   * 跳轉至聊天室
   * @param {string} petId - 配對對象的寵物 ID
   */
  function goToChat(petId) {
    router.push({ name: 'chat-test', params: { id: petId } })
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
