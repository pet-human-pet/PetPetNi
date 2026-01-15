<script setup>
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

function handleClick() {
  uiStore.toggleMenu()
}
</script>

<template>
  <button
    class="group relative flex h-14 w-14 flex-col items-center justify-center overflow-hidden rounded-full transition-transform duration-300 hover:scale-110 active:scale-95"
    type="button"
    @click="handleClick"
  >
    <!-- TODO: #FFA75F 為品牌主色，待整合 CSS 變數 var(--color-brand-primary) -->
    <!-- 背景動畫層 -->
    <div
      class="absolute inset-0 origin-center scale-0 rounded-full bg-white transition-transform duration-300 group-hover:scale-150"
    ></div>

    <!-- 漢堡圖標（3 條線） -->
    <!-- TODO: #FFA75F 為品牌主色，待整合 CSS 變數 var(--color-brand-primary) -->
    <div
      class="relative z-10 flex h-3 w-5 flex-col items-center justify-between transition-all duration-300 md:h-4 md:w-6"
    >
      <span
        class="h-0.5 w-full rounded-full bg-[#FFA75F] transition-all duration-300 group-hover:translate-y-[5px] group-hover:rotate-45 md:group-hover:translate-y-[7px]"
      ></span>
      <span
        class="h-0.5 w-full rounded-full bg-[#FFA75F] transition-all duration-300 group-hover:opacity-0"
      ></span>
      <span
        class="h-0.5 w-full rounded-full bg-[#FFA75F] transition-all duration-300 group-hover:-translate-y-[5px] group-hover:-rotate-45 md:group-hover:-translate-y-[7px]"
      ></span>
    </div>

    <!-- 文字標籤 -->
    <span class="relative z-10 mt-1 text-xs font-bold text-[#FFA75F]"> MENU </span>
  </button>
</template>
