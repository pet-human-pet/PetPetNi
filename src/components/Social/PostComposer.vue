<script setup>
import { computed, nextTick, ref, watch } from 'vue'

// 發布貼文流程
const props = defineProps({
  username: { type: String, default: 'test' },
  maxLength: { type: Number, default: 500 },
})

const emit = defineEmits(['submit'])

const open = ref(false)
const content = ref('')
// 拿到textarea DOM物件，計算高度(auto resize)
const textareaRef = ref(null)

// 顯示用字數 0/500
const countText = computed(() => `${content.value.length}/${props.maxLength}`)

// 判斷發布按鈕是否可按(空白鍵不送)
const canSubmit = computed(() => content.value.trim().length > 0)

// textarea自動長高的核心
const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
// 監聽視窗開啟：開了就調高度+focus
watch(open, async (v) => {
  if (!v) return
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
})
// 監聽內容變化：打字就重新計算高度
watch(content, () => {
  autoResize()
})
// 送出/關閉流程
const submit = () => {
  if (!canSubmit.value) return
  emit('submit', { content: content.value, images: [], hashtags: [] })
  content.value = ''
}
// 關掉手機彈窗
const close = () => {
  open.value = false
}
// 發布後關掉彈窗
const submitAndClose = () => {
  submit()
  close()
}
</script>

<template>
  <!-- 手機：入口（點了開彈窗） -->
  <button
    type="button"
    class="mt-4 flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left md:hidden"
    @click="open = true"
  >
    <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
    <div class="text-sm text-zinc-400">輸入文字</div>
  </button>

  <!-- 平板/桌機：inline 發文 -->
  <section class="mt-4 hidden w-full rounded-2xl border bg-white p-4 md:block">
    <div class="flex items-start gap-3">
      <div class="h-10 w-10 rounded-full bg-zinc-200"></div>

      <div class="min-w-0 flex-1">
        <textarea
          v-model="content"
          class="min-h-16 w-full resize-none bg-transparent text-sm outline-none"
          placeholder="輸入文字"
          :maxlength="maxLength"
        />

        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-5 text-zinc-700">
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100"
              aria-label="Location"
            >
              📍
            </button>
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100"
              aria-label="Image"
            >
              🖼️
            </button>
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100"
              aria-label="Hashtag"
            >
              <span class="text-xl font-semibold">#</span>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-sm text-zinc-400">{{ countText }}</div>
            <button
              type="button"
              class="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="!canSubmit"
              @click="submit"
            >
              發布
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 手機：遮罩 + 彈窗 -->
  <div v-if="open" class="fixed inset-0 z-60 md:hidden">
    <!-- 不透明遮罩 -->
    <div class="absolute inset-0 bg-black/60" @click="close"></div>

    <!-- Dialog -->
    <div class="relative mx-auto flex h-full max-w-130 items-center p-4">
      <section class="w-full rounded-2xl bg-white p-4 shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
            <div class="min-w-0">
              <div class="text-sm font-semibold">{{ username }}</div>
              <button
                type="button"
                class="mt-1 inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs"
              >
                <span class="text-sm">🌐</span>
                <span>所有人</span>
                <span class="text-zinc-500">▼</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100"
            aria-label="Close"
            @click="close"
          >
            <span class="text-lg font-semibold">×</span>
          </button>
        </div>

        <!-- Textarea（自動長高） -->
        <div class="mt-3">
          <textarea
            ref="textareaRef"
            v-model="content"
            class="w-full resize-none bg-transparent text-base leading-7 outline-none"
            placeholder="輸入文字"
            :maxlength="maxLength"
            rows="1"
          />
        </div>

        <!-- Toolbar + Counter + Submit -->
        <div class="mt-4 flex items-center justify-between gap-3">
          <!-- 左：功能按鈕 -->
          <div class="flex items-center gap-3 text-zinc-700">
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full bg-zinc-100"
              aria-label="Checkin"
            >
              📍
            </button>
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full bg-zinc-100"
              aria-label="Upload"
            >
              🖼️
            </button>
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full bg-zinc-100"
              aria-label="Hashtag"
            >
              <span class="text-lg font-semibold">#</span>
            </button>
          </div>

          <!-- 右：字數 + 發布 -->
          <div class="flex items-center gap-3">
            <div class="text-xs text-zinc-400">{{ countText }}</div>
            <button
              type="button"
              class="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="!canSubmit"
              @click="submitAndClose"
            >
              發布
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
