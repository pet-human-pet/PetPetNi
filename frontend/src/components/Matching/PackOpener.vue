```
<template>
  <div class="stage" @mousemove="handleTilt" @mouseleave="resetTilt">
    <!-- 待開啟的卡包 -->
    <div
      ref="boosterPackRef"
      class="booster-pack"
      :class="{ flipping: isFlipping, hidden: isPackHidden }"
      @click="openPack"
    >
      <div class="pack-wrapper">
        <div class="pack-back" :class="`style-${getPackStyleIndex}`" :style="packBackStyle">
          <div class="pack-pattern"></div>
        </div>
        <!-- 移除 pack-top 以符合 Carousel 的卡片外觀 -->
      </div>
    </div>
    <!-- 揭示的卡片容器 -->
    <div class="cards-container" :class="{ show: showCards, 'has-focus': isFocused }">
      <div
        class="card stacked profile-card-style"
        :class="{ spread: isSpread, revealed: isRevealed }"
        :style="cardTiltStyle"
        @click.stop="handleCardClick"
      >
        <div class="card-inner">
          <!-- 卡片背面 (塔羅牌圖案) -->
          <div class="card-back" :style="packBackStyle">
            <div class="card-back-pattern"></div>
          </div>

          <!-- 卡片正面：個人資料樣式符合 MatchResultCard -->
          <div class="card-front profile-content">
            <div class="pet-info-wrapper">
              <!-- 頭貼 -->
              <div class="pet-avatar-large">
                <img
                  v-if="isImageUrl(petData.avatar || petData.avatarUrl)"
                  :src="petData.avatar || petData.avatarUrl"
                  :alt="petData.name"
                  class="avatar-image"
                />
                <span v-else>{{ petData.avatar || petData.avatarUrl || '🐕' }}</span>
              </div>

              <!-- 名字 -->
              <h2 class="pet-name">
                {{ petData.name || '未命名' }}
              </h2>

              <!-- 物種標籤 -->
              <div class="species-badge">
                {{
                  petData.species === 'DOG' || petData.type === 'dog'
                    ? '🐕 狗狗'
                    : petData.species === 'CAT' || petData.type === 'cat'
                      ? '🐱 貓貓'
                      : '🐾 寵物'
                }}
              </div>

              <!-- 標籤 -->
              <div class="tags-container mt-4">
                <div class="tags-group">
                  <span
                    v-for="tag in getMandatoryTags(petData.tags)"
                    :key="tag"
                    class="tag-pill mandatory"
                  >
                    {{ formatTag(tag) }}
                  </span>
                </div>
              </div>

              <div class="tags-container mt-2">
                <div class="tags-group">
                  <span
                    v-for="tag in getOptionalTags(petData.tags)"
                    :key="tag"
                    class="tag-pill optional"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 自我介紹 -->
              <p class="pet-bio">
                {{ petData.bio || '這是一隻可愛的毛孩' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示與控制 -->
    <!-- 初始提示 -->
    <div v-if="!isFlipping && !isPackHidden" class="hint">👆 點擊卡包開啟</div>

    <!-- 聚焦提示 (揭示後) - 由 DailyMatchView 處理 -->
    <!-- <div v-if="isFocused" class="hint focus-hint" @click="emitClose">點擊任意處繼續</div> -->

    <!-- 移除舊的控制/提示以清理 UI -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  petData: {
    type: Object,
    required: true
  },
  packType: {
    type: Object,
    default: () => ({ id: 1, emoji: '⚡', name: 'Standard' })
  }
})

const emit = defineEmits(['opened', 'close'])

// 參考引用
const boosterPackRef = ref(null)

// 狀態：開啟卡包
const isFlipping = ref(false)
const isPackHidden = ref(false)
// const packEmoji = computed(() => props.packType.icon || props.packType.emoji || '⚡') // 移除未使用
const getPackStyleIndex = computed(() => {
  // 將卡包 ID 映射到樣式索引 (0-4)
  if (!props.packType.id) return 0
  return (props.packType.id - 1) % 5
})

const packBackStyle = computed(() => {
  const bgImage = props.packType.bgImage
  if (bgImage) {
    return {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {}
})

// 狀態：卡片揭示
const showCards = ref(false)
const isSpread = ref(false)
const isRevealed = ref(false)
const isFocused = ref(false) // 揭示後的聚焦狀態

// 傾斜狀態
const tiltX = ref(0)
const tiltY = ref(0)
const cardTiltStyle = computed(() => {
  if (!isRevealed.value) return {}
  return {
    transform: `translate(-50%, -50%) rotateY(${180 + tiltX.value}deg) rotateX(${tiltY.value}deg) scale(1.5)`,
    // 移除過渡以使滑鼠移動反應靈敏。
    // 這邊只在重置時增加過渡？或使用彈簧庫。
    // 對於原始 CSS，無過渡較快，但 transition: transform 0.1s 較平滑。
    transition: 'transform 0.1s ease-out'
  }
})

function handleTilt(e) {
  if (!isRevealed.value) return

  // 計算相對於視窗中心或舞台中心
  // 假設舞台置中
  const width = window.innerWidth
  const height = window.innerHeight

  const x = e.clientX
  const y = e.clientY

  const centerX = width / 2
  const centerY = height / 2

  const rotateXMax = 20
  const rotateYMax = 20

  // 反轉 Y 軸
  tiltY.value = -1 * ((y - centerY) / centerY) * rotateXMax
  tiltX.value = ((x - centerX) / centerX) * rotateYMax
}

function resetTilt() {
  tiltX.value = 0
  tiltY.value = 0
}

function isImageUrl(url) {
  return url && (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:'))
}

// 個人資料卡片輔助函數
function formatTag(tag) {
  if (tag.startsWith('#')) {
    const parts = tag.split(':')
    return parts.length > 1 ? parts[1] : tag.substring(1)
  }
  return tag
}

function getMandatoryTags(tags) {
  if (!tags) return []
  return [...new Set(tags.filter((tag) => tag.startsWith('#')))].slice(0, 3)
}

function getOptionalTags(tags) {
  if (!tags) return []
  return [...new Set(tags.filter((tag) => !tag.startsWith('#')))].slice(0, 6)
}

function openPack() {
  if (isFlipping.value || isPackHidden.value) return
  isFlipping.value = true

  // 動畫序列
  setTimeout(() => {
    isPackHidden.value = true
    showCards.value = true

    // 展開卡片
    setTimeout(() => {
      isSpread.value = true

      // 展開後自動揭示
      setTimeout(() => {
        revealCard()
      }, 500)
    }, 100)
  }, 600)
}

function handleCardClick() {
  if (!isRevealed.value) {
    revealCard()
  } else {
    // isFocused.value = !isFocused.value // 不再需要
  }
}

function revealCard() {
  if (isRevealed.value) return
  isSpread.value = false
  isRevealed.value = true

  emit('opened')

  // 0.5秒後觸發聚焦模式
  setTimeout(() => {
    isFocused.value = true
  }, 500)
}
</script>

<style scoped>
/* 複製自 Carousel 的樣式以保持一致性 */
.stage {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 600px;
  margin: 0 auto;
  perspective: 1500px;
  overflow: visible;
}

/* 發光動畫 */
@property --rotate {
  syntax: '<angle>';
  initial-value: 132deg;
  inherits: false;
}

@keyframes spin {
  0% {
    --rotate: 0deg;
  }
  100% {
    --rotate: 360deg;
  }
}

/* 符合 Carousel 的卡包樣式 */
.booster-pack {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  width: 240px; /* 符合卡片尺寸 */
  height: 420px; /* 符合卡片尺寸 */
  transition:
    transform 0.3s,
    opacity 0.3s;
  z-index: 100;
  cursor: pointer;
  transform-style: preserve-3d;
}

.booster-pack:hover {
  transform: translate(-50%, -50%) scale(1.05);
}

.booster-pack.flipping {
  animation: flipOpen 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flipOpen {
  0% {
    transform: translate(-50%, -50%) rotateY(0);
  }
  50% {
    transform: translate(-50%, -50%) rotateY(90deg) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotateY(180deg) scale(1);
    opacity: 0;
  }
}

.booster-pack.hidden {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.pack-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.pack-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 24px; /* 增加圓角 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: visible; /* 改為 visible 以顯示發光 */
  backface-visibility: hidden;
  /* 背景由 style-X class 設定 */
}

/* 發光效果 */
.pack-back::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(var(--rotate), #ffd700, #ff8c00 43%, #ff4500, #ffd700);
  z-index: -1;
  border-radius: 20px;
  animation: spin 2.5s linear infinite;
  filter: blur(30px);
  opacity: 0.8;
}

/* 重新加入圖案 */
.pack-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 24px; /* 確保圖案在視覺圓角內 */
  overflow: hidden; /* 圖案局部溢出隱藏 */
}

.pack-inner-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pet-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pet-placeholder {
  font-size: 4rem;
}

/* 卡片揭示 */
.cards-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.cards-container.show {
  opacity: 1;
  pointer-events: auto;
  z-index: 200; /* 確保容器在遮罩層 (150) 之上 */
}

.cards-container.has-focus {
  z-index: 10000; /* 高於揭示遮罩層 (9990) */
}

/* 個人資料卡片樣式 (從結果卡片縮小) */
.card {
  position: absolute;
  width: 240px; /* 從 280px 縮小 */
  height: 420px; /* 從 340px 增加到 ~0.57 比例 (240 / 0.57) */
  left: 50%;
  top: 50%; /* 從 40% 下移至 50% */
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
}

.card.stacked {
  transform: translate(-50%, -50%) scale(0.8);
}

.card.spread {
  transform: translate(-50%, -50%) rotateY(0deg) scale(1);
}

.card.revealed {
  /* 修正：當揭示時，我們想看到正面 (rotateY 180deg) 但簡單翻轉邏輯需要正確的面 */
  transform: translate(-50%, -50%) rotateY(180deg) scale(1);
}

.card.focused {
  transform: translate(-50%, -50%) rotateY(180deg) scale(1.1); /* 從 1.4 縮小 */
  z-index: 9995; /* 高於遮罩層 (9990) */
  position: fixed; /* 聚焦時固定於視窗中心 */
  top: 40%; /* 符合原始位置樣式但固定 */
  left: 50%;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  overflow: hidden;
}

.card-back {
  background: linear-gradient(145deg, #3b82f6, #1d4ed8);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s;
}

.card.revealed .card-back {
  opacity: 0;
  visibility: hidden;
  /* 確保發生 z-fighting 時不會阻擋點擊或視覺 */
}

.card-back-pattern {
  position: absolute;
  inset: 0;
}

.card-back-logo {
  font-size: 4rem;
  z-index: 2;
}

.profile-content {
  background: var(--color-bg-surface);
  color: var(--color-fg-primary);
  transform: rotateY(180deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border-radius: 24px;
  border: 4px solid var(--color-bg-surface);
}

.pet-info-wrapper {
  text-align: center;
  width: 100%;
}

.pet-avatar-large {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  font-size: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--color-bg-surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pet-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--color-fg-primary);
}

.species-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(46, 98, 86, 0.1);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--color-brand-primary);
  margin-bottom: 1rem;
}

.tags-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  /* 移除捲軸 */
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}

.tag-pill {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
}

.tag-pill.mandatory {
  background: rgba(46, 98, 86, 0.1);
  color: var(--color-brand-primary);
  border: 1px solid rgba(46, 98, 86, 0.2);
}

.tag-pill.optional {
  background: #f3f4f6;
  color: var(--color-fg-secondary);
  border: 1px solid #e5e7eb;
}

.pet-bio {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--color-fg-muted);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 全息圖效果 */
.holo-effect {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.card.revealed .holo-effect,
.card.focused .holo-effect {
  opacity: 1;
}

.holo-effect.rare-holo {
  background: linear-gradient(
    125deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 100%
  );
  background-size: 200% 200%;
  animation: holoShine 2s ease-in-out infinite;
}

.holo-effect.ultra-holo {
  background: linear-gradient(
    125deg,
    transparent 0%,
    rgba(255, 100, 100, 0.3) 15%,
    rgba(255, 255, 100, 0.3) 30%,
    rgba(100, 255, 100, 0.3) 45%,
    rgba(100, 100, 255, 0.3) 60%,
    rgba(255, 100, 255, 0.3) 75%,
    transparent 100%
  );
  background-size: 200% 200%;
  animation: holoShine 1.5s ease-in-out infinite;
}

@keyframes holoShine {
  0%,
  100% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
}

@keyframes burstEffect {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2);
  }
}

.burst-ring {
  position: absolute;
  inset: 0;
  border: 4px solid;
  border-radius: 50%;
  animation: ringExpand 1s ease-out forwards;
}

.burst-ring:nth-child(1) {
  border-color: #ffd700;
}
.burst-ring:nth-child(2) {
  border-color: #ff8c00;
  animation-delay: 0.1s;
}
.burst-ring:nth-child(3) {
  border-color: #ff0080;
  animation-delay: 0.2s;
}

@keyframes ringExpand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 閃光 (組件全域) */
/* 注意：因為我們使用 createElement/appendChild，可能需要全域樣式或使用 :deep 如果有範圍限制 */
:deep(.sparkle-burst) {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkle 1s ease-out forwards;
}

@keyframes sparkle {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--tx) * 2), calc(-50% + var(--ty) * 2)) scale(0);
  }
}

/* 控制項 */
.controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 100px; /* 調整至更接近新卡片中心 (40%) */
  display: flex;
  gap: 15px;
  z-index: 300;
  width: 100%;
  justify-content: center;
}

.btn {
  background: linear-gradient(145deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
}

.btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: linear-gradient(145deg, #6366f1, #4f46e5);
  box-shadow: 0 5px 20px rgba(99, 102, 241, 0.4);
}

.hint {
  position: absolute;
  bottom: 10px; /* 靠下對齊 CardCarousel */
  left: 50%;
  transform: translateX(-50%);
  /* 移除 margin-top，現在靠 bottom 定位 */
  width: auto; /* 允許自動寬度以適應膠囊形狀 */
  white-space: nowrap;

  /* 來自 CardCarousel 的毛玻璃樣式 */
  color: var(--color-fg-primary); /* 深色文字 */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.9;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

/* RWD */
/* RWD */
@media (max-width: 768px) {
  .stage {
    height: 550px;
  }
  .booster-pack {
    width: 240px; /* Sync with card */
    height: 340px; /* Sync with card */
  }
  .card {
    /* Sync with desktop aspect ratio or fit screen */
    width: 240px;
    height: 340px;
  }
  .controls {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}

/* Reveal Overlay */
.reveal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85); /* Darker for better focus */
  backdrop-filter: blur(8px); /* Stronger blur */
  z-index: 9990; /* Very high Z-Index */
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.reveal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* Focus Hint */
.focus-hint {
  position: fixed; /* Fixed relative to body */
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999; /* Above overlay */
  bottom: 15%;
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  animation: pulse 2s infinite;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.focus-hint:hover {
  background: rgba(255, 255, 255, 0.25) !important;
}

@media (max-width: 480px) {
  .booster-pack {
    width: 220px; /* Sync with card */
    height: 320px; /* Sync with card */
  }
  .card {
    width: 220px;
    height: 320px;
  }
  .focus-hint {
    bottom: 10%;
  }
}
</style>
