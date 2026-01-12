<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MarqueeBorder from './MarqueeBorder.vue'

const route = useRoute()

// 邏輯定義：
// 判斷當前是否為首頁 (假設首頁的路由名稱是 'home' 或路徑是 '/')
// 如果是首頁 -> true (顯示跑馬燈)
// 如果是內頁 -> false (隱藏跑馬燈)
const isHomePage = computed(() => route.name === 'home' || route.path === '/')

// 跑馬燈文字內容
const marqueeTextLight = '繁體。中文字。測試'
const marqueeTextDark = '繁體。中文字。測試'
</script>

<template>
  <footer class="pointer-events-auto z-20 flex w-full flex-col">
    <div
      class="flex w-full items-end justify-between px-[50px] py-4 text-[10px] font-medium tracking-wide text-black md:pb-4 md:text-xs"
    >
      <div class="opacity-80">&copy; PETPETNI</div>

      <div class="flex items-center gap-6">
        <div class="flex gap-3">
          <img
            src="@/assets/icons/icon-social-instagram.svg"
            class="h-6 w-6 cursor-pointer hover:opacity-80"
          />
          <img
            src="@/assets/icons/icon-social-tiktok.svg"
            class="h-6 w-6 cursor-pointer hover:opacity-80"
          />
          <img
            src="@/assets/icons/icon-social-youtube.svg"
            class="h-6 w-6 cursor-pointer hover:opacity-80"
          />
        </div>
        <div class="hidden gap-4 md:flex">
          <a href="#" class="flex items-center gap-1 hover:underline">
            CORPORATE SITE <span class="text-[10px]">↗</span>
          </a>
          <a href="#" class="flex items-center gap-1 hover:underline">
            採用活動におけるプライバシーポリシー
            <span class="text-[10px]">↗</span>
          </a>
        </div>
      </div>
    </div>

    <div v-if="isHomePage" class="border-mayekawa/20 flex w-full items-center border-t bg-white">
      <MarqueeBorder
        :text="marqueeTextLight"
        bg-color="bg-white"
        text-color="text-mayekawa"
        :duration="45"
      />
    </div>

    <div v-if="isHomePage" class="bg-mayekawa w-full">
      <MarqueeBorder
        :text="marqueeTextDark"
        bg-color="bg-mayekawa"
        text-color="text-white"
        :reverse="true"
        :duration="45"
      />
    </div>
  </footer>
</template>
