<script setup>
import { getStatusBadge } from '@/utils/statusHelper'

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  locationName: {
    type: String,
    default: '未知地點'
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  showLeave: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'delete', 'leave'])
</script>

<template>
  <div
    class="border-brand-secondary/50 bg-bg-surface hover:bg-brand-tertiary/10 flex cursor-pointer items-center justify-between gap-3 rounded-3xl border-3 p-4 transition-all md:p-6"
  >
    <div class="flex-1 text-left" @click="emit('click', event)">
      <h4 class="text-fg-secondary text-base font-bold md:text-lg">{{ event.title }}</h4>
      <p class="text-fg-muted text-md md:text-sm">
        {{ locationName }}
      </p>
      <p class="text-fg-muted mt-1 text-xs">
        <i class="fa-solid fa-users mr-1"></i>
        {{ event.participantsCount || 0 }}/{{ event.capacity }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <span
        class="rounded-full px-2 py-1 text-sm font-bold"
        :class="getStatusBadge(event.status).cls"
      >
        {{ getStatusBadge(event.status).text }}
      </span>

      <!-- 刪除按鈕 -->
      <button
        v-if="showDelete"
        type="button"
        class="text-func-danger hover:bg-func-danger/10 flex h-9 w-9 items-center justify-center rounded-full transition-all md:h-10 md:w-10"
        title="刪除活動"
        @click.stop="emit('delete', event)"
      >
        <i class="fa-solid fa-trash text-sm"></i>
      </button>

      <!-- 取消報名按鈕 -->
      <button
        v-if="showLeave"
        type="button"
        class="text-fg-muted text-md flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all"
        title="取消報名"
        @click.stop="emit('leave', event)"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>
  </div>
</template>
