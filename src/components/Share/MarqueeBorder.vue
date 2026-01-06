<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  text: { type: String, default: 'PAWS' },
  repeatCount: {
    type: Number,
    default: 20,
    validator: (v) => v >= 1 && Number.isInteger(v)
  },
  /** 動畫持續時間（秒），數值越大越慢 */
  duration: {
    type: Number,
    default: 60,
    validator: (v) => v > 0
  },
  separator: { type: String, default: '\u00A0\u00A0\u00A0' },
  bgColor: { type: String, default: 'bg-mayekawa' },
  textColor: { type: String, default: 'text-white' },
  reverse: { type: Boolean, default: false },
  pauseOnHover: { type: Boolean, default: false }
})

const isPaused = ref(false)

const repeatedText = computed(() => Array(props.repeatCount).fill(props.text).join(props.separator))

const marqueeStyle = computed(() => ({
  animationDuration: `${props.duration}s`,
  animationDirection: props.reverse ? 'reverse' : 'normal',
  animationPlayState: isPaused.value ? 'paused' : 'running'
}))

const handleMouseEnter = () => {
  if (props.pauseOnHover) isPaused.value = true
}

const handleMouseLeave = () => {
  if (props.pauseOnHover) isPaused.value = false
}
</script>

<template>
  <div
    role="marquee"
    :aria-label="text"
    class="flex flex-nowrap items-center overflow-hidden whitespace-nowrap select-none"
    :class="[bgColor, textColor]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-for="i in 2"
      :key="i"
      class="animate-marquee inline-block px-2 py-1 text-[10px] font-bold tracking-wider md:px-4 md:py-2 md:text-sm"
      :style="marqueeStyle"
      :aria-hidden="i === 2 ? true : undefined"
    >
      {{ repeatedText }}
    </div>
  </div>
</template>

<style scoped>
.animate-marquee {
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }
}
</style>
