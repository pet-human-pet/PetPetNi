<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainHeader from './components/Share/Header.vue'
import AppFooter from './components/Share/AppFooter.vue'
import MenuOverlay from './components/Share/MenuOverlay.vue'
import ConfirmDialog from './components/Share/ConfirmDialog.vue'
import ReportDialog from './components/Share/ReportDialog.vue'
import SimpleToast from './components/Share/SimpleToast.vue'

const route = useRoute()

// 計算是否顯示 Header
const showHeader = computed(() => !route.meta.hideHeader)
// 計算是否顯示 Footer
const showFooter = computed(() => !route.meta.hideFooter)
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col">
    <SimpleToast />
    <ConfirmDialog />
    <ReportDialog />
    <MenuOverlay />

    <!-- Main App Header -->
    <MainHeader v-if="showHeader" :transparent="route.meta.transparentHeaderBg" />

    <main class="w-full flex-1">
      <RouterView />
    </main>

    <AppFooter v-if="showFooter" />
    <SimpleToast />
  </div>
</template>
