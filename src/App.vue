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

// 判斷是否為首頁
const isHomePage = computed(() => route.name === 'home')
// 計算是否顯示 Header
const showHeader = computed(() => !route.meta.hideHeader)
// 計算是否顯示 Footer
const showFooter = computed(() => !route.meta.hideFooter)
// 非首頁時 main 需要 padding-top 來避免被 fixed header 蓋住
const mainClasses = computed(() => [
  'w-full flex-1',
  !isHomePage.value && showHeader.value ? 'pt-(--header-h)' : ''
])
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col">
    <SimpleToast />
    <ConfirmDialog />
    <ReportDialog />
    <MenuOverlay />

    <!-- Main App Header -->
    <MainHeader v-if="showHeader" :transparent="route.meta.transparentHeaderBg" />

    <main :class="mainClasses">
      <RouterView />
    </main>

    <AppFooter v-if="showFooter" />
  </div>
</template>
