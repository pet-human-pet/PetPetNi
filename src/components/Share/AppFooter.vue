<script setup>
import MarqueeBorder from "./MarqueeBorder.vue";

// Define marquee text constants
const marqueeTextWhite =
  "THE COOLEST COMPANY IN THE WORLD. MAYEKAWA RECRUITING 2027";
const marqueeTextRed =
  "THE COOLEST COMPANY IN THE WORLD. MAYEKAWA RECRUITING 2027";
</script>

<template>
  <footer class="w-full flex flex-col pointer-events-auto z-20">
    <!-- Footer Links & Copyright -->
    <div
      class="w-full p-4 md:px-8 md:pb-4 flex justify-between items-end text-[10px] md:text-xs text-black font-medium tracking-wide"
    >
      <!-- Copyright -->
      <div class="opacity-80">&copy; MAYEKAWA MFG. CO., LTD.</div>

      <!-- Links & Social -->
      <div class="flex items-center gap-6">
        <!-- Social Icons -->
        <div class="flex gap-3">
          <img
            src="@/assets/icons/icon-social-instagram.svg"
            class="w-6 h-6 hover:opacity-80 cursor-pointer"
          />
          <img
            src="@/assets/icons/icon-social-tiktok.svg"
            class="w-6 h-6 hover:opacity-80 cursor-pointer"
          />
          <img
            src="@/assets/icons/icon-social-youtube.svg"
            class="w-6 h-6 hover:opacity-80 cursor-pointer"
          />
        </div>
        <!-- Links -->
        <div class="hidden md:flex gap-4">
          <a href="#" class="hover:underline flex items-center gap-1">
            CORPORATE SITE <span class="text-[10px]">↗</span>
          </a>
          <a href="#" class="hover:underline flex items-center gap-1">
            採用活動におけるプライバシーポリシー
            <span class="text-[10px]">↗</span>
          </a>
        </div>
      </div>
    </div>

    <!-- White Marquee -->
    <div class="w-full bg-white border-t border-mayekawa/20 flex items-center">
      <MarqueeBorder
        :text="marqueeTextWhite"
        bg-color="bg-white"
        text-color="text-mayekawa"
        :speed="40"
      />
    </div>
    <!-- Red Marquee -->
    <div class="w-full bg-mayekawa">
      <MarqueeBorder
        :text="marqueeTextRed"
        bg-color="bg-mayekawa"
        text-color="text-white"
        :reverse="true"
        :speed="40"
      />
    </div>
  </footer>
</template>
