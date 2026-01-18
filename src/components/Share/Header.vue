<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import MenuButton from '@/components/Button/MenuButton.vue'
import NotificationPanel from './HeaderPanel/NotificationPanel.vue'
import EventPanel from './HeaderPanel/EventPanel.vue'

// Props
const props = defineProps({
  transparent: {
    type: Boolean,
    default: false
  }
})

// Router & Store
const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()

// 判斷是否為首頁（只有首頁使用 MainFrame 藍色框架）
const isHomePage = computed(() => route.name === 'home')

// TODO: 後續整合真實的 auth store (useAuthStore)
const isLoggedIn = ref(true)

// 常數與狀態
const defaultAvatar =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'

const menuOpen = computed(() => uiStore.isMenuOpen)

// 計算屬性
const headerClasses = computed(() => [
  'h-(--header-h) fixed left-0 z-50 w-full',
  props.transparent || uiStore.isMenuOpen
    ? 'bg-transparent border-none shadow-none'
    : 'bg-white border-b border-border-default shadow-shadow-card',
  // TODO: top-[36px] 為跑馬燈高度，考慮抽成 CSS 變數 --marquee-h
  isHomePage.value ? 'top-[36px]' : 'top-0',
  uiStore.isMenuOpen ? 'pointer-events-none' : ''
])

const containerClasses = computed(() => [
  'h-(--header-h) w-full mx-auto flex items-center justify-between',
  // TODO: px-[30px]/px-[50px] 為 MainFrame 對齊邊距，考慮抽成 CSS 變數
  isHomePage.value ? 'w-full px-[30px] md:px-[50px]' : 'max-w-300 px-6 max-[800px]:px-4'
])

// 方法
function handleLogoClick() {
  uiStore.closeMenu()
  router.push({ name: 'home' })
}

function goProfile() {
  router.push({ name: 'Profile' })
}

function goChat() {
  router.push({ name: 'chat-test' })
}
</script>

<template>
  <header v-show="!uiStore.isMenuOpen" :class="headerClasses">
    <div :class="containerClasses">
      <!-- Logo -->
      <button
        class="flex cursor-pointer items-center border-none bg-transparent p-0 no-underline"
        :class="{ 'pointer-events-none opacity-40': menuOpen }"
        @click="handleLogoClick"
      >
        <span
          class="text-brand-primary text-2xl font-semibold max-[800px]:text-xl"
          style="font-family: 'Fredoka', sans-serif"
        >
          PetPetNi
        </span>
      </button>

      <!-- 登入前：只顯示登入按鈕 + Menu -->
      <div v-if="!isLoggedIn" class="flex items-center gap-3">
        <router-link
          v-show="!uiStore.isMenuOpen"
          :to="{ name: 'login' }"
          class="flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-wider text-black transition-colors duration-300 hover:bg-gray-200"
        >
          登入
        </router-link>
        <MenuButton />
      </div>

      <!-- 登入後：完整功能按鈕 -->
      <div v-else class="flex items-center gap-3">
        <div v-show="!uiStore.isMenuOpen" class="flex items-center gap-3">
          <!-- 收藏：桌機 dropdown、手機 modal -->
          <EventPanel />

          <!-- 訊息 -->

          <button
            class="text-btn-accent hover:text-brand-primary hover:bg-btn-secondary relative flex h-10 w-10 items-center justify-center rounded-full transition max-[800px]:hidden"
            title="訊息"
            type="button"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
            @click="goChat"
          >
            <i class="fa-regular fa-comment-dots"></i>

            <span
              class="bg-brand-accent absolute top-2 right-2 h-2 w-2 rounded-full border border-white"
            />
          </button>

          <!-- 通知 -->
          <NotificationPanel></NotificationPanel>
          <!-- Avatar：點擊導向個人頁面 -->
          <button
            type="button"
            class="border-border-default h-10 w-10 overflow-hidden rounded-full border-2 p-0"
            title="個人頁面"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
            @click="goProfile"
          >
            <img :src="defaultAvatar" class="h-full w-full object-cover" alt="avatar" />
          </button>
        </div>

        <!-- Menu 按鈕 -->
        <MenuButton class="ml-2" />
      </div>
    </div>
  </header>
</template>
