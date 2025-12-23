<script setup>
import MarqueeBorder from "./MarqueeBorder.vue";
import AppFooter from "../Share/AppFooter.vue";

const marqueeTextRed = "MAYEKAWA NEW GRADUATE RECRUITING";

defineProps({
  // Allows overriding the spacer height if needed, default matches standard header
  topSpacerHeight: {
    type: String,
    default: "120px",
  },
});
</script>

<template>
  <div
    class="h-dvh w-full bg-[#EBE7D9] overflow-hidden relative grid grid-cols-[30px_1fr_30px] md:grid-cols-[40px_1fr_40px] grid-rows-[auto_1fr_auto]"
  >
    <!-- Background Slot (Spans fully, lowest z-index) -->
    <div class="col-span-full row-span-full z-0 pointer-events-none">
      <slot name="background"></slot>
    </div>

    <!-- 1. Top Marquee (Row 1, Full Width) -->
    <div class="col-span-full row-start-1 bg-mayekawa z-20">
      <MarqueeBorder
        :text="marqueeTextRed"
        bg-color="bg-mayekawa"
        text-color="text-white"
        :speed="40"
      />
    </div>

    <!-- 2. Left Marquee (Col 1, Full Height, Highest Z-Index) -->
    <div
      class="col-start-1 row-span-full h-full bg-mayekawa z-30 relative overflow-hidden pointer-events-none"
    >
      <!-- Rotated Marquee Wrapper -->
      <div
        class="absolute top-1/2 left-1/2 origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap w-[200vh] flex justify-center"
      >
        <MarqueeBorder
          :text="marqueeTextRed"
          bg-color="transparent"
          text-color="text-white"
          :speed="40"
        />
      </div>
    </div>

    <!-- 3. Content (Row 2, Col 2) -->
    <div
      class="col-start-2 row-start-2 relative w-full h-full min-w-0 min-h-0 z-10"
    >
      <slot></slot>
    </div>

    <!-- 4. Right Marquee (Col 3, Full Height, Highest Z-Index) -->
    <div
      class="col-start-3 row-span-full h-full bg-mayekawa z-30 relative overflow-hidden pointer-events-none"
    >
      <!-- Rotated Marquee Wrapper -->
      <div
        class="absolute top-1/2 left-1/2 origin-center -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap w-[200vh] flex justify-center"
      >
        <MarqueeBorder
          :text="marqueeTextRed"
          bg-color="transparent"
          text-color="text-white"
          :speed="40"
        />
      </div>
    </div>

    <!-- 5. App Footer (Bottom Marquees) -->
    <AppFooter class="col-span-full row-start-3 w-full z-20" />
  </div>
</template>
