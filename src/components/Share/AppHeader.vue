<script setup>
import { useUIStore } from '../../stores/ui'

const uiStore = useUIStore()
</script>

<template>
  <header
    class="pointer-events-none fixed top-0 left-0 z-100 flex w-full items-start justify-between px-9 pt-[30px] pb-6 md:px-14 md:pt-[40px]"
  >
    <!-- Logo Area (Pointer events auto to click) -->
    <div
      class="pointer-events-auto shrink-0 transition-opacity duration-300"
      :class="{ 'pointer-events-none opacity-0': uiStore.isMenuOpen }"
    >
      <router-link to="/" class="block text-xl leading-none font-bold tracking-widest">
        <span
          class="mb-1 block text-[10px] opacity-80 md:text-xs"
          :class="{
            'text-black': !uiStore.isMenuOpen,
            'text-white': uiStore.isMenuOpen
          }"
          >技術と熱で世界を変える</span
        >

        <!-- Logo Swap: Show specific SVG based on menu state -->
        <div class="relative h-6 w-32 md:h-10 md:w-48">
          <Transition name="fade" mode="out-in">
            <!-- Menu Open: White Logo -->
            <img
              v-if="uiStore.isMenuOpen"
              src="@/assets/images/logo-white.svg"
              class="h-5 md:h-[22px]"
              alt="Mayekawa"
            />
            <img
              v-else
              src="@/assets/images/logo-black.svg"
              class="h-5 md:h-[22px]"
              alt="Mayekawa"
            />
          </Transition>
        </div>
      </router-link>
    </div>

    <!-- Menu Button -->
    <div class="pointer-events-auto mr-0 flex shrink-0 items-center gap-2 md:mr-6 md:gap-4">
      <!-- Recruitment Button -->
      <a
        v-if="$route.path !== '/login'"
        href="#"
        class="hidden items-center justify-center rounded-full bg-[#333333] px-5 py-3 text-[11px] font-bold tracking-wider text-white transition-colors duration-300 hover:bg-black md:flex"
        :class="{ 'pointer-events-none opacity-0': uiStore.isMenuOpen }"
      >
        募集要項
      </a>

      <!-- Entry Button -->
      <a
        v-if="$route.name !== 'login'"
        href="#"
        class="bg-mayekawa flex items-center justify-center rounded-full px-8 py-3 text-[11px] font-bold tracking-widest text-white shadow-lg transition-opacity duration-300 hover:opacity-80"
        :class="{ 'pointer-events-none opacity-0': uiStore.isMenuOpen }"
      >
        ENTRY
      </a>

      <!-- Login Button -->
      <router-link
        v-if="$route.name !== 'login'"
        to="/login"
        class="flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-[11px] font-bold tracking-wider text-black transition-colors duration-300 hover:bg-gray-200"
        :class="{ 'pointer-events-none opacity-0': uiStore.isMenuOpen }"
      >
        LOGIN
      </router-link>
    </div>

    <button
      class="group pointer-events-auto relative flex h-12 w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 md:h-16 md:w-16"
      @click="uiStore.toggleMenu()"
    >
      <div
        class="bg-mayekawa absolute inset-0 origin-center scale-0 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-100"
      ></div>

      <!-- Menu Text -->
      <span
        class="text-mayekawa group-hover:text-mayekawa mb-0.5 text-[8px] font-bold transition-colors md:mb-1 md:text-[10px]"
        >MENU</span
      >

      <!-- Hamburger Icon -->
      <div
        class="relative flex h-3 w-5 flex-col items-center justify-between transition-all duration-300 md:h-4 md:w-6"
        :class="{ 'rotate-180': uiStore.isMenuOpen }"
      >
        <span
          class="bg-mayekawa h-0.5 w-full rounded-full transition-all duration-300"
          :class="{
            'translate-y-[5px] rotate-45 md:translate-y-[7px]': uiStore.isMenuOpen,
            'bg-mayekawa': uiStore.isMenuOpen
          }"
        ></span>
        <span
          class="bg-mayekawa h-0.5 w-full rounded-full transition-all duration-300"
          :class="{ 'opacity-0': uiStore.isMenuOpen }"
        ></span>
        <span
          class="bg-mayekawa h-0.5 w-full rounded-full transition-all duration-300"
          :class="{
            '-translate-y-[5px] -rotate-45 md:-translate-y-[7px]': uiStore.isMenuOpen,
            'bg-mayekawa': uiStore.isMenuOpen
          }"
        ></span>
      </div>
    </button>
  </header>
</template>
