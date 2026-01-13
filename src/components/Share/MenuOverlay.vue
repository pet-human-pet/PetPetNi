<script setup>
import { useUIStore } from '../../stores/ui'
import NavIcon from './NavIcon.vue'
import BackgroundGrid from './BackgroundGrid.vue'
import MenuButton from '@/components/Button/MenuButton.vue'
import { toRef } from 'vue'
import { useScrollLock } from '@/composables/useScrollLock'

const props = defineProps({
  open: Boolean
})

useScrollLock(toRef(props, 'open'))
const uiStore = useUIStore()

// 選單項目
const menuItems = [
  { en: 'Chat', zh: '聊天區', icon: '聊天區.webp', path: '/chat-test' },
  { en: 'Event', zh: '活動區', icon: '活動區.webp', path: '/event' },
  { en: 'Social', zh: '交友區', icon: '交友區.webp', path: '/social' },
  { en: 'Profile', zh: '個人資料', icon: '社交區.webp', path: '/profile' }
]

// 社群連結 (抽取共用)
const socialLinks = [
  { name: 'Instagram', icon: 'icon-social-instagram.svg', url: '#' },
  { name: 'TikTok', icon: 'icon-social-tiktok.svg', url: '#' },
  { name: 'YouTube', icon: 'icon-social-youtube.svg', url: '#' }
]

// 頁尾連結 (抽取共用)
const footerLinks = [
  { label: '隱私權政策', url: '#' },
  { label: '服務條款', url: '#' }
]

const getIconUrl = (name) => {
  return new URL(`../../assets/icons/${name}`, import.meta.url).href
}
</script>

<template>
  <Transition name="menu-fade">
    <div
      v-if="uiStore.isMenuOpen"
      class="bg-mayekawa fixed inset-0 isolate z-40 transform-gpu cursor-pointer overflow-hidden"
      @click.self="uiStore.closeMenu()"
    >
      <BackgroundGrid class="pointer-events-none fixed inset-0 opacity-5" />

      <!-- 右上角 MenuButton -->
      <div class="pointer-events-auto fixed top-6 right-6 z-50">
        <MenuButton />
      </div>

      <!-- 手機版佈局 -->
      <div class="relative flex min-h-screen flex-col px-6 pt-24 pb-10 md:hidden">
        <div class="pointer-events-auto mb-8 flex flex-col gap-6">
          <div class="flex items-center justify-end">
            <div class="mr-12 flex gap-2">
              <button
                class="text-mayekawa flex items-center rounded bg-white px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-100 sm:rounded-full"
              >
                探索寵物
              </button>
              <button
                class="text-mayekawa flex items-center rounded bg-white px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-100 sm:rounded-full"
              >
                開始配對
              </button>
            </div>
          </div>
        </div>

        <!-- 垂直標語 -->
        <div class="pointer-events-none absolute top-32 right-4 bottom-20 z-0 w-8">
          <div
            class="writing-vertical-rl flex h-full items-center justify-center text-3xl leading-none font-bold tracking-widest text-white opacity-20"
          >
            Pet到心坎裡
          </div>
          <div
            class="writing-vertical-rl absolute top-0 right-full mr-2 h-auto text-xs tracking-widest text-white opacity-80"
          >
            PetPetNi 寵物社交平台
          </div>
        </div>

        <!-- 選單項目 (手機版) -->
        <div class="pointer-events-auto z-10 flex flex-1 flex-col gap-0 pr-10">
          <NavIcon
            v-for="item in menuItems"
            :key="item.en"
            :label-en="item.en"
            :label-zh="item.zh"
            :icon-name="item.icon"
            :to="item.path"
            class="w-full"
            variant="list"
            @click="uiStore.closeMenu()"
          >
            <template #icon>
              <img
                :src="getIconUrl(item.icon)"
                class="h-full w-full object-contain"
                :alt="item.en"
              />
            </template>
          </NavIcon>
        </div>

        <!-- 社群連結與頁尾 (手機版) -->
        <div class="pointer-events-auto z-10 mt-8 flex flex-col gap-4">
          <div class="mb-4 flex gap-4">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
            >
              <img :src="getIconUrl(social.icon)" class="h-full w-full" :alt="social.name" />
            </a>
          </div>
          <div class="flex flex-col gap-2 text-[10px] text-white opacity-80">
            <div class="flex gap-4">
              <a
                v-for="link in footerLinks"
                :key="link.label"
                :href="link.url"
                class="hover:underline"
              >
                {{ link.label }} ↗
              </a>
            </div>
            <div class="mt-2 opacity-60">© PETPETNI</div>
          </div>
        </div>
      </div>

      <!-- 桌面版佈局 -->
      <div
        class="pointer-events-none relative hidden min-h-screen flex-row items-center justify-center px-12 pt-24 pb-10 md:flex"
      >
        <div class="pointer-events-auto flex w-5/12 flex-col items-start justify-center space-y-12">
          <!-- 桌面版標語 -->
          <div class="flex flex-col text-white">
            <div class="flex items-start gap-6">
              <div class="writing-vertical-rl h-32 pt-2 text-sm tracking-widest opacity-80">
                PetPetNi 寵物社交平台
              </div>
              <div class="text-7xl leading-none font-bold tracking-widest drop-shadow-md">
                <div class="mb-2">Pet到</div>
                <div>心坎裡</div>
              </div>
            </div>
          </div>

          <!-- 桌面版按鈕 -->
          <div class="flex flex-col gap-4">
            <!-- TODO: 待替換 text-[#D70035] 為變數 (Style.md 禁止直接使用 Hex 色碼) -->
            <button
              class="group flex min-w-[280px] items-center justify-between rounded-full bg-white px-8 py-4 font-bold text-[#D70035] transition-colors hover:bg-gray-100"
            >
              <span>探索寵物</span>
              <span class="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
            <!-- TODO: 待替換 text-[#D70035] 為變數 (Style.md 禁止直接使用 Hex 色碼) -->
            <button
              class="group flex min-w-[280px] items-center justify-between rounded-full bg-white px-8 py-4 font-bold text-[#D70035] transition-colors hover:bg-gray-100"
            >
              <span class="tracking-widest">開始配對</span>
              <span class="text-xs font-normal text-gray-400">尋找你的寵物夥伴</span>
              <span class="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        <!-- 選單項目 (桌面版) -->
        <div class="pointer-events-auto grid w-7/12 grid-cols-2 gap-12 pl-12">
          <NavIcon
            v-for="item in menuItems"
            :key="item.en"
            :label-en="item.en"
            :label-zh="item.zh"
            :icon-name="item.icon"
            :to="item.path"
            class="w-full"
            variant="grid"
            @click="uiStore.closeMenu()"
          >
            <template #icon>
              <img
                :src="getIconUrl(item.icon)"
                class="h-full w-full object-contain"
                :alt="item.en"
              />
            </template>
          </NavIcon>
        </div>

        <!-- 社群連結 (桌面版) -->
        <div class="pointer-events-auto absolute right-6 bottom-6 flex gap-4">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
            class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
          >
            <img :src="getIconUrl(social.icon)" class="h-full w-full" :alt="social.name" />
          </a>

          <div class="ml-4 flex items-center gap-4 text-[10px] text-white">
            <a
              v-for="link in footerLinks"
              :key="link.label"
              :href="link.url"
              class="hover:underline"
            >
              {{ link.label }} ↗
            </a>
          </div>
        </div>

        <div class="absolute bottom-6 left-6 text-[10px] text-white opacity-60">© PETPETNI</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
