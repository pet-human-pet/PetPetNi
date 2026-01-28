<template>
  <div class="result-card">
    <div class="grid gap-8 md:grid-cols-2">
      <!-- 左側：寵物資訊 -->
      <div ref="petCard" class="pet-info-section" :class="{ tilting: isTilting }">
        <div class="mb-6 text-center">
          <!-- 頭像：使用用戶頭像 -->
          <div class="pet-avatar-large">
            <img
              :src="displayAvatar"
              :alt="matchData.owner?.nickName || 'User'"
              class="avatar-image"
            />
          </div>

          <h2 class="text-fg-primary mb-2 text-3xl font-bold">
            {{ matchData.pet.name }}
          </h2>
          <div class="species-badge">
            {{ matchData.pet.species === 'DOG' ? '🐕 狗狗' : '🐱 貓貓' }}
          </div>

          <!-- 必選標籤 (顯示於主要區域) -->
          <div class="tags-container mt-4">
            <div class="tags-group">
              <span v-for="tag in mandatoryTags" :key="tag" class="tag-pill mandatory">
                {{ formatTag(tag) }}
              </span>
            </div>
          </div>

          <!-- 非必選標籤 (取代原本的簡介位置) -->
          <div v-if="optionalTags.length > 0" class="tags-container mt-6">
            <div class="tags-group">
              <span v-for="tag in optionalTags" :key="tag" class="tag-pill optional">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 無標籤提示 -->
          <p
            v-if="mandatoryTags.length === 0 && optionalTags.length === 0"
            class="text-fg-secondary mt-6 text-sm"
          >
            這位朋友比較神秘，尚未設定標籤 🤫
          </p>
        </div>

        <div class="pet-details">
          <div class="detail-row">
            <span class="detail-icon">📍</span>
            <span>位置：{{ matchData.pet.location }}</span>
          </div>
        </div>
      </div>

      <!-- 右側：雷達圖 -->
      <div ref="radarCard" class="radar-section" :class="{ tilting: isRadarTilting }">
        <h3 class="text-fg-primary mb-6 text-center text-2xl font-bold">緣分分析圖</h3>
        <RadarChart
          :data="matchData.radarScores"
          :labels="['地緣', '特質', '共鳴', '契合', '星運']"
          :animated="true"
        />

        <!-- 綜合指數 -->
        <div class="mt-6 text-center">
          <div class="avg-score">{{ matchData.avgScore }}%</div>
          <p class="text-fg-secondary text-sm">綜合配對指數</p>
        </div>
      </div>
    </div>

    <!-- 行動按鈕 -->
    <div class="action-buttons">
      <button class="btn-primary" @click="$emit('go-to-chat')">開始聊天 💬</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import RadarChart from './RadarChart.vue'
import defaultAvatar01 from '@/assets/images/avatar-cat.jpg'
import defaultAvatar02 from '@/assets/images/avatar-dog.jpg'

const props = defineProps({
  matchData: {
    type: Object,
    required: true
  }
})

const displayAvatar = computed(() => {
  if (isImageUrl(props.matchData.owner?.avatarUrl)) {
    return props.matchData.owner.avatarUrl
  }
  // 根據寵物種類選擇預設頭像
  const species = props.matchData.pet?.species
  if (species === 'DOG') return defaultAvatar02
  return defaultAvatar01 // 默認為貓 (或隨機)
})

defineEmits(['go-to-chat'])

// 輔助方法 (Helper Methods)
function isImageUrl(url) {
  return url && (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:'))
}

// 格式化標籤顯示 (去除 #key: 前綴)
function formatTag(tag) {
  if (tag.startsWith('#')) {
    // 支援半形與全形冒號
    const separator = tag.includes('：') ? '：' : ':'
    const parts = tag.split(separator)
    return parts.length > 1 ? parts[1] : tag.substring(1)
  }
  return tag
}

// 標籤計算屬性 (Computed for Tags)
const mandatoryTags = computed(() => {
  if (!props.matchData?.pet?.tags) return []
  const rawTags = props.matchData.pet.tags
  const standardMandatory = rawTags.filter(
    (tag) => tag.startsWith('#') && (tag.includes(':') || tag.includes('：'))
  )
  if (standardMandatory.length > 0) {
    return [...new Set(standardMandatory)].slice(0, 3)
  }
  return [...new Set(rawTags)].slice(0, 3)
})
const optionalTags = computed(() => {
  if (!props.matchData?.pet?.tags) return []

  const rawTags = props.matchData.pet.tags
  const standardMandatory = rawTags.filter(
    (tag) => tag.startsWith('#') && (tag.includes(':') || tag.includes('：'))
  )
  let tagsToDisplay = []
  if (standardMandatory.length > 0) {
    tagsToDisplay = rawTags.filter(
      (tag) => !tag.startsWith('#') || (!tag.includes(':') && !tag.includes('：'))
    )
  } else {
    tagsToDisplay = [...new Set(rawTags)].slice(3)
  }

  return [...new Set(tagsToDisplay)]
    .map((t) => (t.startsWith('#') ? t.substring(1) : t))
    .slice(0, 6)
})
// 3D 傾斜狀態 (3D Tilt State)
const petCard = ref(null)
const radarCard = ref(null)
const isTilting = ref(false)
const isRadarTilting = ref(false)
const MAX_TILT = 12

// 3D 傾斜方法 (寵物卡) (3D Tilt Methods - Pet Card)
function handleTilt(e) {
  if (!petCard.value) return

  const rect = petCard.value.getBoundingClientRect()
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
  petCard.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`

  // 動態陰影
  const shadowX = -rotateY * 1.5
  const shadowY = rotateX * 1.5
  petCard.value.style.boxShadow = `
    ${shadowX}px ${shadowY + 10}px 30px rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.1)
  `
}

function resetTilt() {
  if (!petCard.value) return

  isTilting.value = false
  petCard.value.style.transform = ''
  petCard.value.style.boxShadow = ''
}

// 3D 傾斜方法 (雷達圖) (3D Tilt Methods - Radar Card)
function handleRadarTilt(e) {
  if (!radarCard.value) return

  const rect = radarCard.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const mouseX = e.clientX
  const mouseY = e.clientY

  let ratioX = (mouseX - centerX) / (window.innerWidth / 2)
  let ratioY = (centerY - mouseY) / (window.innerHeight / 2)

  ratioX = Math.max(-1, Math.min(1, ratioX))
  ratioY = Math.max(-1, Math.min(1, ratioY))

  const rotateY = ratioX * MAX_TILT
  const rotateX = ratioY * MAX_TILT

  isRadarTilting.value = true
  radarCard.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`

  const shadowX = -rotateY * 1.5
  const shadowY = rotateX * 1.5
  radarCard.value.style.boxShadow = `
    ${shadowX}px ${shadowY + 10}px 30px rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.1)
  `
}

function resetRadarTilt() {
  if (!radarCard.value) return

  isRadarTilting.value = false
  radarCard.value.style.transform = ''
  radarCard.value.style.boxShadow = ''
}

// 生命週期 (Lifecycle)
onMounted(() => {
  if (petCard.value) {
    petCard.value.addEventListener('mousemove', handleTilt)
    petCard.value.addEventListener('mouseleave', resetTilt)
  }
  if (radarCard.value) {
    radarCard.value.addEventListener('mousemove', handleRadarTilt)
    radarCard.value.addEventListener('mouseleave', resetRadarTilt)
  }
})

onUnmounted(() => {
  if (petCard.value) {
    petCard.value.removeEventListener('mousemove', handleTilt)
    petCard.value.removeEventListener('mouseleave', resetTilt)
  }
  if (radarCard.value) {
    radarCard.value.removeEventListener('mousemove', handleRadarTilt)
    radarCard.value.removeEventListener('mouseleave', resetRadarTilt)
  }
})
</script>

<style scoped>
.result-card {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .result-card {
    padding: 0.5rem 2rem 0.5rem 2rem;
  }
}

.pet-info-section,
.radar-section {
  background: var(--color-bg-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-default);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  /* Ensure consistent height */
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

@media (max-width: 480px) {
  .pet-info-section,
  .radar-section {
    padding: 1rem;
    border-radius: 0.75rem;
  }
}

.pet-avatar-large {
  font-size: 6rem;
  width: 8rem;
  height: 8rem;
  margin: 0 auto 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 如果是文字/Emoji 則保持大字體，如果是圖片則被 img style 覆蓋 */
  filter: drop-shadow(0 0 20px rgba(46, 98, 86, 0.3));
}

@media (max-width: 480px) {
  .pet-avatar-large {
    font-size: 3.5rem;
    width: 6rem; /* 確保圖片模式下也有固定大小 */
    height: 6rem;
    margin-bottom: 0.5rem;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid var(--color-bg-surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tags-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  /* Removed scrollbar to maintain fixed layout */
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.tag-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-pill.mandatory {
  background: rgba(46, 98, 86, 0.1);
  color: var(--color-brand-primary);
  border: 1px solid rgba(46, 98, 86, 0.2);
}

.tag-pill.optional {
  background: var(--color-bg-base);
  color: var(--color-fg-secondary);
  border: 1px solid var(--color-border-default);
}

.species-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(46, 98, 86, 0.1);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--color-brand-primary);
}

.pet-details {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-fg-secondary);
  font-size: 0.875rem;
}

.detail-icon {
  font-size: 1.25rem;
}

.avg-score {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-brand-primary);
}

@media (max-width: 480px) {
  .avg-score {
    font-size: 2rem;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: var(--radius-btn);
  font-weight: bold;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-btn-primary);
  color: var(--color-fg-primary);
  box-shadow: var(--shadow-card);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-dialog);
}

/* ========== 3D Parallax Tilt 效果 ========== */
.pet-info-section,
.radar-section {
  transition:
    transform 0.1s ease-out,
    box-shadow 0.3s ease;
  transform-style: preserve-3d;
  position: relative;
}

.pet-info-section::after,
.radar-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-card);
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.05) 45%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 55%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.pet-info-section.tilting::after,
.radar-section.tilting::after {
  opacity: 1;
}

/* 響應式：僅桌面版啟用 3D Tilt */
@media (hover: none) or (pointer: coarse) {
  .pet-info-section,
  .radar-section {
    transform: none !important;
  }

  .pet-info-section::after,
  .radar-section::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .result-card {
    padding: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .pet-info-section,
  .radar-section {
    padding: 1.5rem;
  }

  .pet-avatar-large {
    font-size: 4rem;
  }

  .avg-score {
    font-size: 2.5rem;
  }
}
</style>
