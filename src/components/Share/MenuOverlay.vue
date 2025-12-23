<script setup>
import { useUIStore } from '../../stores/ui'
import NavIcon from './NavIcon.vue'
import BackgroundGrid from './BackgroundGrid.vue'

const uiStore = useUIStore()

const menuItems = [
  { en: 'ABOUT US', jp: 'マエカワについて', icon: 'icon-about.svg' }, // Factory
  { en: 'INTERVIEW', jp: '社員インタビュー', icon: 'icon-interview.svg' }, // Walking man
  { en: 'PHILOSOPHY', jp: '想いと歩み', icon: 'icon-philosophy.svg' }, // Bust
  { en: 'CAREER', jp: 'キャリア形成', icon: 'icon-career.svg' }, // Helmet
  { en: 'JOB', jp: 'マエカワの仕事', icon: 'icon-job.svg' }, // Toolbox
  { en: 'WELFARE', jp: '働き方と福利厚生', icon: 'icon-welfare.svg' } // Heart Hands
].slice(0, 4) // Limit to 4 items for no-scroll strict policy

const getIconUrl = (name) => {
  return new URL(`../../assets/icons/${name}`, import.meta.url).href
}
</script>

<template>
  <Transition name="menu-fade">
    <div
      v-if="uiStore.isMenuOpen"
      class="bg-mayekawa fixed inset-0 z-40 cursor-pointer overflow-hidden"
      @click.self="uiStore.closeMenu()"
    >
      <!-- Background Pattern (Shared) -->
      <BackgroundGrid class="pointer-events-none fixed inset-0 opacity-[0.2]" />

      <!-- === Mobile Layout (md:hidden) === -->
      <div
        class="pointer-events-none relative flex min-h-screen flex-col px-6 pt-24 pb-10 md:hidden"
      >
        <!-- Mobile Header (Logo + CTA Buttons) -->
        <!-- pointer-events-auto -->
        <div class="pointer-events-auto mb-8 flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <!-- Logo -->
            <router-link to="/" @click="uiStore.closeMenu()">
              <img src="@/assets/images/logo-white.svg" class="h-6 opacity-90" alt="Mayekawa" />
            </router-link>

            <!-- Mobile CTA Buttons (Small) -->
            <div class="mr-12 flex gap-2">
              <!-- mr-12 to leave space for the Close Button which is fixed in AppHeader -->
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

        <!-- Vertical Text (Mobile Right Side) -->
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

        <!-- Content List (On top of vertical text) -->
        <div class="pointer-events-auto z-10 flex flex-1 flex-col gap-0 pr-10">
          <NavIcon
            v-for="item in menuItems"
            :key="item.en"
            :label-en="item.en"
            :label-jp="item.jp"
            :icon-name="item.icon"
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

        <!-- Mobile Footer -->
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

      <!-- === Desktop Layout (hidden md:flex) === -->
      <div
        class="pointer-events-none relative hidden min-h-screen flex-row items-center justify-center px-12 pt-24 pb-10 md:flex"
      >
        <!-- Left Side: Title & Buttons -->
        <!-- pointer-events-auto for interactions -->
        <div class="pointer-events-auto flex w-5/12 flex-col items-start justify-center space-y-12">
          <!-- Title Section -->
          <div class="flex flex-col text-white">
            <!-- Vertical Text + Main Title -->
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

          <!-- CTA Buttons -->
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

        <!-- Right Side: Navigation Grid -->
        <div class="pointer-events-auto grid w-7/12 grid-cols-2 gap-12 pl-12">
          <NavIcon
            v-for="item in menuItems"
            :key="item.en"
            :label-en="item.en"
            :label-jp="item.jp"
            :icon-name="item.icon"
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

        <!-- Footer Links (Bottom Right Absolute) -->
        <div class="pointer-events-auto absolute right-6 bottom-6 flex gap-4">
          <!-- Social Icons -->
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

        <!-- Copright Bottom Left -->
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
