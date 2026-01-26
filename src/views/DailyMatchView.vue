<template>
  <div class="daily-match-container">
    <!-- Background Grid -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-10">
      <BackgroundGrid class="h-full w-full" />
    </div>

    <div class="daily-match-view">
      <!-- 主要內容區 -->
      <main class="match-content">
        <!-- 階段 0: 今日已配對 - 倒計時頁面 -->
        <div v-if="!canMatch && stage === 'cooldown'" class="cooldown-stage">
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

        <!-- 階段 1: 卡包選擇（始終顯示，除非在展示或結果階段）-->
        <div v-if="stage === 'selection'" class="selection-stage">
          <CardPackSelector @select="handleCardSelect" />
        </div>

        <!-- 階段 2: 展示卡片（3D Tilt + 蒙版）-->
        <Teleport to="body">
          <div v-if="stage === 'display'" class="card-display-modal" @click="handleModalClick">
            <div class="card-display-content" @click.stop>
              <div
                ref="displayCard"
                class="displayed-card"
                :class="{ tilting: isTilting }"
                @mousemove="handleTilt"
                @mouseleave="resetTilt"
              >
                <div class="card-emoji">{{ matchResult?.pet.avatarUrl || '🐕' }}</div>
              </div>
            </div>
            <p class="close-hint">點擊任意處繼續</p>
          </div>
        </Teleport>

        <!-- 階段 3: 配對結果 -->
        <div v-if="stage === 'result' && matchResult" class="result-stage">
          <MatchResultCard :match-data="matchResult" @go-to-chat="handleGoToChat" />
        </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchingStore } from '@/stores/matching'
import { useAuthStore } from '@/stores/auth'
import { useMatching } from '@/composables/useMatching'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import CardPackSelector from '@/components/Matching/CardPackSelector.vue'
import MatchResultCard from '@/components/Matching/MatchResultCard.vue'
import { useToast } from '@/composables/useToast'

// Store 初始化
const router = useRouter()
const matchingStore = useMatchingStore()
const { matchResult, canMatch, performMatch, goToChat } = useMatching()
const authStore = useAuthStore()
// Ensure auth data is ready (especially hasPet)
// Note: authStore.initAuth() is called in App.vue, but we might want to ensure it's loaded.
// However, checking isPetOwner in onMounted should be fine if auth state is persisted.
const toast = useToast()

// State
const stage = ref('selection')
const displayCard = ref(null)
const isTilting = ref(false)
const timeUntilReset = ref('')
const showNonOwnerModal = ref(false) // 非飼主提示彈窗

// 3D Tilt 常數
const MAX_TILT = 15

// Computed - 計算倒計時
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

// Methods
function goHome() {
  router.push({ name: 'home' })
}

function goToRegister() {
  router.push({ name: 'login', query: { mode: 'pet-onboarding' } })
}

async function handleCardSelect() {
  // 檢查是否可以配對（今日已配對過）
  if (!canMatch.value) {
    stage.value = 'cooldown'
    calculateTimeUntilReset()
    return
  }

  // 🚀 優化：立即顯示展示卡片，在背景執行配對
  stage.value = 'display'

  try {
    // 執行配對（呼叫後端 API）
    const result = await performMatch()
    // result 已經是包含 roomId 的完整物件
    matchResult.value = result // performMatch 內部也會更新 matchResult，這裡再次確保
    // eslint-disable-next-line no-console
    console.log('✨ Match result:', result)
  } catch (err) {
    // 處理配對錯誤
    // eslint-disable-next-line no-console
    console.error('❌ Match error:', err)
    stage.value = 'selection'

    // [Optimization] 處理特定錯誤
    // 1. 無寵物資料 -> 導向 Onboarding
    if (err.response?.data?.code === 'NO_PET_DATA') {
      toast.error('您尚未建立寵物資料，請先完成設定！')
      router.push({ name: 'Profile' }) // 假設 Profile 頁面包含 Onboarding
      return
    }

    // 2. 每日限制 -> 顯示倒數
    if (err.response?.data?.code === 'MATCH_LIMIT_REACHED') {
      toast.info('今日配對次數已達上限！')
      stage.value = 'cooldown'
      calculateTimeUntilReset()
      return
    }

    // 3. 網絡錯誤
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network')) {
      toast.error('網路連線不穩，請檢查連線後重試 📶')
      return
    }

    toast.error(err.response?.data?.error || err.message || '配對過程發生錯誤，請重試')
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

function handleModalClick() {
  // 點擊蒙版外的地方，進入配對結果階段
  stage.value = 'result'
}

// 3D Tilt 效果
function handleTilt(e) {
  if (!displayCard.value) return

  const rect = displayCard.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const mouseX = e.clientX
  const mouseY = e.clientY

  // 計算滑鼠相對於卡片中心的位置
  let ratioX = (mouseX - centerX) / (window.innerWidth / 2)
  let ratioY = (centerY - mouseY) / (window.innerHeight / 2)

  // 限制比例範圍
  ratioX = Math.max(-1, Math.min(1, ratioX))
  ratioY = Math.max(-1, Math.min(1, ratioY))

  // 計算傾斜角度
  const rotateY = ratioX * MAX_TILT
  const rotateX = ratioY * MAX_TILT

  isTilting.value = true
  displayCard.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`

  // 動態陰影
  const shadowX = -rotateY * 2
  const shadowY = rotateX * 2
  displayCard.value.style.boxShadow = `
    ${shadowX}px ${shadowY + 30}px 60px rgba(0, 0, 0, 0.4),
    0 0 100px rgba(46, 98, 86, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2)
  `
}

function resetTilt() {
  if (!displayCard.value) return

  isTilting.value = false
  displayCard.value.style.transform = ''
  displayCard.value.style.boxShadow = ''
}

function handleGoToChat() {
  if (!matchResult.value?.roomId) {
    console.error('No roomId in match result')
    return
  }
  goToChat(matchResult.value.roomId)
}

// Lifecycle
onMounted(() => {
  // 載入之前的配對記錄（用於檢查是否已配對）
  matchingStore.loadFromStorage()

  // 檢查是否為飼主（擁有寵物）
  if (!authStore.isPetOwner) {
    // 顯示提示並開啟彈窗，不再自動跳轉
    toast.info('配對功能僅限飼主使用')
    showNonOwnerModal.value = true
    return
  }

  // 如果今日已配對，顯示 cooldown 頁面
  if (!canMatch.value) {
    stage.value = 'cooldown'
    calculateTimeUntilReset()

    // 每分鐘更新倒計時
    setInterval(() => {
      calculateTimeUntilReset()
    }, 60000)
  }
})
</script>

<style scoped>
.daily-match-container {
  position: relative;
  min-height: 100vh;
  background: var(--color-bg-base);
}

.daily-match-view {
  min-height: 100%;
  color: var(--color-fg-primary);
  position: relative;
  overflow-x: hidden;
  padding: 2rem 1rem;
  padding-top: calc(var(--header-h) + 2rem); /* Header 高度 + spacing */
}

.match-content {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 140px); /* 調整高度計算，扣除 Header 和 padding */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直置中 */
  align-items: center; /* 水平置中 */
}

/* ========== 倒計時頁面樣式 ========== */
.cooldown-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  animation: fadeIn 0.5s ease;
}

.countdown-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-card);
  border: 2px solid var(--color-border-default);
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-card);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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
  font-weight: 500;
}

.timer-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-brand-primary);
  text-shadow: 0 2px 8px rgba(46, 98, 86, 0.2);
}

.btn-view-last {
  padding: 0.875rem 2rem;
  background: var(--color-btn-primary);
  border: none;
  border-radius: var(--radius-btn);
  color: var(--color-fg-primary);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 98, 86, 0.2);
}

.btn-view-last:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 98, 86, 0.3);
  background: var(--color-brand-primary);
}

.btn-view-last:active {
  transform: translateY(0);
}

/* ========== 展示卡片 Modal 樣式 ========== */
.card-display-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.card-display-content {
  perspective: 1500px;
  animation: zoomIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.3) translateY(100px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.displayed-card {
  width: 240px;
  height: 360px;
  /* TODO: 改用 CSS 變數（等顏色變數匯入後再做修改） */
  background: linear-gradient(145deg, #2e6256, #1e4a3f);
  border-radius: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 6px solid rgba(237, 201, 32, 0.6);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 120px rgba(237, 201, 32, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
  transform-style: preserve-3d;
  transition: box-shadow 0.3s ease;
  position: relative;
  cursor: pointer;
}

/* 取消 float 動畫，改為靜止狀態 */
.displayed-card:not(.tilting) {
  animation: gentleFloat 4s ease-in-out infinite;
}

@keyframes gentleFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* tilting 時停止 float 動畫 */
.displayed-card.tilting {
  animation: none !important;
}

.displayed-card::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.2rem;
  pointer-events: none;
}

/* 光澤效果層 */
.displayed-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 1.5rem;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(255, 255, 255, 0.1) 42%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.1) 58%,
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.displayed-card.tilting::after {
  opacity: 1;
}

.card-emoji {
  font-size: 7rem;
  filter: drop-shadow(0 0 40px rgba(237, 201, 32, 0.6));
  pointer-events: none;
  user-select: none;
}

.close-hint {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  backdrop-filter: blur(5px);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

/* 響應式：手機版調整 */
@media (max-width: 768px) {
  .daily-match-view {
    padding: 1rem 0.5rem;
  }

  .match-content {
    min-height: calc(100vh - 150px);
  }

  .displayed-card {
    width: 200px;
    height: 300px;
    border-width: 5px;
  }

  .card-emoji {
    font-size: 5.5rem;
  }

  .close-hint {
    bottom: 80px;
    font-size: 0.9rem;
    padding: 0.6rem 1.2rem;
  }
}

@media (max-width: 480px) {
  .displayed-card {
    width: 170px;
    height: 255px;
    border-width: 4px;
  }

  .card-emoji {
    font-size: 4.5rem;
  }

  .close-hint {
    bottom: 60px;
    font-size: 0.85rem;
  }
}

/* 觸控設備：禁用 3D Tilt，保留 float 動畫 */
@media (hover: none) or (pointer: coarse) {
  .displayed-card.tilting {
    animation: gentleFloat 4s ease-in-out infinite !important;
  }

  .displayed-card::after {
    display: none;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.modal-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-card);
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: var(--shadow-dialog);
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-fg-primary);
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
  font-size: 1rem;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;
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

.modal-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
