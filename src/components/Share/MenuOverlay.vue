<script setup>
import { useUIStore } from '../../stores/ui'
import { useRouter } from 'vue-router'
import NavIcon from './NavIcon.vue'
import BackgroundGrid from './BackgroundGrid.vue'
import { toRef } from 'vue'
import { useScrollLock } from '@/composables/useScrollLock'
const props = defineProps({
  open: Boolean
})

// 這一行就像是說：「我要使用鎖定功能，但只在 props.open 為 true 時鎖定」
useScrollLock(toRef(props, 'open'))
const router = useRouter()
const uiStore = useUIStore()

// Logo 點擊處理：先關閉選單，再導航至首頁
function handleLogoClick() {
  uiStore.closeMenu()
  router.push('/')
}

// TODO: 更新選單項目內容，目前仍為 MAYEKAWA（前川製作所）的範本資料
// 需要替換為 PetPetNi 專案的實際選單項目（如：寵物列表、匹配、個人檔案等）
const menuItems = [
  { en: 'chat-test', zh: '寵物列表', icon: 'icon-about.svg', path: '/chat-test' }, // Factory
  { en: 'Event', zh: '匹配', icon: 'icon-interview.svg', path: '/event' }, // Walking man
  { en: 'Social', zh: '匹配', icon: 'icon-philosophy.svg', path: '/social' }, // Bust
  { en: 'Profile', zh: '個人檔案', icon: 'icon-career.svg', path: '/profile' } // Helmet
].slice(0, 4) // Limit to 4 items for no-scroll strict policy

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

      <div class="relative flex min-h-screen flex-col px-6 pt-24 pb-10 md:hidden">
        <div class="pointer-events-auto mb-8 flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <button class="cursor-pointer border-none bg-transparent p-0" @click="handleLogoClick">
              <img src="@/assets/images/logo-white.svg" class="h-6 opacity-90" alt="Mayekawa" />
            </button>

            <!-- TODO: 更新按鈕文字，目前為 MAYEKAWA 招募網站的「募集要項」和「ENTRY」 -->
            <!-- 建議改為 PetPetNi 相關功能，如「探索寵物」、「開始配對」等 -->
            <div class="mr-12 flex gap-2">
              <button
                class="text-mayekawa flex items-center rounded bg-white px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-100 sm:rounded-full"
              >
                募集要項
              </button>
              <button
                class="text-mayekawa flex items-center rounded bg-white px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-100 sm:rounded-full"
              >
                ENTRY
              </button>
            </div>
          </div>
        </div>

        <!-- TODO: 更新垂直文字區域，目前為 MAYEKAWA 的標語「世界一、冷たい会社。」和「前川製作所 新卒採用サイト」 -->
        <!-- 建議改為 PetPetNi 的品牌標語，如「找到你的完美寵物夥伴」等 -->
        <div class="pointer-events-none absolute top-32 right-4 bottom-20 z-0 w-8">
          <div
            class="writing-vertical-rl flex h-full items-center justify-center text-3xl leading-none font-bold tracking-widest text-white opacity-20"
          >
            世界一、冷たい会社。
          </div>
          <div
            class="writing-vertical-rl absolute top-0 right-full mr-2 h-auto text-xs tracking-widest text-white opacity-80"
          >
            前川製作所 新卒採用サイト
          </div>
        </div>

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

        <div class="pointer-events-auto z-10 mt-8 flex flex-col gap-4">
          <div class="mb-4 flex gap-4">
            <a
              href="#"
              class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
            >
              <img src="@/assets/icons/icon-social-instagram.svg" class="h-full w-full" />
            </a>
            <a
              href="#"
              class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
            >
              <img src="@/assets/icons/icon-social-tiktok.svg" class="h-full w-full" />
            </a>
            <a
              href="#"
              class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
            >
              <img src="@/assets/icons/icon-social-youtube.svg" class="h-full w-full" />
            </a>
          </div>
          <div class="flex flex-col gap-2 text-[10px] text-white opacity-80">
            <div class="flex gap-4">
              <a href="#" class="hover:underline">採用活動におけるプライバシーポリシー ↗</a>
            </div>
            <div class="flex gap-4">
              <a href="#" class="hover:underline">CORPORATE SITE ↗</a>
            </div>
            <div class="mt-2 opacity-60">© MAYEKAWA MFG. CO., LTD.</div>
          </div>
        </div>
      </div>

      <div
        class="pointer-events-none relative hidden min-h-screen flex-row items-center justify-center px-12 pt-24 pb-10 md:flex"
      >
        <div class="pointer-events-auto flex w-5/12 flex-col items-start justify-center space-y-12">
          <!-- TODO: 桌面版標語區域，目前為 MAYEKAWA 的「世界一、冷たい会社。」和「前川製作所 新卒採用サイト」 -->
          <!-- 建議改為 PetPetNi 的品牌標語和網站描述 -->
          <div class="flex flex-col text-white">
            <div class="flex items-start gap-6">
              <div class="writing-vertical-rl h-32 pt-2 text-sm tracking-widest opacity-80">
                前川製作所 新卒採用サイト
              </div>
              <div class="text-7xl leading-none font-bold tracking-widest drop-shadow-md">
                <div class="mb-2">世界一、</div>
                <div>冷たい会社。</div>
              </div>
            </div>
          </div>

          <!-- TODO: 桌面版按鈕，目前為 MAYEKAWA 招募相關（募集要項、27卒エントリー/インターンシップ） -->
          <!-- 建議改為 PetPetNi 的主要 CTA，如「瀏覽寵物」、「立即配對」等 -->
          <div class="flex flex-col gap-4">
            <button
              class="group flex min-w-[280px] items-center justify-between rounded-full bg-white px-8 py-4 font-bold text-[#D70035] transition-colors hover:bg-gray-100"
            >
              <span>募集要項</span>
              <span class="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button
              class="group flex min-w-[280px] items-center justify-between rounded-full bg-white px-8 py-4 font-bold text-[#D70035] transition-colors hover:bg-gray-100"
            >
              <span class="tracking-widest">ENTRY</span>
              <span class="text-xs font-normal text-gray-400">27卒エントリー/インターンシップ</span>
              <span class="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

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

        <div class="pointer-events-auto absolute right-6 bottom-6 flex gap-4">
          <a
            href="#"
            class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
          >
            <img src="@/assets/icons/icon-social-instagram.svg" class="h-full w-full" />
          </a>
          <a
            href="#"
            class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
          >
            <img src="@/assets/icons/icon-social-tiktok.svg" class="h-full w-full" />
          </a>
          <a
            href="#"
            class="flex h-8 w-8 items-center justify-center text-white opacity-80 hover:opacity-100"
          >
            <img src="@/assets/icons/icon-social-youtube.svg" class="h-full w-full" />
          </a>

          <div class="ml-4 flex items-center gap-4 text-[10px] text-white">
            <a href="#" class="hover:underline">採用活動におけるプライバシーポリシー ↗</a>
            <a href="#" class="hover:underline">CORPORATE SITE ↗</a>
          </div>
        </div>

        <div class="absolute bottom-6 left-6 text-[10px] text-white opacity-60">
          © MAYEKAWA MFG. CO., LTD.
        </div>
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
