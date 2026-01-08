<template>
  <div class="card-selector">
    <h2 class="text-fg-primary mb-8 text-center text-2xl font-bold">選擇一個緣分卡包</h2>

    <div ref="deckContainer" class="deck-container" :class="{ expanded: isExpanded }">
      <div
        v-for="(pack, index) in cardPacks"
        :key="pack.id"
        class="deck-card"
        :style="{ '--i': index - 2 }"
        :class="{
          'not-active': selectedIndex !== null && selectedIndex !== index,
          clickable: isExpandComplete
        }"
        @click="handleCardClick(index)"
      >
        <div class="card-icon">{{ pack.icon }}</div>
      </div>

      <!-- 觸控設備展開按鈕 -->
      <button class="deck-toggle" @click.stop="toggleDeck">
        {{ isExpanded ? '👇 點擊收合' : '👆 點擊展開' }}
      </button>
    </div>

    <!-- 提示文字 -->
    <p class="hint-text text-fg-secondary mt-4 text-center text-sm">
      {{ hintText }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['select'])

// State
const cardPacks = ref([
  { id: 1, icon: '✨' },
  { id: 2, icon: '💫' },
  { id: 3, icon: '🌟' },
  { id: 4, icon: '⭐' },
  { id: 5, icon: '💝' }
])

const deckContainer = ref(null)
const isExpanded = ref(false)
const isExpandComplete = ref(false) // 新增：展開動畫是否完成
const selectedIndex = ref(null)
const isTouchDevice = ref(false)
let expandTimeout = null

// Computed
const hintText = computed(() => {
  if (isTouchDevice.value) {
    return isExpanded.value ? '選擇一張卡片' : '點擊按鈕展開卡片'
  }
  return isExpanded.value ? '選擇一張卡片' : '將滑鼠移到卡片上方'
})

// Methods
function detectTouchDevice() {
  isTouchDevice.value =
    window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches
}

function toggleDeck() {
  isExpanded.value = !isExpanded.value

  if (isExpanded.value) {
    // 展開：等待動畫完成（500ms）後才允許點擊
    isExpandComplete.value = false
    expandTimeout = setTimeout(() => {
      isExpandComplete.value = true
    }, 500) // 配合 CSS transition 時間
  } else {
    // 收合：立即禁止點擊
    isExpandComplete.value = false
    if (expandTimeout) {
      clearTimeout(expandTimeout)
    }
    selectedIndex.value = null

    // 洗牌
    setTimeout(() => {
      shuffleCards()
    }, 500)
  }
}

function shuffleCards() {
  // Fisher-Yates Shuffle
  const shuffled = [...cardPacks.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  cardPacks.value = shuffled
}

function handleCardClick(index) {
  // 必須等待展開動畫完成才能點擊
  if (!isExpandComplete.value) {
    return
  }

  // 觸控設備：如果還沒展開，先展開
  if (isTouchDevice.value && !isExpanded.value) {
    toggleDeck()
    return
  }

  // 設定選中的卡片
  selectedIndex.value = index

  // 發送選擇事件
  setTimeout(() => {
    emit('select', cardPacks.value[index])
    // 重置狀態
    selectedIndex.value = null
  }, 300)
}

function handleMouseEnter() {
  if (!isTouchDevice.value && !isExpanded.value) {
    isExpanded.value = true
    // 等待展開動畫完成
    isExpandComplete.value = false
    expandTimeout = setTimeout(() => {
      isExpandComplete.value = true
    }, 500)
  }
}

function handleMouseLeave() {
  if (!isTouchDevice.value) {
    isExpanded.value = false
    isExpandComplete.value = false
    if (expandTimeout) {
      clearTimeout(expandTimeout)
    }
    selectedIndex.value = null

    // 洗牌
    setTimeout(() => {
      shuffleCards()
    }, 500)
  }
}

function handleOutsideClick(e) {
  if (
    isTouchDevice.value &&
    isExpanded.value &&
    deckContainer.value &&
    !deckContainer.value.contains(e.target)
  ) {
    toggleDeck()
  }
}

// Lifecycle
onMounted(() => {
  detectTouchDevice()
  window.addEventListener('resize', detectTouchDevice)

  if (deckContainer.value) {
    deckContainer.value.addEventListener('mouseenter', handleMouseEnter)
    deckContainer.value.addEventListener('mouseleave', handleMouseLeave)
  }

  document.addEventListener('click', handleOutsideClick)

  // 初始洗牌
  shuffleCards()
})

onUnmounted(() => {
  window.removeEventListener('resize', detectTouchDevice)

  if (deckContainer.value) {
    deckContainer.value.removeEventListener('mouseenter', handleMouseEnter)
    deckContainer.value.removeEventListener('mouseleave', handleMouseLeave)
  }

  document.removeEventListener('click', handleOutsideClick)

  if (expandTimeout) {
    clearTimeout(expandTimeout)
  }
})
</script>

<style scoped>
.card-selector {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========== 卡片容器 ========== */
.deck-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

/* ========== 展開按鈕（僅觸控設備顯示）========== */
.deck-toggle {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(46, 98, 86, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(46, 98, 86, 0.3);
  color: var(--color-brand-primary);
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: none;
}

.deck-toggle:hover {
  background: rgba(46, 98, 86, 0.25);
}

.deck-toggle:active {
  transform: translateX(-50%) scale(0.95);
}

/* 觸控設備顯示按鈕 */
@media (hover: none) or (pointer: coarse) {
  .deck-toggle {
    display: block;
  }
}

/* ========== 卡片基礎樣式 ========== */
.deck-card {
  position: absolute;
  width: 140px;
  height: 210px;
  background: linear-gradient(145deg, #2e6256, #1e4a3f);
  border-radius: var(--radius-card);
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4px solid rgba(46, 98, 86, 0.3);
  user-select: none;
  transform-origin: 50% 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  pointer-events: auto;
}

/* 展開完成前禁止點擊 */
.deck-card:not(.clickable) {
  cursor: default;
}

/* 展開完成後允許點擊 */
.deck-card.clickable {
  cursor: pointer;
}

.deck-card::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: calc(var(--radius-card) - 4px);
  pointer-events: none;
}

.card-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 10px rgba(237, 201, 32, 0.3));
  transition: all 0.3s ease;
}

/* ========== 展開狀態 ========== */
.deck-container.expanded .deck-card {
  transform: translateX(calc(var(--i) * 155px)) translateY(-30px);
  border-color: var(--color-brand-accent);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 桌面版 hover 效果（僅在展開完成後生效）*/
@media (hover: hover) and (pointer: fine) {
  .deck-container.expanded .deck-card.clickable:hover {
    transform: translateX(calc(var(--i) * 155px)) translateY(-60px) scale(1.08);
    border-color: var(--color-btn-primary);
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(237, 201, 32, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .deck-container.expanded .deck-card.clickable:hover .card-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(237, 201, 32, 0.6));
  }
}

/* 未選中的卡片變暗 */
.deck-card.not-active {
  filter: brightness(0.5) saturate(0.5);
  opacity: 0.6;
}

/* ========== 提示文字 ========== */
.hint-text {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* 手機版提示文字：避免與固定按鈕重疊 */
@media (max-width: 480px) {
  .hint-text {
    position: fixed;
    bottom: 80px; /* 距離底部 80px，位於按鈕上方 */
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    z-index: 90;
    margin: 0;
    pointer-events: none; /* 允許點擊穿透 */
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* 增加文字陰影提升可讀性 */
  }
}

/* ========== 響應式設計 ========== */

/* 平板 (768px 以下) */
@media (max-width: 768px) {
  .deck-container {
    min-height: 350px;
  }

  .deck-card {
    width: 100px;
    height: 150px;
    border-width: 3px;
  }

  .deck-card::before {
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
  }

  .card-icon {
    font-size: 2.75rem;
  }

  .deck-container.expanded .deck-card {
    transform: translateX(calc(var(--i) * 110px)) translateY(-25px);
  }
}

/* 手機 (480px 以下) - 2-1-2 垂直佈局 */
@media (max-width: 480px) {
  .deck-container {
    min-height: calc(100vh - 200px); /* 使用視窗高度，確保置中 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 80px; /* 為固定按鈕留出空間 */
  }

  .deck-card {
    width: 70px;
    height: 105px;
    border-width: 2px;
  }

  .deck-card::before {
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
  }

  .card-icon {
    font-size: 2rem;
  }

  /* 收合狀態：所有卡片堆疊在中央 */
  .deck-container:not(.expanded) .deck-card {
    position: absolute;
    transform: translateX(0) translateY(0);
  }

  /* 展開狀態：2-1-2 排列 */
  .deck-container.expanded .deck-card {
    position: absolute;
  }

  /* 第一排：兩張 (index 0, 1) - 增加水平間距 */
  .deck-container.expanded .deck-card:nth-child(1) {
    transform: translateX(-70px) translateY(-145px);
  }

  .deck-container.expanded .deck-card:nth-child(2) {
    transform: translateX(70px) translateY(-145px);
  }

  /* 第二排：一張 (index 2) */
  .deck-container.expanded .deck-card:nth-child(3) {
    transform: translateX(0) translateY(-20px);
  }

  /* 第三排：兩張 (index 3, 4) - 增加水平間距 */
  .deck-container.expanded .deck-card:nth-child(4) {
    transform: translateX(-70px) translateY(115px);
  }

  .deck-container.expanded .deck-card:nth-child(5) {
    transform: translateX(70px) translateY(115px);
  }

  .deck-toggle {
    position: fixed; /* 改為固定定位 */
    bottom: 10px; /* 距離底部 10px */
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 24px;
    font-size: 0.9rem;
    z-index: 100; /* 確保在最上層 */
  }
}

/* 超小螢幕 (360px 以下) */
@media (max-width: 360px) {
  .deck-container {
    min-height: calc(100vh - 200px);
    padding-bottom: 80px;
  }

  .deck-card {
    width: 58px;
    height: 87px;
  }

  .deck-card::before {
    display: none;
  }

  .card-icon {
    font-size: 1.6rem;
  }

  /* 調整 2-1-2 佈局間距 - 超小螢幕也增加水平間距 */
  .deck-container.expanded .deck-card:nth-child(1) {
    transform: translateX(-55px) translateY(-120px);
  }

  .deck-container.expanded .deck-card:nth-child(2) {
    transform: translateX(55px) translateY(-120px);
  }

  .deck-container.expanded .deck-card:nth-child(3) {
    transform: translateX(0) translateY(-15px);
  }

  .deck-container.expanded .deck-card:nth-child(4) {
    transform: translateX(-55px) translateY(100px);
  }

  .deck-container.expanded .deck-card:nth-child(5) {
    transform: translateX(55px) translateY(100px);
  }

  .deck-toggle {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }
}
</style>
