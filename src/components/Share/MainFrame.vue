<script setup>
import MarqueeBorder from './MarqueeBorder.vue'
import AppFooter from '../Share/AppFooter.vue'

defineProps({
  // Allows overriding the spacer height if needed, default matches standard header
  topSpacerHeight: {
    type: String,
    default: '120px'
  }
})
</script>

<template>
  <div
    class="bg-bg-base relative grid h-dvh w-full grid-cols-[30px_1fr_30px] grid-rows-[auto_1fr_auto] overflow-hidden md:grid-cols-[40px_1fr_40px]"
  >
    <!-- Background Slot (Spans fully, lowest z-index) -->
    <div class="pointer-events-none z-0 col-span-full row-span-full">
      <slot name="background"></slot>
    </div>

    <!-- 1. Top Marquee (Row 1, Full Width) -->
    <div class="bg-brand-secondary z-20 col-span-full row-start-1">
      <MarqueeBorder
        text="AI時代要把網站切那麼醜，也是不容易。"
        bg-color="bg-brand-secondary"
        text-color="text-white"
        :duration="50"
      />
    </div>

    <!-- 2. Left Marquee (Col 1, Full Height, Highest Z-Index) -->
    <div
      class="bg-brand-secondary pointer-events-none relative z-30 col-start-1 row-span-full h-full overflow-hidden"
    >
      <!-- Rotated Marquee Wrapper -->
      <div
        class="absolute top-1/2 left-1/2 flex w-[200vh] origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 justify-center whitespace-nowrap"
      >
        <MarqueeBorder
          text="PAWS·PAWS"
          bg-color="bg-brand-secondary"
          text-color="text-white"
          :duration="50"
        />
      </div>
    </div>

    <!-- 3. Content (Row 2, Col 2) -->
    <div class="relative z-10 col-start-2 row-start-2 h-full min-h-0 w-full min-w-0">
      <slot></slot>
    </div>

    <!-- 4. Right Marquee (Col 3, Full Height, Highest Z-Index) -->
    <div
      class="bg-brand-secondary pointer-events-none relative z-30 col-start-3 row-span-full h-full overflow-hidden"
    >
      <!-- Rotated Marquee Wrapper -->
      <div
        class="absolute top-1/2 left-1/2 flex w-[200vh] origin-center -translate-x-1/2 -translate-y-1/2 rotate-90 justify-center whitespace-nowrap"
      >
        <MarqueeBorder
          text="PAWS·PAWS"
          bg-color="bg-brand-secondary"
          text-color="text-white"
          :duration="50"
        />
      </div>
    </div>

    <!-- 5. App Footer (Bottom Marquees) -->
    <AppFooter class="z-20 col-span-full row-start-3 w-full" />
  </div>
</template>
