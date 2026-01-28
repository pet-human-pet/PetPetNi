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
const marqueeTextLight = '₍^˶⦁༝⦁˶^₎◞♡ '
const marqueeTextDark = '最多元的寵物社交平台'
</script>

<template>
  <footer class="pointer-events-auto z-20 flex w-full flex-col">
    <div
      v-if="isHomePage"
      class="bg-brand-primary flex w-full items-center border-t border-white/20"
    >
      <MarqueeBorder
        :text="marqueeTextLight"
        bg-color="bg-white"
        text-color="text-brand-secondary"
        :duration="45"
      />
    </div>

    <div v-if="isHomePage" class="bg-brand-secondary w-full">
      <MarqueeBorder
        :text="marqueeTextDark"
        bg-color="bg-brand-secondary"
        text-color="text-white"
        :reverse="true"
        :duration="45"
      />
    </div>
  </footer>
</template>
