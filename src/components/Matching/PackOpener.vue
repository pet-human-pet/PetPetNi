```
<template>
  <div class="stage" @mousemove="handleTilt" @mouseleave="resetTilt">
    <!-- Pack to be opened -->
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
        <!-- Removed pack-top to match Carousel's card-like appearance -->
      </div>
    </div>
    <!-- Revealed Card Container -->
    <div class="cards-container" :class="{ show: showCards, 'has-focus': isFocused }">
      <div
        class="card stacked profile-card-style"
        :class="{ spread: isSpread, revealed: isRevealed }"
        :style="cardTiltStyle"
        @click.stop="handleCardClick"
      >
        <div class="card-inner">
          <!-- Card Back (Tarot Image) -->
          <div class="card-back" :style="packBackStyle">
            <div class="card-back-pattern"></div>
          </div>

          <!-- Card Front: Profile Style matches MatchResultCard -->
          <div class="card-front profile-content">
            <div class="pet-info-wrapper">
              <!-- Avatar -->
              <div class="pet-avatar-large">
                <img
                  v-if="isImageUrl(petData.avatar || petData.avatarUrl)"
                  :src="petData.avatar || petData.avatarUrl"
                  :alt="petData.name"
                  class="avatar-image"
                />
                <span v-else>{{ petData.avatar || petData.avatarUrl || '🐕' }}</span>
              </div>

              <!-- Name -->
              <h2 class="pet-name">
                {{ petData.name || '未命名' }}
              </h2>

              <!-- Species Badge -->
              <div class="species-badge">
                {{
                  petData.species === 'DOG' || petData.type === 'dog'
                    ? '🐕 狗狗'
                    : petData.species === 'CAT' || petData.type === 'cat'
                      ? '🐱 貓貓'
                      : '🐾 寵物'
                }}
              </div>

              <!-- Tags -->
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

              <!-- Bio -->
              <p class="pet-bio">
                {{ petData.bio || '這是一隻可愛的毛孩' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hints and Controls -->
    <!-- Initial hint -->
    <div v-if="!isFlipping && !isPackHidden" class="hint">👆 點擊卡包開啟</div>

    <!-- Focus Hint (After reveal) - Handled by parent DailyMatchView -->
    <!-- <div v-if="isFocused" class="hint focus-hint" @click="emitClose">點擊任意處繼續</div> -->

    <!-- Removed old controls/hints to clean up UI as per request -->
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

// Refs
const boosterPackRef = ref(null)

// State: Pack Opening
const isFlipping = ref(false)
const isPackHidden = ref(false)
// const packEmoji = computed(() => props.packType.icon || props.packType.emoji || '⚡') // Removed unused
const getPackStyleIndex = computed(() => {
  // Map pack ID to style index (0-4)
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

// State: Card Reveal
const showCards = ref(false)
const isSpread = ref(false)
const isRevealed = ref(false)
const isFocused = ref(false) // New state for post-reveal focus

// Tilt State
const tiltX = ref(0)
const tiltY = ref(0)
const cardTiltStyle = computed(() => {
  if (!isRevealed.value) return {}
  return {
    transform: `translate(-50%, -50%) rotateY(${180 + tiltX.value}deg) rotateX(${tiltY.value}deg) scale(1.5)`,
    // Removed transition here to make mouse movement responsive.
    // We add transition only for reset? Or use a spring lib.
    // For raw CSS, no transition is snappier, but transition: transform 0.1s is smoother.
    transition: 'transform 0.1s ease-out'
  }
})

function handleTilt(e) {
  if (!isRevealed.value) return

  // Calculate relative to window center or stage center
  // Assuming stage is centered
  const width = window.innerWidth
  const height = window.innerHeight

  const x = e.clientX
  const y = e.clientY

  const centerX = width / 2
  const centerY = height / 2

  const rotateXMax = 20
  const rotateYMax = 20

  // Invert Y axis
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

// Helpers for Profile Card
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

  // Animation Sequence
  setTimeout(() => {
    isPackHidden.value = true
    showCards.value = true

    // Spread card
    setTimeout(() => {
      isSpread.value = true

      // Auto reveal after spread
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
    // isFocused.value = !isFocused.value // No longer needed
  }
}

function revealCard() {
  if (isRevealed.value) return
  isSpread.value = false
  isRevealed.value = true

  emit('opened')

  // Trigger Focus Mode after 0.5s
  setTimeout(() => {
    isFocused.value = true
  }, 500)
}

function emitClose() {
  emit('close')
}
</script>

<style scoped>
/* Copied styles from Carousel for consistency */
.style-0 {
  background: linear-gradient(135deg, #fbbf24, #d97706);
} /* Gold */
.style-1 {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
} /* Red */
.style-2 {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
} /* Blue */
.style-3 {
  background: linear-gradient(135deg, #34d399, #059669);
} /* Green */
.style-4 {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
} /* Purple */

.stage {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 600px;
  margin: 0 auto;
  perspective: 1500px;
  overflow: visible; /* Changed from hidden to visible */
}

/* Glow Animation */
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

/* Pack Styles matching Carousel */
.booster-pack {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  width: 240px; /* Matched Card size */
  height: 420px; /* Matched Card size */
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
  border-radius: 24px; /* Increased Radius */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: visible; /* Changed to visible for glow */
  backface-visibility: hidden;
  /* Background set by style-X classes */
}

/* Glow Effect */
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

/* Re-added pattern */
.pack-pattern {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
  pointer-events: none;
  border-radius: 24px; /* Ensure pattern stays within radius visually */
  overflow: hidden; /* Local overflow for pattern */
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

/* Card Reveal */
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
  z-index: 200; /* Ensure container is above overlay (150) */
}

.cards-container.has-focus {
  z-index: 10000; /* Higher than reveal overlay (9990) */
}

/* Profile Card Styles (Scaled down from Result Card) */
.card {
  position: absolute;
  width: 240px; /* Reduced from 280px */
  height: 420px; /* Increased from 340px to ~0.57 ratio (240 / 0.57) */
  left: 50%;
  top: 50%; /* Moved down from 40% to 50% */
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
  /* Fix: when revealed, we want to see front (rotateY 180deg) but simple flip logic needs proper faces */
  transform: translate(-50%, -50%) rotateY(180deg) scale(1);
}

.card.focused {
  transform: translate(-50%, -50%) rotateY(180deg) scale(1.1); /* Reduced from 1.4 */
  z-index: 9995; /* Higher than overlay (9990) */
  position: fixed; /* Fix to viewport center when focused */
  top: 40%; /* Match original position style but fixed */
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
  /* Ensure it doesn't block clicks or visuals if z-fighting occurs */
}

.card-back-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
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
  border: 4px solid #fff;
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
  color: #1f2937;
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
  /* Removed scrollbar */
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
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.pet-bio {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Holo Effects */
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

/* Burst FX */
.rare-burst {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
  opacity: 0;
  z-index: 150;
}

.rare-burst.show {
  animation: burstEffect 1s ease-out forwards;
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

/* Sparkles (Global for component) */
/* Note: Since we use createElement/appendChild, we should probably style these globally or use :deep if scoped */
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

/* Controls */
.controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 100px; /* Adjusted to be closer to new card center (at 40%) */
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
  bottom: 10px; /* Aligned with CardCarousel */
  left: 50%;
  transform: translateX(-50%);
  /* margin-top removed, positioning by bottom now */
  width: auto; /* Allow auto width for pill shape */
  white-space: nowrap;

  /* Glassmorphism style from CardCarousel */
  color: #1f2937; /* Darker text */
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
