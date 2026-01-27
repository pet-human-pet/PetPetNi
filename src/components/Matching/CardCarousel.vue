<template>
  <div ref="containerRef" class="carousel-container">
    <div ref="carouselRef" class="carousel">
      <div
        v-for="(pack, index) in internalPacks"
        :key="pack.id"
        class="carousel-pack"
        :class="{ [`style-${index % 5}`]: true, active: isActive(index) }"
        :style="getPackStyle(index)"
        @click="rotateToPack(index)"
      >
        <!-- 背面 (當卡包在旋轉木馬後方時顯示) -->
        <div class="carousel-pack-back" :style="getPackBackStyle(pack)">
          <div class="pack-pattern"></div>
        </div>

        <!-- 正面 -->
        <div class="carousel-pack-front">
          <div class="carousel-pack-inner" :style="getPackBackStyle(pack)">
            <span class="pack-emoji">{{ pack.icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制項 -->
    <!-- 箭頭：透過 CSS 在桌面版隱藏 (min-width: 769px) -->
    <button class="carousel-arrow left mobile-only" @click.stop="rotate(-1)">◀</button>
    <button class="carousel-arrow right mobile-only" @click.stop="rotate(1)">▶</button>

    <div class="carousel-hint">點擊中間卡牌抽牌</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  packs: {
    type: Array,
    default: () => [
      { id: 1, icon: '⚡', name: '閃電包' },
      { id: 2, icon: '🔥', name: '火焰包' },
      { id: 3, icon: '💧', name: '海洋包' },
      { id: 4, icon: '🌿', name: '森林包' },
      { id: 5, icon: '🔮', name: '神秘包' }
    ]
  }
})

const emit = defineEmits(['select'])

// 參考 (Refs)
const containerRef = ref(null)
const carouselRef = ref(null)

// 狀態 (State)
const internalPacks = computed(() => props.packs)
const currentPackIndex = ref(0)
const currentRotation = ref(0)
const packCount = computed(() => internalPacks.value.length)
const anglePerPack = computed(() => 360 / packCount.value)

// 拖曳狀態 (Dragging State)
let isDragging = false
let startX = 0
let startRotation = 0
let trackingPoints = []
let momentumId = null
let radius = 350 // 預設半徑

// 方法 (Methods)
function updateRadius() {
  if (window.innerWidth <= 480) {
    radius = 160
  } else if (window.innerWidth <= 768) {
    radius = 220
  } else {
    radius = 360
  }
}

// 計算給定卡包索引相對於正面 (0度) 的標準化角度
function getAngleFromFront(index) {
  // 卡包在圓圈中的基礎位置 (0, 72, 144, 等)
  const baseAngle = index * anglePerPack.value

  // 套用當前的全域旋轉
  // currentRotation 移動整個系統
  // 有效角度 = baseAngle + currentRotation
  let effectiveAngle = baseAngle + currentRotation.value

  // 標準化到 -180 到 180 以尋找通往 0 的最短路徑
  let normalized = effectiveAngle % 360
  if (normalized > 180) normalized -= 360
  if (normalized < -180) normalized += 360

  return normalized
}

function isActive(index) {
  // 如果最接近正面則為 Active
  const angle = getAngleFromFront(index)
  return Math.abs(angle) < anglePerPack.value / 2
}

function getPackStyle(index) {
  const angleFromFront = getAngleFromFront(index)

  // 計算修正值以確保正面卡包完全平坦
  // 壓平係數：
  // 0.0 = 標準環形 (側面垂直朝外)
  // 1.0 = 看板模式 (側面平坦朝向鏡頭)
  // 0.45 = 混合模式
  const flatteningFactor = 0.45

  // 主要對正面卡片應用修正，背面卡片淡出修正
  const distance = Math.abs(angleFromFront)
  // 從 90 度到 180 度線性遞減
  let backFactor = 1
  if (distance > 90) {
    backFactor = Math.max(0, (180 - distance) / 90)
  }

  const correction = angleFromFront * -flatteningFactor * backFactor

  // 判斷是否為背面
  const isBack = Math.abs(angleFromFront) > 100 // 大致後半部

  return {
    transform: `rotateY(${angleFromFront}deg) translateZ(${radius}px) rotateY(${correction}deg)`,
    pointerEvents: isActive(index) ? 'auto' : 'none',
    zIndex: Math.round(1000 - Math.abs(angleFromFront)),
    opacity: isBack ? 0.3 : 1,
    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s',
    filter: isActive(index) ? 'brightness(1.1)' : 'brightness(0.9)'
  }
}

function getPackBackStyle(pack) {
  if (pack.bgImage) {
    return {
      backgroundImage: `url(${pack.bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return {}
}

// 互動方法 (Interaction Methods)
function rotate(direction) {
  stopMomentum()

  const newIndex = getNextIndex(direction)
  rotateToIndex(newIndex)
}

function getNextIndex(direction) {
  let index = currentPackIndex.value - direction // 方向 +1 表示「下一個」，即「向左旋轉」(-角度)
  if (index < 0) index = packCount.value - 1
  if (index >= packCount.value) index = 0
  return index
}

function rotateToPack(index) {
  if (isActive(index)) {
    confirmSelection()
    return
  }

  // 旋轉到特定卡包
  rotateToIndex(index)
}

function rotateToIndex(targetIndex) {
  stopMomentum()

  currentPackIndex.value = targetIndex

  // 計算目標旋轉角度
  const targetBase = targetIndex * anglePerPack.value
  let targetRotation = -targetBase

  // 尋找最短路徑
  const current = currentRotation.value

  while (targetRotation - current > 180) targetRotation -= 360
  while (targetRotation - current < -180) targetRotation += 360

  animateTo(targetRotation)
}

function confirmSelection() {
  emit('select', internalPacks.value[currentPackIndex.value])
}

// 動畫與拖曳 (Animation & Drag)
function animateTo(target) {
  const start = currentRotation.value
  const diff = target - start
  if (Math.abs(diff) < 0.1) {
    currentRotation.value = target
    return
  }

  const startTime = performance.now()
  const duration = 600

  const frame = (now) => {
    const elapsed = now - startTime
    if (elapsed >= duration) {
      currentRotation.value = target
      momentumId = null
      return
    }

    // Ease Out Quint
    const t = elapsed / duration
    const ease = 1 - Math.pow(1 - t, 5)

    currentRotation.value = start + diff * ease
    momentumId = requestAnimationFrame(frame)
  }

  momentumId = requestAnimationFrame(frame)
}

function stopMomentum() {
  if (momentumId) {
    cancelAnimationFrame(momentumId)
    momentumId = null
  }
}

// 網格對齊邏輯 (Snap to Grid)
function snapToGrid() {
  const angle = anglePerPack.value
  const current = currentRotation.value

  // 最近的角度倍數
  const offset = Math.round(current / angle)
  const target = offset * angle

  // 更新索引
  let idx = Math.round(-target / angle)
  idx = ((idx % packCount.value) + packCount.value) % packCount.value

  currentPackIndex.value = idx
  animateTo(target)
}

// 拖曳邏輯
function initDrag() {
  const el = containerRef.value
  if (!el) return

  const onStart = (e) => {
    // 允許點擊按鈕，但如果在按鈕上則不開始拖曳
    if (e.target.closest('button')) return

    stopMomentum()
    isDragging = true
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    startRotation = currentRotation.value
    trackingPoints = []
  }

  const onMove = (e) => {
    if (!isDragging) return
    e.preventDefault() // 防止捲動

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const now = Date.now()
    trackingPoints.push({ x: clientX, time: now })
    if (trackingPoints.length > 5) trackingPoints.shift()

    const diff = clientX - startX
    // 靈敏度
    const sensitivity = 0.5
    currentRotation.value = startRotation + diff * sensitivity
  }

  const onEnd = () => {
    if (!isDragging) return
    isDragging = false

    // 計算速度
    let velocity = 0
    if (trackingPoints.length > 1) {
      const first = trackingPoints[0]
      const last = trackingPoints[trackingPoints.length - 1]
      const dt = last.time - first.time
      const dx = last.x - first.x
      if (dt > 0) velocity = dx / dt
    }

    if (Math.abs(velocity) > 0.3) {
      // 慣性投擲
      const targetDist = velocity * 400 // 滑動距離
      const targetRaw = currentRotation.value + targetDist

      // 對齊網格
      const angle = anglePerPack.value
      const offset = Math.round(targetRaw / angle)
      const finalTarget = offset * angle

      // 更新索引
      let idx = Math.round(-finalTarget / angle)
      idx = ((idx % packCount.value) + packCount.value) % packCount.value
      currentPackIndex.value = idx

      animateTo(finalTarget)
    } else {
      snapToGrid()
    }
  }

  el.addEventListener('mousedown', onStart)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)

  el.addEventListener('touchstart', onStart, { passive: false })
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onEnd)

  return () => {
    el.removeEventListener('mousedown', onStart)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onEnd)
    el.removeEventListener('touchstart', onStart)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
  }
}

let cleanupDragFn = null

onMounted(() => {
  nextTick(() => {
    updateRadius()
    cleanupDragFn = initDrag()
  })
  window.addEventListener('resize', updateRadius)
})

onUnmounted(() => {
  if (cleanupDragFn) cleanupDragFn()
  window.removeEventListener('resize', updateRadius)
})
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 500px;
  margin: 0 auto;
  perspective: 1000px; /* 標準 3D 透視 */
  overflow: visible;
  touch-action: none; /* 防止移動端拖曳時捲動 */
}

.carousel {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.carousel-pack {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 160px;
  height: 280px;
  margin-left: -80px;
  margin-top: -140px;
  transform-style: preserve-3d;
  will-change: transform;
  cursor: pointer;
}

/* 正面 (Front Face) */
.carousel-pack-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
}

/* 背面 (Back Face) */
.carousel-pack-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(145deg, #1e3a8a, #3b82f6);
  transform: rotateY(180deg);
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.carousel-pack-back .pack-pattern {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
}

/* 內部設計 (Inner Design) */
.carousel-pack-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #333; /* Fallback */
}

/* 卡包顏色樣式 (Pack Colors) */
.style-0 .carousel-pack-inner {
  background: linear-gradient(135deg, #fbbf24, #d97706);
} /* 金 */
.style-1 .carousel-pack-inner {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
} /* 紅 */
.style-2 .carousel-pack-inner {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
} /* 藍 */
.style-3 .carousel-pack-inner {
  background: linear-gradient(135deg, #34d399, #059669);
} /* 綠 */
.style-4 .carousel-pack-inner {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
} /* 紫 */

/* 旋轉動畫變數 */
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

.carousel-pack.active .carousel-pack-inner {
  box-shadow: none;
}

/* 光暈流轉 (Glow Flow) */
.carousel-pack.active .carousel-pack-inner::after {
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

.pack-emoji {
  font-size: 4rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  z-index: 2;
}

.pack-label {
  color: var(--color-bg-base);
  font-weight: 800;
  font-size: 1.2rem;
  margin-top: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* 箭頭控制 (Arrow Controls) */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-bg-base);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.carousel-arrow.left {
  left: 10px;
}
.carousel-arrow.right {
  right: 10px;
}

/* 提示 (Hint) */
.carousel-hint {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-fg-primary); /* 使用 Token */
  font-size: 1rem;
  font-weight: 700;
  padding: 10px 20px;
  background: var(--color-bg-surface); /* 使用 Token */
  backdrop-filter: blur(8px);
  border-radius: 30px;
  pointer-events: none;
  border: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-card);
  animation: pulse 2s infinite;
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

/* 桌面版隱藏箭頭 */
@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}

/* 響應式 (Responsive) */
@media (max-width: 768px) {
  .carousel-container {
    height: 400px;
  }
  .carousel-pack {
    width: 130px;
    height: 228px;
    margin-left: -65px;
    margin-top: -114px;
    top: 45% !important;
  }
  .pack-emoji {
    font-size: 3rem;
  }
  .carousel-arrow {
    top: 45%;
  }
}

@media (max-width: 480px) {
  .carousel-container {
    height: 380px;
  }
  .carousel-pack {
    width: 110px;
    height: 195px;
    margin-left: -55px;
    margin-top: -97px;
    top: 40% !important;
  }
  .carousel-arrow {
    top: 40% !important;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
