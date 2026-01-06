<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/Share/AppHeader.vue'
import MainHeader from './components/Share/Header.vue'
import AppFooter from './components/Share/AppFooter.vue'
import MenuOverlay from './components/Share/MenuOverlay.vue'
import ConfirmDialog from './components/Share/ConfirmDialog.vue'
import ReportDialog from './components/Share/ReportDialog.vue'
import SimpleToast from './components/Share/SimpleToast.vue'

const route = useRoute()
const showFooter = computed(() => !route.meta.hideFooter)
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col">
    <SimpleToast />
    <ConfirmDialog />
    <ReportDialog />
    <MenuOverlay />
    <AppHeader v-if="route.meta.headerType === 'landing'" />

    <!-- Main App Header (Event, Social, Profile, Home) -->
    <!-- Home 頁面的 Header z-index 需設為 15，在 Marquee (z-20/30) 下方但在內容 (z-10) 上方 -->
    <MainHeader
      v-if="route.meta.headerType === 'app'"
      :transparent="route.meta.transparentHeader"
    />

    <main class="w-full flex-1">
      <RouterView />
    </main>

    <AppFooter v-if="showFooter" />
    <SimpleToast />
  </div>
</template>
