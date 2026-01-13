<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
<<<<<<< HEAD
=======
import { useSocket } from '@/composables/useSocket'
import AppHeader from './components/Share/AppHeader.vue'
>>>>>>> 37037f5 (feat:新增socket.io功能，目前是使用假資料)
import MainHeader from './components/Share/Header.vue'
import AppFooter from './components/Share/AppFooter.vue'
import MenuOverlay from './components/Share/MenuOverlay.vue'
import ConfirmDialog from './components/Share/ConfirmDialog.vue'
import ReportDialog from './components/Share/ReportDialog.vue'
import SimpleToast from './components/Share/SimpleToast.vue'

const route = useRoute()
<<<<<<< HEAD

// 計算是否顯示 Header
const showHeader = computed(() => !route.meta.hideHeader)
// 計算是否顯示 Footer
=======
const { initSocket } = useSocket()

onMounted(() => {
  initSocket()
})

// 計算是否顯示 Footer
// 如果 meta.hideFooter 為 true，則不顯示
>>>>>>> 37037f5 (feat:新增socket.io功能，目前是使用假資料)
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
  </div>
</template>
