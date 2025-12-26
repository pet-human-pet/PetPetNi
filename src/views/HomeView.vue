<script setup>
import NavIcon from '../components/Share/NavIcon.vue'
import BackgroundGrid from '../components/Share/BackgroundGrid.vue'
import MainFrame from '../components/Share/MainFrame.vue'

// Items position configuration (Responsive Grid)
// Desktop: 3x3 Ring. Mobile: 2x4 Columns.
const items = [
  // --- Row 1 (Mobile & Desktop start) ---
  {
    labelEn: 'ABOUT US',
    labelJp: 'マエカワについて',
    iconName: 'icon-about.svg',
    gridClass: 'col-start-1 row-start-1',
    flexClass: 'items-start justify-start'
  },
  {
    labelEn: 'JOB',
    labelJp: 'マエカワの仕事',
    iconName: 'icon-job.svg',
    gridClass: 'col-start-2 row-start-1', // Mobile: R1 C2
    flexClass: 'items-end justify-start md:items-center md:-translate-y-4' // Mobile: End, Desktop: Center
  },

  // --- Row 2 (Mobile) / Mixed (Desktop) ---
  {
    labelEn: 'PHILOSOPHY',
    labelJp: '想いと歩み',
    iconName: 'icon-philosophy.svg',
    gridClass: 'col-start-1 row-start-2 md:col-start-1 md:row-start-2',
    flexClass: 'items-start justify-center'
  },
  {
    labelEn: 'WELFARE',
    labelJp: '働き方と福利厚生',
    iconName: 'icon-welfare.svg',
    gridClass: 'col-start-2 row-start-2 md:col-start-3 md:row-start-1', // Mobile: R2 C2, Desktop: R1 C3
    flexClass: 'items-end justify-start'
  },

  // --- Row 3 (Mobile) / Mixed (Desktop) ---
  {
    labelEn: 'BASES',
    labelJp: '拠点地域一覧',
    iconName: 'icon-bases.svg',
    gridClass: 'col-start-1 row-start-3 md:col-start-1 md:row-start-3',
    flexClass: 'items-start justify-end'
  },
  {
    labelEn: 'INTERVIEW',
    labelJp: '社員インタビュー',
    iconName: 'icon-interview.svg',
    gridClass: 'col-start-2 row-start-3 md:col-start-3 md:row-start-2', // Mobile: R3 C2, Desktop: R2 C3
    flexClass: 'items-end justify-center'
  },

  // --- Row 4 (Mobile) / Row 3 (Desktop) ---
  {
    labelEn: 'CAREER',
    labelJp: 'キャリア形成',
    iconName: 'icon-career.svg',
    gridClass: 'col-start-1 row-start-4 md:col-start-2 md:row-start-3', // Mobile: R4 C1, Desktop: R3 C2
    flexClass: 'items-start justify-end md:items-center md:translate-y-4' // Mobile: Start, Desktop: Center
  },
  {
    labelEn: 'DE&I',
    labelJp: 'ダイバーシティ、\nエクイティ&\nインクルージョン',
    iconName: 'icon-dei.svg',
    gridClass: 'col-start-2 row-start-4 md:col-start-3 md:row-start-3', // Mobile: R4 C2, Desktop: R3 C3
    flexClass: 'items-end justify-end'
  }
]
</script>

<template>
  <MainFrame>
    <!-- Background Pattern -->
    <template #background>
      <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden invert">
        <BackgroundGrid class="h-full w-full" />
      </div>
    </template>

    <!-- Main Content (Centered) -->
    <div class="pointer-events-none relative flex h-full w-full items-center justify-center">
      <!-- Visual Container -->
      <div
        class="`aspect-4/3` relative flex h-auto max-h-full w-auto max-w-full items-center justify-center"
      >
        <!-- Central Background Illustration -->
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

        <!-- Central CTA if needed -->
        <div
          class="pointer-events-auto absolute top-[40%] left-1/2 z-40 -translate-x-1/2 cursor-pointer transition-transform hover:scale-105"
        >
          <!-- Placeholder -->
        </div>
      </div>

      <!-- Navigation Icons Grid Layer (Responsive 2x4 -> 3x3) -->
      <div
        class="pointer-events-none absolute inset-0 z-30 grid grid-cols-2 grid-rows-4 gap-2 p-[4%] md:grid-cols-3 md:grid-rows-3 md:gap-4"
      >
        <div
          v-for="item in items"
          :key="item.labelEn"
          :class="[item.gridClass, item.flexClass, 'pointer-events-auto flex flex-col']"
        >
          <NavIcon v-bind="item" />
        </div>
      </div>
    </div>
  </MainFrame>
</template>
