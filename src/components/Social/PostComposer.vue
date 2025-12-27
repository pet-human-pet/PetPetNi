<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import AudiencePicker from './AudiencePicker.vue'

// 發布貼文流程
const props = defineProps({
  username: { type: String, default: 'test' },
  maxLength: { type: Number, default: 500 }
})

const emit = defineEmits(['submit', 'toast'])

const open = ref(false)
const content = ref('')
// 拿到textarea DOM物件，計算高度(auto resize)
const textareaRef = ref(null)
// 隱藏的檔案輸入框
const fileInputRef = ref(null)

// 存放選擇的圖片：{ id, file, url }
const images = ref([])

// 顯示用字數 0/500
const countText = computed(() => `${content.value.length}/${props.maxLength}`)

// 判斷發布按鈕是否可按(空白鍵不送)
const canSubmit = computed(() => content.value.trim().length > 0 || images.value.length > 0)

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

// 觸發圖片上傳
const triggerImageUpload = () => {
  fileInputRef.value?.click()
}

// 處理檔案選擇
const handleFileChange = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  // 生成預覽並加入列表
  files.forEach((file) => {
    // 簡單檢查是不是圖片
    if (!file.type.startsWith('image/')) return

    const url = URL.createObjectURL(file)
    images.value.push({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file,
      url
    })
  })

  // 清空 input，讓同一張圖可以再次被選（如果需要的話，雖然這裡是多選）
  event.target.value = ''
}

// 移除圖片
const removeImage = (index) => {
  // 記得釋放 URL 對象
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
}

// 送出/關閉流程
const submit = () => {
  const text = content.value.trim()
  const imageUrls = images.value.map((img) => img.url)
  const hasImages = imageUrls.length > 0
  const textLen = text.length

  if (!hasImages && textLen <= 5) {
    emit('toast', '文字須超過五個字才能發布')
    return false
  }

  emit('submit', {
    content: content.value,
    images: imageUrls,
    hashtags: [],
    audience: audience.value
  })

  // 清空輸入 (成功才清)
  content.value = ''
  images.value.forEach((img) => URL.revokeObjectURL(img.url))
  images.value = []
  return true
}
// 關掉手機彈窗
const close = () => {
  open.value = false
}

const submitAndClose = () => {
  const ok = submit()
  if (ok) close()
}
// 編輯貼文
const editing = ref(false)

// 分享對象下拉選單
const audience = ref('public')
</script>

<template>
  <body>
    <!-- 隱藏的檔案輸入框 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- 手機：入口（點了開彈窗） -->
    <button
      type="button"
      class="c-card flex w-full items-center gap-3 py-3 text-left md:hidden"
      @click="open = true"
    >
      <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
      <div class="text-sm text-zinc-400">輸入文字</div>
    </button>

    <!-- 平板/桌機：inline 發文 -->
    <section class="c-card hidden bg-white p-4 md:block">
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-full bg-zinc-200"></div>

        <div class="min-w-0 flex-1">
          <textarea
            v-model="content"
            class="min-h-16 w-full resize-none bg-transparent text-sm outline-none"
            placeholder="輸入文字"
            :maxlength="maxLength"
          />

          <!-- 圖片預覽區 -->
          <div v-if="images.length > 0" class="mt-3 flex flex-wrap gap-2">
            <div
              v-for="(img, index) in images"
              :key="img.id"
              class="group relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-200"
            >
              <img :src="img.url" class="h-full w-full object-cover" />
              <button
                type="button"
                class="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                @click="removeImage(index)"
              >
                <span class="text-xs font-bold">✕</span>
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-5 text-zinc-700">
              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100"
                aria-label="Image"
                @click="triggerImageUpload"
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

            <div class="relative flex items-center gap-3">
              <AudiencePicker v-model="audience" />

              <!-- 字數 -->
              <div class="text-sm text-zinc-400">{{ countText }}</div>

              <!-- 發布 -->
              <button
                type="button"
                class="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                :disabled="!canSubmit"
                @click="submit"
              >
                {{ editing ? '更新' : '發布' }}
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
                <AudiencePicker v-model="audience" />
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
              rows="3"
            />
          </div>

          <!-- 圖片預覽區 (Mobile) -->
          <div v-if="images.length > 0" class="mt-3 flex gap-2 overflow-x-auto pb-2">
            <div
              v-for="(img, index) in images"
              :key="img.id"
              class="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200"
            >
              <img :src="img.url" class="h-full w-full object-cover" />
              <button
                type="button"
                class="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                @click="removeImage(index)"
              >
                <span class="text-xs font-bold">✕</span>
              </button>
            </div>
          </div>

          <!-- Toolbar + Counter + Submit -->
          <div class="mt-4 flex items-center justify-between gap-3">
            <!-- 左：功能按鈕 -->
            <div class="flex items-center gap-3 text-zinc-700">
              <button
                type="button"
                class="grid h-10 w-10 place-items-center rounded-full bg-zinc-100"
                aria-label="Upload"
                @click="triggerImageUpload"
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
                {{ editing ? '更新' : '發布' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </body>
</template>
