<script setup>
import { useRouter } from 'vue-router'
import { useAIStore } from '@/stores/ai'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import MainFrame from '@/components/Share/MainFrame.vue'

const router = useRouter()
const aiStore = useAIStore()

const handleNavigate = (name) => {
  router.push({ name })
}

const handleOpenAi = () => {
  if (!aiStore.isDrawerOpen) {
    aiStore.toggleDrawer()
  } else {
    aiStore.closeDrawer()
  }
}

// Grid Configuration: 3 columns x 6 rows (all sizes)
// 每個角落區域佔 3 行，文字用 absolute 定位在圖片上
const items = [
  {
    labelEn: 'EVENTS',
    labelZh: '活動',
    iconName: '活動區.webp',
    routeName: 'Event',
    gridClass: 'col-start-1 row-start-1 row-span-3',
    textPosition:
      'bottom-[22%] right-[10%] md:bottom-[-5%] md:right-[8%] lg:bottom-[-15%] lg:right-[5%]', // 三斷點響應式
    textRotate: '-rotate-[30deg]',
    animationDelay: '0.7s',
    animationDuration: '3.2s'
  },
  {
    labelEn: 'MATCH',
    labelZh: '配對',
    iconName: '交友區.webp',
    routeName: 'match',
    gridClass: 'col-start-3 row-start-1 row-span-3',
    textPosition:
      'bottom-[22%] left-[25%] md:bottom-[-5%] md:left-[20%] lg:bottom-[-15%] lg:left-[15%]',
    textRotate: 'rotate-[25deg]',
    animationDelay: '1.4s',
    animationDuration: '2.8s'
  },
  {
    labelEn: 'CHAT',
    labelZh: '聊天',
    iconName: '聊天區.webp',
    routeName: 'chat',
    gridClass: 'col-start-1 row-start-4 row-span-3',
    textPosition:
      'bottom-[22%] right-[25%] md:bottom-0 md:right-[20%] lg:bottom-[-10%] lg:right-[15%]',
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
    textPosition:
      'bottom-[22%] left-[25%] md:bottom-0 md:left-[20%] lg:bottom-[-10%] lg:left-[15%]',
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
          <button
            type="button"
            class="group pointer-events-auto relative h-64 min-h-64 w-64 min-w-64 cursor-pointer overflow-visible bg-contain bg-center bg-no-repeat transition-transform hover:scale-[1.03] active:scale-[0.98] md:h-[120%] md:min-h-0 md:w-[120%] md:min-w-0"
            :style="`background-image: url(${getIconUrl('中央區.webp')})`"
            aria-label="開啟 AI 功能"
            @click="handleOpenAi"
          >
            <div
              class="pointer-events-none absolute top-40 left-1/2 z-20 -translate-x-1/2 -translate-y-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <div
                class="border-brand-tertiary text-fg-muted relative max-w-60 rounded-2xl border-2 bg-white px-4 py-2 text-center text-xs leading-snug font-semibold shadow-lg md:text-sm"
              >
                有寵物相關問題嗎？<br />
                讓 <span class="text-brand-primary text-sm">波波</span> 來為你解答吧！🔮
                <span
                  class="border-brand-tertiary absolute top-full left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r-2 border-b-2 bg-white"
                ></span>
              </div>
            </div>
          </button>
        </div>

        <!-- 四個角落區域 -->
        <template v-for="item in items" :key="item.labelEn">
          <div
            :class="[item.gridClass, 'group pointer-events-auto relative cursor-pointer']"
            @click="handleNavigate(item.routeName)"
          >
            <!-- 圖片佔滿整個區域 -->
            <div
              class="jump-object absolute inset-0 scale-125 bg-contain bg-center bg-no-repeat transition-transform hover:scale-105 md:scale-110 lg:scale-100"
              :style="{
                backgroundImage: `url(${getIconUrl(item.iconName)})`,
                animationDelay: item.animationDelay,
                animationDuration: item.animationDuration
              }"
            ></div>

            <div
              class="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <div
                class="border-brand-tertiary text-fg-muted relative rounded-2xl border-2 bg-white px-3 py-1.5 text-center text-xs font-semibold shadow-lg md:text-sm"
              >
                前往 <span class="text-sm text-brand-primary">{{ item.labelZh }}</span> 🐾
                <span
                  class="border-brand-tertiary absolute top-full left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r-2 border-b-2 bg-white"
                ></span>
              </div>
            </div>

            <!-- 文字（傾斜，桌機版距離更遠） -->
            <div :class="['absolute z-10 flex flex-col', item.textPosition, item.textRotate]">
              <h3
                class="text-fg-muted font-sans text-xs font-bold tracking-widest uppercase opacity-90 drop-shadow-md md:text-sm lg:text-lg"
              >
                {{ item.labelEn }}
              </h3>
              <h2
                class="text-fg-muted text-sm leading-tight font-bold tracking-wide drop-shadow-md md:text-base lg:text-xl"
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
