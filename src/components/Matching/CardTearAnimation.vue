<template>
  <div class="tear-animation-container">
    <div ref="topHalf" class="card-half top" :class="{ 'is-tearing': isTearing }">
      <div class="tear-edge"></div>
    </div>

    <div ref="bottomHalf" class="card-half bottom" :class="{ 'is-tearing': isTearing }">
      <div class="tear-edge"></div>
    </div>

    <transition name="flash">
      <div v-if="showFlash" class="flash-overlay"></div>
    </transition>

    <transition name="reveal">
      <div v-if="showContent" class="revealed-content">
        <div class="pet-avatar">{{ petEmoji }}</div>
        <div class="sparkles">
          <span v-for="i in 8" :key="i" class="sparkle" :style="sparkleStyle(i)">✨</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  petEmoji: {
    type: String,
    default: '🐕'
  },
  autoStart: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['complete'])

const topHalf = ref(null)
const bottomHalf = ref(null)
const isTearing = ref(false)
const showFlash = ref(false)
const showContent = ref(false)

function startTear() {
  isTearing.value = true

  setTimeout(() => {
    showFlash.value = true
  }, 600)

  setTimeout(() => {
    showFlash.value = false
    showContent.value = true
  }, 1200)

  setTimeout(() => {
    emit('complete')
  }, 1500)
}

function sparkleStyle(index) {
  const angle = (360 / 8) * index
  const radius = 120
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${index * 0.1}s`
  }
}

onMounted(() => {
  if (props.autoStart) {
    setTimeout(startTear, 300)
  }
})

defineExpose({ startTear })
</script>

<style scoped>
.tear-animation-container {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.card-half {
  position: absolute;
  width: 300px;
  height: 200px;
  background: linear-gradient(135deg, #2e6256, #edc920);
  border-radius: var(--radius-card);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.card-half.top {
  transform-origin: bottom center;
}

.card-half.bottom {
  transform-origin: top center;
}

.card-half.is-tearing.top {
  transform: translateY(-150px) rotateX(30deg) scale(0.9);
  opacity: 0;
}

.card-half.is-tearing.bottom {
  transform: translateY(150px) rotateX(-30deg) scale(0.9);
  opacity: 0;
}

.tear-edge {
  position: absolute;
  width: 100%;
  height: 10px;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 8px,
    rgba(255, 255, 255, 0.3) 8px,
    rgba(255, 255, 255, 0.3) 12px
  );
}

.card-half.top .tear-edge {
  bottom: -5px;
}

.card-half.bottom .tear-edge {
  top: -5px;
}

.flash-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(237, 201, 32, 0.6), transparent);
  animation: flash-pulse 0.4s ease-out;
}

@keyframes flash-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(2);
  }
}

.revealed-content {
  position: relative;
  z-index: 100;
}

.pet-avatar {
  font-size: 8rem;
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 0 30px rgba(237, 201, 32, 0.5));
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 2rem;
  animation: sparkle-float 1.5s ease-out forwards;
}

@keyframes sparkle-float {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.reveal-enter-active {
  transition: all 0.6s ease-out;
}

.reveal-enter-from {
  opacity: 0;
  transform: scale(0.3);
}

.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.3s;
}
</style>
