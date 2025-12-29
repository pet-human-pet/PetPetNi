<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  event: { type: Object, default: null },
  comments: { type: Array, default: () => [] }
})

const emit = defineEmits(['back', 'add'])

const text = ref('')
const canSubmit = computed(() => text.value.trim().length > 0)

function submit() {
  if (!canSubmit.value) return
  emit('add', text.value.trim())
  text.value = ''
}

// 四張卡：左上新增 + 其餘最多顯示 3 張評論卡
const displayComments = computed(() => props.comments.slice(0, 3))
</script>

<template>
  <div class="h-full w-full bg-[#fdfbf7] p-4">
    <!-- 上方標題列 + 返回地圖 -->
    <div class="mb-4 flex items-center gap-2">
      <button
        type="button"
        class="h-9 w-9 rounded-lg bg-[#f0f2f5] text-[#666] hover:text-[#ff9f43]"
        aria-label="返回地圖"
        @click="emit('back')"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="min-w-0">
        <div class="truncate text-[16px] font-bold">
          {{ props.event?.title || '活動評論' }}
        </div>
        <div class="text-[12px] text-[#888]">選擇左側活動可切換該活動評論</div>
      </div>
    </div>

    <!-- 2x2 四張卡：左上新增評論 -->
    <div class="grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
      <!-- 新增評論卡（左上） -->
      <div class="rounded-2xl border-2 border-dashed border-[#ff9f43] bg-white p-4">
        <div class="mb-2 flex items-center gap-2 font-bold text-[#ff9f43]">
          <i class="fa-solid fa-circle-plus"></i>
          <span>新增評論</span>
        </div>

        <textarea
          v-model="text"
          class="h-24 w-full resize-none rounded-xl border border-[#ddd] p-3 text-[14px] placeholder:text-[#aaa]"
          placeholder="寫下你對活動的心得…"
        ></textarea>

        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-[#ff9f43] px-4 py-2 font-bold text-white disabled:opacity-40"
            :disabled="!canSubmit"
            @click="submit"
          >
            送出
          </button>
        </div>
      </div>

      <!-- 其餘 3 張評論卡 -->
      <div
        v-for="c in displayComments"
        :key="c.id"
        class="rounded-2xl border border-[#eee] bg-white p-4 shadow-[0_4px_15px_rgba(0,0,0,0.06)]"
      >
        <div class="text-[14px] whitespace-pre-wrap text-[#333]">
          {{ c.text }}
        </div>
        <div class="mt-3 text-[11px] text-[#999]">
          {{ c.createdAt }}
        </div>
      </div>

      <!-- 如果不足 3 則補空卡，維持 2x2 視覺 -->
      <div
        v-for="n in Math.max(0, 3 - displayComments.length)"
        :key="'empty-' + n"
        class="flex items-center justify-center rounded-2xl border border-[#eee] bg-white/60 p-4 text-[13px] text-[#aaa]"
      >
        尚無更多評論
      </div>
    </div>
  </div>
</template>
