<script setup>
import { RouterView } from "vue-router";
import AppHeader from "./components/Share/AppHeader.vue";
import AppFooter from "./components/Share/AppFooter.vue";
import MenuOverlay from "./components/Share/MenuOverlay.vue";
</script>

<template>
  <div class="relative w-full h-full">
    <MenuOverlay />

    <AppHeader />

    <main class="w-full h-full">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
