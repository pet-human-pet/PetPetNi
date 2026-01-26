<script setup>
import { computed } from 'vue'

// 定義 Props
const props = defineProps({
  event: { type: Object, default: null }
})

// 定義 Emits
const emit = defineEmits(['back'])

// 計算屬性：格式化地點
const locations = {
  1: '台北 101 大樓',
  2: '國父紀念館',
  3: '松山菸廠',
  4: '象山公園',
  5: '台北市政府廣場'
}

const locationLabel = computed(() => {
  return locations[props.event?.locId] || '未知地點'
})
</script>

<template>
  <div class="bg-bg-base h-full w-full overflow-y-auto p-4">
    <!-- 上方標題列 + 返回地圖 -->
    <div class="mb-4 flex items-center gap-2">
      <button
        type="button"
        class="text-fg-secondary hover:text-brand-accent flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-white hover:shadow-sm"
        aria-label="返回地圖"
        @click="emit('back')"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="min-w-0">
        <div class="text-fg-primary truncate text-[16px] font-bold">活動詳情</div>
        <div class="text-fg-muted text-[12px]">選擇左側活動可切換查看其他活動資訊</div>
      </div>
    </div>

    <!-- 活動詳細資訊 -->
    <div v-if="props.event" class="flex flex-col gap-4">
      <!-- 活動名稱卡片 -->
      <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4">
        <div class="text-fg-muted mb-1 text-[12px] font-bold">活動名稱</div>
        <div class="text-fg-primary text-[18px] font-bold">{{ props.event.title }}</div>
      </div>

      <!-- 地點與人數 -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4">
          <div class="text-fg-muted mb-1 text-[12px] font-bold">活動地點</div>
          <div class="text-fg-primary flex items-center gap-2 text-[16px]">
            <i class="fa-solid fa-location-dot text-brand-primary"></i>
            {{ locationLabel }}
          </div>
        </div>

        <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4">
          <div class="text-fg-muted mb-1 text-[12px] font-bold">人數上限</div>
          <div class="text-fg-primary flex items-center gap-2 text-[16px]">
            <i class="fa-solid fa-users text-brand-primary"></i>
            {{ props.event.capacity }} 人
          </div>
        </div>
      </div>

      <!-- 時間資訊 -->
      <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4">
        <div class="text-fg-muted mb-2 text-[12px] font-bold">活動時間</div>
        <div class="flex flex-col gap-2">
          <div class="text-fg-secondary flex items-center gap-2 text-[14px]">
            <i class="fa-solid fa-clock text-brand-primary"></i>
            <span class="font-bold">開始：</span>{{ props.event.startAt }}
          </div>
          <div class="text-fg-secondary flex items-center gap-2 text-[14px]">
            <i class="fa-solid fa-clock text-brand-primary"></i>
            <span class="font-bold">結束：</span>{{ props.event.endAt }}
          </div>
        </div>
      </div>

      <!-- 聯絡方式 -->
      <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4">
        <div class="text-fg-muted mb-1 text-[12px] font-bold">聯絡方式</div>
        <div class="text-fg-primary flex items-center gap-2 text-[14px]">
          <i class="fa-solid fa-phone text-brand-primary"></i>
          {{ props.event.contact }}
        </div>
      </div>

      <!-- 活動描述 -->
      <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4">
        <div class="text-fg-muted mb-2 text-[12px] font-bold">活動描述</div>
        <div class="text-fg-secondary text-[14px] leading-relaxed whitespace-pre-wrap">
          {{ props.event.desc }}
        </div>
      </div>

      <!-- 發起人資訊 -->
      <div
        v-if="props.event.initiator"
        class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4"
      >
        <div class="text-fg-muted mb-2 text-[12px] font-bold">發起人</div>
        <div class="flex items-center gap-3">
          <div
            class="bg-brand-primary/10 text-brand-primary flex h-10 w-10 items-center justify-center rounded-full font-bold"
          >
            {{ props.event.initiator.name.charAt(0) }}
          </div>
          <div>
            <div class="text-fg-primary font-bold">{{ props.event.initiator.name }}</div>
            <div class="text-fg-muted text-[12px]">活動發起人</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 無資料提示 -->
    <div v-else class="border-border-default bg-bg-surface rounded-2xl border p-6 text-center">
      <i class="fa-solid fa-circle-info text-fg-muted mb-2 text-[32px]"></i>
      <div class="text-fg-secondary">請從左側選擇一個活動查看詳情</div>
    </div>
  </div>
</template>
