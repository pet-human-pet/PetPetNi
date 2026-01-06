<script setup>
import NavIcon from '../components/Share/NavIcon.vue'
import BackgroundGrid from '../components/Share/BackgroundGrid.vue'
import MainFrame from '../components/Share/MainFrame.vue'

// Grid Configuration: Mobile (2x3 Corners) / Desktop (3x3 Corners)
const items = [
  {
    labelEn: 'ACTIVITY',
    labelZh: '活動',
    iconName: 'icon-about.svg',
    gridClass: 'col-start-1 row-start-1',
    animationDelay: '0.7s',
    animationDuration: '3.2s'
  },
  {
    labelEn: 'DATING',
    labelZh: '交友',
    iconName: 'icon-job.svg',
    gridClass: 'col-start-2 row-start-1 md:col-start-3 md:row-start-1',
    animationDelay: '1.4s',
    animationDuration: '2.8s'
  },
  {
    labelEn: 'CHAT',
    labelZh: '聊天',
    iconName: 'icon-bases.svg',
    gridClass: 'col-start-1 row-start-3 md:col-start-1 md:row-start-3',
    animationDelay: '0.2s',
    animationDuration: '3.5s'
  },
  {
    labelEn: 'SOCIAL',
    labelZh: '社群',
    iconName: 'icon-interview.svg',
    gridClass: 'col-start-2 row-start-3 md:col-start-3 md:row-start-3',
    animationDelay: '2.1s',
    animationDuration: '3.0s'
  }
]
</script>

<template>
  <MainFrame>
    <template #background>
      <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden invert">
        <BackgroundGrid class="h-full w-full" />
      </div>
    </template>

    <div class="pointer-events-none relative flex h-full items-center justify-center">
      <div
        class="relative flex aspect-[4/3] h-auto max-h-full w-auto max-w-full items-center justify-center"
      >
        <div class="absolute inset-0 flex h-full w-full items-center justify-center">
          <img
            src="@/assets/images/decoration-tower.svg"
            class="z-0 h-[80%] w-[80%] object-contain"
            alt="Tower Base"
          />
          <img
            src="@/assets/images/text-slogan.svg"
            class="absolute bottom-[2%] left-1/2 z-20 w-[60%] -translate-x-1/2 md:bottom-[5%] md:w-[50%]"
            alt="Catchphrase"
          />
        </div>

        <div
          class="pointer-events-auto absolute top-[40%] left-1/2 z-40 -translate-x-1/2 cursor-pointer transition-transform hover:scale-105"
        ></div>
      </div>

      <div
        class="pointer-events-none absolute inset-0 z-30 grid grid-cols-2 grid-rows-3 gap-2 p-[4%] md:grid-cols-3 md:grid-rows-3 md:gap-4"
      >
        <div
          v-for="item in items"
          :key="item.labelEn"
          :class="[item.gridClass, 'pointer-events-auto flex flex-col items-center justify-center']"
        >
          <NavIcon
            v-bind="item"
            :animation-delay="item.animationDelay"
            :animation-duration="item.animationDuration"
          />
        </div>
      </div>
    </div>
  </MainFrame>
</template>
