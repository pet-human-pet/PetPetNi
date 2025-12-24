<script setup>
  import { useUIStore } from '../../stores/ui'
  import NavIcon from './NavIcon.vue'
  import BackgroundGrid from './BackgroundGrid.vue'

  // 動態控制body滾動鎖定
  import {watch, onUnmounted} from 'vue';

  const props = defineProps({
  open: Boolean
})
  watch(
  () => props.open,
  (isOpen) => {
    document.body.classList.toggle('u-lock-scroll', isOpen)
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.classList.remove('u-lock-scroll')
})

const uiStore = useUIStore()

const menuItems = [
  { en: 'chat-test', jp: 'マエカワについて', icon: 'icon-about.svg', path: '/chat-test' }, // Factory
  { en: 'Event', jp: '社員インタビュー', icon: 'icon-interview.svg', path: '/event' }, // Walking man
  { en: 'Social', jp: '想いと歩み', icon: 'icon-philosophy.svg', path: '/social' }, // Bust
  { en: 'Profile', jp: 'キャリア形成', icon: 'icon-career.svg', path: '/profile' } // Helmet
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
      <BackgroundGrid class="pointer-events-none fixed inset-0 opacity-[0.2]" />

      <div
        class="pointer-events-none relative flex min-h-screen flex-col px-6 pt-24 pb-10 md:hidden"
      >
        <div class="pointer-events-auto mb-8 flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <router-link to="/" @click="uiStore.closeMenu()">
              <img src="@/assets/images/logo-white.svg" class="h-6 opacity-90" alt="Mayekawa" />
            </router-link>

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
            :label-jp="item.jp"
            :icon-name="item.icon"
            :to="item.path"
            @click="uiStore.closeMenu()"
            class="w-full"
            variant="list"
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
            :label-jp="item.jp"
            :icon-name="item.icon"
            :to="item.path"
            @click="uiStore.closeMenu()"
            class="w-full"
            variant="grid"
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
