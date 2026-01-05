<script setup>
import { getStatusBadge } from '@/utils/statusHelper'

const props = defineProps({
  items: { type: Array, required: true },
  selectedId: { type: [Number, String, null], default: null }
})
const emit = defineEmits(['select', 'open-form'])
</script>

<template>
  <section
    class="no-scrollbar pointer-events-auto flex flex-row gap-3 overflow-x-auto pb-1.25 md:flex-col md:gap-3.75 md:overflow-visible md:pb-0"
  >
    <div
      class="border-brand-primary bg-bg-surface shadow-card flex h-40 w-60 flex-none snap-center flex-col items-center justify-center rounded-2xl border-2 border-dashed p-0 transition-all md:h-auto md:w-full md:flex-initial md:flex-row md:items-stretch md:justify-start md:rounded-xl md:p-4 md:shadow-none"
    >
      <button
        class="text-brand-primary flex h-full w-full flex-col items-center justify-center gap-2 bg-transparent py-2 text-[14px] font-bold md:h-auto md:flex-row md:text-[16px]"
        type="button"
        @click="emit('open-form')"
      >
        <i class="fa-solid fa-shop text-[28px] md:text-base"></i>
        <span>發起新團購</span>
      </button>
    </div>

    <ul class="m-0 flex list-none flex-col gap-3.75 p-0 max-md:flex-row max-md:gap-3">
      <li
        v-for="gb in props.items"
        :key="gb.id"
        class="c-card-item"
        :class="{ 'c-card-item--active': props.selectedId === gb.id }"
        @click="emit('select', gb)"
      >
        <div class="p-3 md:p-3.75">
          <div class="mb-1 flex items-start justify-between gap-2">
            <div class="text-fg-primary line-clamp-1 min-w-0 text-[16px] leading-snug font-bold">
              {{ gb.title }}
            </div>

            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="getStatusBadge(gb.status || 'ongoing').cls"
            >
              {{ getStatusBadge(gb.status || 'ongoing').text }}
            </span>
          </div>

          <div class="text-brand-primary text-[13px] font-bold">$ {{ gb.price }} / 份</div>
        </div>
      </li>
    </ul>
  </section>
</template>
