<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
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

// 判斷是否為首頁（只有首頁使用 MainFrame 藍色框架）
const isHomePage = computed(() => route.name === 'home')

// TODO: 後續整合真實的 auth store (useAuthStore)
// 目前為了開發方便預設為已登入
const isLoggedIn = ref(true)

const menuOpen = computed(() => uiStore.isMenuOpen)

// 計算屬性
const headerClasses = computed(() => [
  'h-(--header-h) fixed left-0 z-50 w-full transition-all duration-300',
  props.transparent || uiStore.isMenuOpen
    ? 'bg-transparent border-none shadow-none'
    : 'bg-white border-b border-border-default shadow-shadow-card',
  // TODO: top-[36px] 為跑馬燈高度，考慮抽成 CSS 變數 --marquee-h
  isHomePage.value ? 'top-[36px]' : 'top-0',
  // Menu 開啟時讓 Header 背景不擋住點擊，但 MenuButton 需設為 auto
  uiStore.isMenuOpen ? 'pointer-events-none' : ''
])

const containerClasses = computed(() => [
  'h-(--header-h) w-full mx-auto flex items-center justify-between relative',
  // TODO: px-[30px]/px-[50px] 為 MainFrame 對齊邊距，考慮抽成 CSS 變數
  isHomePage.value ? 'w-full px-[30px] md:px-[50px]' : 'max-w-300 px-6 max-[800px]:px-4'
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
        :class="{ 'opacity-40 select-none': menuOpen }"
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
            class="hover:text-brand-primary text-brand-primary flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold tracking-wider transition-colors duration-300 hover:bg-gray-50"
          >
            註冊
          </router-link>
          <router-link
            v-show="!uiStore.isMenuOpen"
            :to="{ name: 'login' }"
            class="bg-brand-primary hover:bg-brand-primary/80 flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold tracking-wider text-white transition-colors duration-300"
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
