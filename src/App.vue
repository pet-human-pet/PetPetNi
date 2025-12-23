<script setup>
import { RouterView } from "vue-router";
import AppHeader from "./components/Share/AppHeader.vue";
import AppFooter from "./components/Share/AppFooter.vue";
import MenuOverlay from "./components/Share/MenuOverlay.vue";
import { onMounted } from 'vue';
import Header from '@/components/Share/Header.vue';
import EventView from './views/EventView.vue';


onMounted(() => {
  const ensureLink = (id, href) => {
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }

  ensureLink('fa-cdn', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css')
  ensureLink('fredoka-font', 'https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap')
})
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
  

  <Header />
   header desktop 70 / mobile 60 
  <div class="pt-17.5 max-[800px]:pt-15">
  <EventView/>
  </div>

</template>
