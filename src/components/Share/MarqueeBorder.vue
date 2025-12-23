<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: 'MAYEKAWA' },
  repeatCount: { type: Number, default: 20 },
  speed: { type: Number, default: 40 }, // seconds for full loop
  bgColor: { type: String, default: 'bg-mayekawa' },
  textColor: { type: String, default: 'text-white' },
  reverse: { type: Boolean, default: false }
})

// Repeat text enough times to fill width and ensure smooth loop. 
const repeatedText = computed(() => {
  return Array(props.repeatCount).fill(props.text).join('   ')
})
</script>

<template>
  <div class="overflow-hidden whitespace-nowrap flex select-none items-center" :class="[bgColor, textColor]">
    <div 
      class="animate-marquee inline-block py-1 px-2 md:py-2 md:px-4 font-bold text-[10px] md:text-sm tracking-wider"
      :style="{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }"
    >
      {{ repeatedText }}
    </div>
    <div 
      class="animate-marquee inline-block py-1 px-2 md:py-2 md:px-4 font-bold text-[10px] md:text-sm tracking-wider" 
      aria-hidden="true"
      :style="{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }"
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
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
</style>
