<script setup>
import { computed, ref } from 'vue'
import { useEventCommentStore } from '@/stores/EventComment'

// 定義 Props
const props = defineProps({
  event: { type: Object, default: null }
  // comments 不再透過 props 傳入，改由 store 獲取
})

// 定義 Emits
const emit = defineEmits(['back'])

// 引入 Store
const commentStore = useEventCommentStore()

// 本地狀態
const text = ref('')
const canSubmit = computed(() => text.value.trim().length > 0)

// 提交評論
function submit() {
  if (!canSubmit.value || !props.event) return

  // 呼叫 Store Action
  commentStore.addComment(props.event.id, text.value.trim())

  // 清空輸入框
  text.value = ''
}

// 取得該活動的評論列表
const myComments = computed(() => {
  if (!props.event) return []
  return commentStore.getComments(props.event.id)
})
</script>

<template>
  <div class="bg-bg-base h-full w-full overflow-y-auto p-4">
    <!-- 上方標題列 + 返回地圖 -->
    <div class="mb-4 flex items-center gap-2">
      <button
        type="button"
        class="text-fg-secondary hover:text-brand-accent flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-white hover:shadow-sm"
        aria-label="返回地圖"
        @click="emit('back')"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="min-w-0">
        <div class="text-fg-primary truncate text-[16px] font-bold">
          {{ props.event?.title || '活動評論' }}
        </div>
        <div class="text-fg-muted text-[12px]">選擇左側活動可切換該活動評論</div>
      </div>
    </div>

    <!-- 2x2 四張卡：左上新增評論 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- 新增評論卡（左上） -->
      <div class="border-brand-primary bg-bg-surface rounded-2xl border-2 border-dashed p-4">
        <div class="text-brand-primary mb-2 flex items-center gap-2 font-bold">
          <i class="fa-solid fa-circle-plus"></i>
          <span>新增評論</span>
        </div>

        <textarea
          v-model="text"
          class="border-border-default text-fg-primary placeholder:text-fg-muted focus:border-brand-primary h-24 w-full resize-none rounded-xl border p-3 text-sm outline-none"
          placeholder="寫下你對活動的心得…"
        ></textarea>

        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="c-btn c-btn--primary disabled:opacity-40"
            :disabled="!canSubmit"
            @click="submit"
          >
            送出
          </button>
        </div>
      </div>

      <!-- 其餘 3 張評論卡 -->
      <div
        v-for="c in myComments"
        :key="c.id"
        class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-4"
      >
        <div class="text-fg-primary text-sm whitespace-pre-wrap">
          {{ c.text }}
        </div>
        <div class="text-fg-muted mt-3 text-[11px]">
          {{ c.createdAt }}
        </div>
      </div>
    </div>
  </div>
</template>
