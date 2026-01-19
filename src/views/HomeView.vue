<script setup>
import { useRouter } from 'vue-router'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import MainFrame from '@/components/Share/MainFrame.vue'

const router = useRouter()

const handleNavigate = (name) => {
  router.push({ name })
}

// Grid Configuration: 3 columns x 6 rows (all sizes)
// 每個角落區域佔 3 行，文字用 absolute 定位在圖片上
const items = [
  {
    labelEn: 'ACTIVITY',
    labelZh: '活動',
    iconName: '活動區.webp',
    routeName: 'Event',
    gridClass: 'col-start-1 row-start-1 row-span-3',
    textPosition: 'bottom-[-5%] right-[10%]',
    textRotate: '-rotate-[30deg]',
    animationDelay: '0.7s',
    animationDuration: '3.2s'
  },
  {
    labelEn: 'DATING',
    labelZh: '交友',
    iconName: '交友區.webp',
    routeName: 'match',
    gridClass: 'col-start-3 row-start-1 row-span-3',
    textPosition: 'bottom-[-5%] left-[25%]',
    textRotate: 'rotate-[25deg]',
    animationDelay: '1.4s',
    animationDuration: '2.8s'
  },
  {
    labelEn: 'CHAT',
    labelZh: '聊天',
    iconName: '聊天區.webp',
    routeName: 'chat-test',
    gridClass: 'col-start-1 row-start-4 row-span-3',
    textPosition: 'bottom-0 right-[25%]',
    textRotate: '-rotate-[30deg]',
    animationDelay: '0.2s',
    animationDuration: '3.5s'
  },
  {
    labelEn: 'SOCIAL',
    labelZh: '社群',
    iconName: '社交區.webp',
    routeName: 'Social',
    gridClass: 'col-start-3 row-start-4 row-span-3',
    textPosition: 'bottom-0 left-[25%]',
    textRotate: 'rotate-[30deg]',
    animationDelay: '2.1s',
    animationDuration: '3.0s'
  }
]

const getIconUrl = (name) => {
  return new URL(`../assets/icons/${name}`, import.meta.url).href
}
</script>

<template>
  <MainFrame>
    <template #background>
      <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden invert">
        <BackgroundGrid class="h-full w-full" />
      </div>
    </template>

    <div class="pointer-events-none relative flex h-full items-center justify-center">
      <div class="pointer-events-none absolute inset-0 z-30 grid grid-cols-3 grid-rows-6 p-[4%]">
        <!-- 中央區圖片 (佔第 2 列，全部 6 行) - 放大且不裁切 -->
        <div class="col-start-2 row-span-6 row-start-1 flex items-center justify-center">
          <div
            class="h-[120%] w-[120%] bg-contain bg-center bg-no-repeat"
            :style="`background-image: url(${getIconUrl('中央區.webp')})`"
          ></div>
        </div>

        <!-- 四個角落區域 -->
        <template v-for="item in items" :key="item.labelEn">
          <div
            :class="[item.gridClass, 'pointer-events-auto relative cursor-pointer']"
            @click="handleNavigate(item.routeName)"
          >
            <div
              class="jump-object absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform hover:scale-105"
              :style="{
                backgroundImage: `url(${getIconUrl(item.iconName)})`,
                animationDelay: item.animationDelay,
                animationDuration: item.animationDuration
              }"
            ></div>

            <!-- 文字 (傾斜) -->
            <div :class="['absolute z-10 flex flex-col', item.textPosition, item.textRotate]">
              <h3
                class="text-bg-surface font-sans text-base font-bold tracking-widest uppercase opacity-90 drop-shadow-md"
              >
                {{ item.labelEn }}
              </h3>
              <h2
                class="text-bg-surface text-base leading-tight font-bold tracking-wide drop-shadow-md"
              >
                {{ item.labelZh }}
              </h2>
            </div>
          </div>
        </template>
      </div>
    </div>
  </MainFrame>
</template>

<style scoped>
.jump-object {
  animation: jump 3s ease-in-out infinite;
}

.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

@keyframes jump {
  0%,
  86.67%,
  100% {
    transform: translate(0, 0);
  }
  6.67% {
    transform: translate(0, -20%);
  }
  13.33% {
    transform: translate(0, 0);
  }
}
</style>
