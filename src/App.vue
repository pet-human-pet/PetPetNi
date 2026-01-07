<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/Share/AppHeader.vue'
import MainHeader from './components/Share/Header.vue'
import AppFooter from './components/Share/AppFooter.vue'
import MenuOverlay from './components/Share/MenuOverlay.vue'

const route = useRoute()

// 2. 計算是否顯示 Footer
// 如果 meta.hideFooter 為 true，則不顯示
const showFooter = computed(() => !route.meta.hideFooter)
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col">
    <MenuOverlay />
    <AppHeader v-if="route.meta.headerType === 'landing'" />
    <MainHeader v-if="route.meta.headerType === 'app'" />

    <main class="w-full flex-1">
      <RouterView />
    </main>

    <AppFooter v-if="showFooter" />
  </div>
</template>
