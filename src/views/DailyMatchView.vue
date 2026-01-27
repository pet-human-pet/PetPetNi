<template>
  <div class="daily-match-container">
    <!-- Background Grid -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-10">
      <BackgroundGrid class="h-full w-full" />
    </div>

    <div class="daily-match-view">
      <!-- 載入中狀態 -->
      <div v-if="isLoading" class="flex h-full w-full items-center justify-center">
        <div class="text-fg-secondary animate-pulse text-xl font-bold">🔮 命運讀取中...</div>
      </div>

      <!-- 主要內容區 -->
      <main v-else class="match-content">
        <!-- 階段 1: 卡包選擇（始終保留在背景，當其他階段時模糊化） -->
        <div
          v-if="stage !== 'result'"
          class="selection-layer transition-all duration-500"
          :class="{ 'scale-95 opacity-50 blur-sm': stage === 'opening' }"
        >
          <div v-if="stage === 'cooldown' && !canMatch" key="cooldown" class="cooldown-stage">
            <div class="countdown-card">
              <div class="mb-6 text-7xl">⏰</div>
              <h2 class="text-fg-primary mb-3 text-3xl font-bold">今日已配對</h2>
              <p class="text-fg-secondary mb-6 text-lg">明天再來尋找新緣分吧！</p>
              <div class="countdown-timer">
                <span class="timer-label">距離下次配對還有</span>
                <span class="timer-value">{{ timeUntilReset }}</span>
              </div>
              <button class="btn-view-last mt-6" @click="viewLastMatch">查看今日配對 👀</button>
            </div>
          </div>

          <div v-else class="selection-stage flex h-full w-full flex-col justify-center pb-20">
            <h2 class="text-fg-primary mb-4 text-center text-3xl font-bold">選擇您的命運卡牌</h2>
            <p class="text-fg-secondary mb-8 text-center">左右滑動轉盤，點擊選擇</p>
            <CardCarousel :packs="cardPacks" @select="handleCardSelect" />
          </div>
        </div>

        <!-- 階段 3: 配對結果 (不使用遮罩，獨立顯示) -->
        <div
          v-if="stage === 'result' && matchResult"
          class="result-stage animate-fadeIn flex w-full flex-col items-center"
        >
          <MatchResultCard :match-data="matchResult" @go-to-chat="handleGoToChat" />
        </div>

        <!-- 全域遮罩層 (Overlay Container) ONLY for Opening -->
        <Teleport to="body">
          <transition name="fade">
            <div
              v-if="stage === 'opening'"
              class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
              @click="handleOverlayClick"
            >
              <!-- 階段 2: 開包儀式 -->
              <div
                class="opening-stage-overlay flex h-full w-full flex-col items-center justify-center p-4"
              >
                <div class="relative flex min-h-[500px] w-full items-center justify-center">
                  <PackOpener
                    :pet-data="matchResult?.pet || loadingPetData"
                    :pack-type="selectedPack"
                    @opened="handlePackOpened"
                    @close="handleOpeningComplete"
                  />
                </div>
                <!-- 提示文字 (當卡片翻開後顯示) -->
                <transition name="fade">
                  <div
                    v-if="isPackOpened"
                    class="mt-8 animate-pulse text-lg font-bold text-white/90 drop-shadow-md"
                  >
                    ☝️ 點擊任意處繼續
                  </div>
                </transition>
              </div>
            </div>
          </transition>
        </Teleport>
      </main>

      <!-- 非飼主提示 Modal (強制性) -->
      <Teleport to="body">
        <div v-if="showNonOwnerModal" class="modal-overlay">
          <div class="modal-card">
            <div class="modal-icon">🏠</div>
            <h3 class="modal-title">配對功能僅限飼主使用</h3>
            <p class="modal-desc">
              您目前的身分是雲鏟屎官。<br />
              想要開始配對，請先為您的毛孩建立檔案！
            </p>
            <div class="modal-actions">
              <button class="modal-btn secondary" @click="goHome">回首頁</button>
              <button class="modal-btn primary" @click="goToRegister">前往註冊寵物資料</button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchingStore } from '@/stores/matching'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useMatching } from '@/composables/useMatching'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import CardCarousel from '@/components/Matching/CardCarousel.vue'
import PackOpener from '@/components/Matching/PackOpener.vue'
import MatchResultCard from '@/components/Matching/MatchResultCard.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const matchingStore = useMatchingStore()
const { matchResult, canMatch, performMatch, goToChat } = useMatching()
const authStore = useAuthStore()
const chatStore = useChatStore()
const toast = useToast()

const tarotModules = import.meta.glob('@/assets/images/tarot/*.png*/', {
  eager: true,
  import: 'default'
})
const tarotImages = Object.values(tarotModules)

const stage = ref('selection')
const isLoading = ref(true)
const timeUntilReset = ref('')
const showNonOwnerModal = ref(false)
const selectedPack = ref({ id: 1, bgImage: tarotImages[0] })
const isPackOpened = ref(false)
let timerInterval = null

function getRandomTarotImage() {
  return tarotImages[Math.floor(Math.random() * tarotImages.length)]
}

const cardPacks = ref([
  { id: 1, bgImage: getRandomTarotImage() },
  { id: 2, bgImage: getRandomTarotImage() },
  { id: 3, bgImage: getRandomTarotImage() },
  { id: 4, bgImage: getRandomTarotImage() },
  { id: 5, bgImage: getRandomTarotImage() }
])

const loadingPetData = {
  name: '召喚中...',
  avatarUrl: '❓',
  breed: '???',
  age: '?'
}

function calculateTimeUntilReset() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  timeUntilReset.value = `${hours} 小時 ${minutes} 分鐘`
}

function goHome() {
  router.push({ name: 'home' })
}

function goToRegister() {
  router.push({ name: 'login', query: { mode: 'pet-onboarding' } })
}

async function handleCardSelect(pack) {
  if (!canMatch.value) {
    stage.value = 'cooldown'
    calculateTimeUntilReset()
    return
  }

  selectedPack.value = pack
  stage.value = 'opening'
  isPackOpened.value = false

  try {
    const result = await performMatch()
    matchResult.value = result
  } catch (err) {
    if (err.code === 'NO_PET_DATA' || err.response?.data?.code === 'NO_PET_DATA') {
      toast.error('您尚未建立寵物資料，請先完成設定！')
      router.push({ name: 'Profile' })
      return
    }

    if (err.code === 'MATCH_LIMIT_REACHED' || err.response?.data?.code === 'MATCH_LIMIT_REACHED') {
      toast.info('今日配對次數已達上限！')
      stage.value = 'cooldown'
      calculateTimeUntilReset()
      return
    }

    toast.error(err.response?.data?.error || err.message || '配對過程發生錯誤，請重試')
    stage.value = 'selection'
  }
}

function handlePackOpened() {
  isPackOpened.value = true
}

function handleOpeningComplete() {
  if (matchResult.value) {
    stage.value = 'result'
  } else {
    toast.warning('資料讀取中，請稍候...')
  }
}

function handleOverlayClick() {
  if (stage.value === 'opening' && isPackOpened.value) {
    handleOpeningComplete()
  }
}

function viewLastMatch() {
  const lastMatch = matchingStore.currentMatch
  if (lastMatch) {
    matchResult.value = lastMatch
    stage.value = 'result'
  } else {
    toast.info('沒有配對記錄')
  }
}

async function handleGoToChat() {
  // 優先嘗試取得對方 ID
  const targetUserIdInt = matchResult.value?.owner?.id

  // 如果沒有對方 ID，但有 roomId (例外情況)，則直接跳轉
  if (!targetUserIdInt) {
    const roomId = matchResult.value?.roomId
    if (roomId) {
      goToChat(roomId)
      return
    }
    toast.error('找不到配對對象資訊，無法建立聊天室')
    return
  }

  // 透過 Store Action 啟動聊天 (確保聊天室被加入前端 Store 列表)
  // 即使後端已存在該房間，此動作也會確保前端 Store 同步狀態
  const result = await chatStore.startPrivateChat(targetUserIdInt)

  if (!result.success) {
    toast.error(result.error || '開始私訊失敗')
    return
  }

  // 更新 roomId 並跳轉
  if (result.room?.id) {
    if (matchResult.value) {
      matchResult.value.roomId = result.room.id
    }
    goToChat(result.room.id)
  }
}

onMounted(async () => {
  if (!authStore.isReady) {
    await new Promise((resolve) => {
      const stopWatch = watch(
        () => authStore.isReady,
        (ready) => {
          if (ready) {
            stopWatch()
            resolve()
          }
        },
        { immediate: true }
      )
    })
  }

  if (!authStore.isPetOwner) {
    isLoading.value = false
    toast.info('配對功能僅限飼主使用')
    showNonOwnerModal.value = true
    return
  }

  try {
    await matchingStore.checkMatchStatus()
  } catch (e) {
    // 忽略錯誤
  } finally {
    isLoading.value = false
  }

  if (!canMatch.value) {
    stage.value = 'cooldown'
    calculateTimeUntilReset()
    timerInterval = setInterval(() => {
      calculateTimeUntilReset()
    }, 60000)
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
})

watch(
  () => authStore.user?.id,
  async (newId) => {
    if (newId) {
      stage.value = 'selection'
      selectedPack.value = { id: 1, icon: '⚡', name: '閃電包' }
      matchResult.value = null

      try {
        await matchingStore.checkMatchStatus()
        if (!canMatch.value) {
          stage.value = 'cooldown'
          calculateTimeUntilReset()
        }
      } catch (e) {
        // 忽略錯誤
      }
    }
  }
)
</script>

<style scoped>
.daily-match-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-base);
  z-index: 0;
}

@media (max-width: 768px) {
  .daily-match-container {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.daily-match-view {
  min-height: 100%;
  color: var(--color-fg-primary);
  position: relative;
  padding: 2rem 1rem;
  padding-top: calc(var(--header-h) + 2rem);
  display: flex;
  flex-direction: column;
}

.match-content {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 140px);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 10vh; /* Shift content up visually on desktop */
}

@media (max-width: 768px) {
  .match-content {
    justify-content: center; /* Changed back to center for better mobile layout */
    padding-bottom: 2rem;
  }
}

/* 階段容器 */
.selection-layer {
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.selection-stage,
.cooldown-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease;
}

/* 倒計時樣式 */
.countdown-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-card);
  border: 2px solid var(--color-border-default);
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.countdown-timer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(46, 98, 86, 0.08), rgba(237, 201, 32, 0.08));
  border-radius: calc(var(--radius-card) - 4px);
  border: 1px solid rgba(46, 98, 86, 0.2);
}

.timer-label {
  font-size: 0.95rem;
  color: var(--color-fg-secondary);
}

.timer-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-brand-primary);
}

.btn-view-last {
  padding: 0.875rem 2rem;
  background: var(--color-btn-primary);
  border: none;
  border-radius: var(--radius-btn);
  color: var(--color-fg-primary);
  font-weight: 600;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-card);
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}
.modal-desc {
  color: var(--color-fg-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-btn);
  font-weight: bold;
  cursor: pointer;
  flex: 1;
}

.modal-btn.primary {
  background: var(--color-brand-primary);
  color: white;
}
.modal-btn.secondary {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-default);
  color: var(--color-fg-primary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
