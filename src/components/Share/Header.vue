<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import MenuButton from '@/components/Button/MenuButton.vue'
import NotificationPanel from './HeaderPanel/NotificationPanel.vue'
import EventPanel from './HeaderPanel/EventPanel.vue'
import ChatButton from './HeaderPanel/ChatButton.vue'
import ProfileButton from './HeaderPanel/ProfileButton.vue'

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
const authStore = useAuthStore()

// 使用 storeToRefs 保持 user/token 的響應性
const { token } = storeToRefs(authStore)
const isLoggedIn = computed(() => !!token.value)

// 判斷是否為首頁（只有首頁使用 MainFrame 藍色框架）
const isHomePage = computed(() => route.name === 'home')

// 計算屬性
const headerClasses = computed(() => [
  // TODO: --header-h 目前是 CSS 變數，未來可考慮整合進 tailwind config
  'h-(--header-h) fixed left-0 z-50 w-full transition-all duration-300',
  props.transparent || uiStore.isMenuOpen
    ? 'bg-transparent border-none shadow-none'
    : 'bg-white border-b border-border-default/50 shadow-shadow-card',
  // TODO: Magic Number: top-[36px] 為跑馬燈高度，應抽成 CSS 變數 --marquee-h
  isHomePage.value ? 'md:top-9 top-4' : 'top-0',
  // Menu 開啟時讓 Header 背景不擋住點擊，但 MenuButton 需設為 auto
  uiStore.isMenuOpen ? 'pointer-events-none' : ''
])

const containerClasses = computed(() => [
  'h-(--header-h) w-full mx-auto flex items-center justify-between relative',
  // TODO: Magic Number: px-[30px] 剛好等於首頁跑馬燈寬度，導致重疊，故增加為 px-12 (48px)
  isHomePage.value ? 'w-full px-12 md:px-[50px]' : 'max-w-300 px-6 max-[800px]:px-4'
])

// 方法
function handleLogoClick() {
  uiStore.closeMenu()
  router.push({ name: 'home' })
}
</script>

<template>
  <header :class="headerClasses">
    <div :class="containerClasses">
      <!-- Logo -->
      <!-- TODO: 之後應該會換成logo圖片檔 -->
      <button
        class="pointer-events-auto flex cursor-pointer items-center border-none bg-transparent p-0 no-underline transition-opacity duration-300"
        :class="{ 'pointer-events-none opacity-0': uiStore.isMenuOpen }"
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
      <div v-if="!isLoggedIn" class="pointer-events-auto flex items-center gap-3">
        <div class="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
          <router-link
            v-show="!uiStore.isMenuOpen"
            :to="{ name: 'login', query: { mode: 'register' } }"
            class="hover:text-brand-primary text-brand-primary flex items-center justify-center rounded-full shadow-card bg-white px-3 py-2 text-sm font-bold tracking-wider transition-colors duration-300 hover:bg-gray-50 md:px-5 md:py-3"
          >
            註冊
          </router-link>
          <router-link
            v-show="!uiStore.isMenuOpen"
            :to="{ name: 'login' }"
            class="bg-brand-primary hover:bg-brand-primary/80 shadow-card flex items-center justify-center rounded-full px-3 py-2 text-sm font-bold tracking-wider text-white transition-colors duration-300 md:px-5 md:py-3"
          >
            登入
          </router-link>
        </div>
        <MenuButton />
      </div>

      <!-- 登入後：完整功能按鈕 -->
      <div v-else class="flex items-center gap-1 md:gap-3">
        <div
          class="flex items-center gap-1 transition-opacity duration-300 md:gap-3"
          :class="{ 'pointer-events-none opacity-0': uiStore.isMenuOpen }"
        >
          <!-- 收藏：桌機 dropdown、手機 modal -->
          <EventPanel />

          <!-- 訊息 -->
          <ChatButton />

          <!-- 通知 -->
          <NotificationPanel />

          <!-- Avatar：點擊導向個人頁面 -->
          <ProfileButton />
        </div>

        <!-- Menu 按鈕 -->
        <!-- 當 Header 為 pointer-events-none 時，需確保按鈕可點擊 -->
        <MenuButton class="pointer-events-auto ml-1 md:ml-2" />
      </div>
    </div>
  </header>
</template>
