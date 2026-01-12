<script setup>
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

function handleClick() {
  uiStore.toggleMenu()
}
</script>

<template>
  <button
    class="group relative flex h-12 w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 md:h-16 md:w-16"
    type="button"
    @click="handleClick"
  >
    <!-- TODO: #FFA75F 為品牌主色，待整合 CSS 變數 var(--color-brand-primary) -->
    <!-- 背景動畫層 -->
    <div
      class="absolute inset-0 origin-center scale-0 rounded-full bg-[#FFA75F] opacity-10 transition-transform duration-300 group-hover:scale-100"
    ></div>

    <!-- Menu 文字 -->
    <span
      class="mb-0.5 text-[8px] font-bold text-[#FFA75F] transition-colors group-hover:text-[#FFA75F] md:mb-1 md:text-[10px]"
    >
      MENU
    </span>

    <!-- 漢堡圖標（3 條線） -->
    <div
      class="relative flex h-3 w-5 flex-col items-center justify-between transition-all duration-300 md:h-4 md:w-6"
      :class="{ 'rotate-180': uiStore.isMenuOpen }"
    >
      <span
        class="h-0.5 w-full rounded-full bg-[#FFA75F] transition-all duration-300"
        :class="{
          'translate-y-[5px] rotate-45 md:translate-y-[7px]': uiStore.isMenuOpen
        }"
      ></span>
      <span
        class="h-0.5 w-full rounded-full bg-[#FFA75F] transition-all duration-300"
        :class="{ 'opacity-0': uiStore.isMenuOpen }"
      ></span>
      <span
        class="h-0.5 w-full rounded-full bg-[#FFA75F] transition-all duration-300"
        :class="{
          '-translate-y-[5px] -rotate-45 md:-translate-y-[7px]': uiStore.isMenuOpen
        }"
      ></span>
    </div>
  </button>
</template>
