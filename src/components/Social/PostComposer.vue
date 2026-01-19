<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import AudiencePicker from './AudiencePicker.vue'
import ImageCropper from '@/components/Share/ImageCropper.vue'
import { usePostComposerImages } from '@/composables/usePostComposerImages'
import { useToast } from '@/composables/useToast'

// 發布貼文流程
const props = defineProps({
  username: { type: String, default: 'test' },
  maxLength: { type: Number, default: 500 }
})

const emit = defineEmits(['submit', 'toast'])
const { error, info } = useToast()

// 引入圖片處理邏輯
const {
  images,
  isCropping,
  currentCropSrc,
  handleFileChange,
  onCropConfirm,
  onCropCancel,
  reCropImage,
  removeImage,
  uploadAllImages,
  clearImages
} = usePostComposerImages(4)

const open = ref(false)
const content = ref('')
const textareaRef = ref(null)
const fileInputRef = ref(null)
const isSubmitting = ref(false)

const countText = computed(() => `${content.value.length}/${props.maxLength}`)

const canSubmit = computed(() => {
  const hasContent = content.value.trim().length > 0
  const hasImages = images.value.length > 0
  return (hasContent || hasImages) && !isSubmitting.value
})

const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(open, async (v) => {
  if (!v) return
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
})

watch(content, () => {
  autoResize()
})

const triggerImageUpload = () => {
  fileInputRef.value?.click()
}

const submit = async () => {
  if (!canSubmit.value) return

  const text = content.value.trim()
  const hasImages = images.value.length > 0

  if (!hasImages && text.length <= 3) {
    error('文字須超過三個字才能發布')
    return
  }

  isSubmitting.value = true

  try {
    const uploadedUrls = await uploadAllImages()

    emit('submit', {
      content: content.value,
      images: uploadedUrls,
      hashtags: [],
      audience: audience.value
    })

    info('貼文發布中！')

    content.value = ''
    clearImages()
    open.value = false
  } catch {
    error('發布失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  if (isCropping.value) {
    clearImages()
  }
  open.value = false
}

const editing = ref(false)
const audience = ref('public')
</script>

<template>
  <div>
    <ImageCropper
      v-if="isCropping"
      :image-src="currentCropSrc"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />

    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- 手機：入口 -->
    <button
      type="button"
      class="c-card flex w-full items-center gap-3 py-3 text-left md:hidden"
      @click="open = true"
    >
      <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
      <div class="text-sm text-zinc-400">分享你的寵物日常...</div>
    </button>

    <!-- 桌機發文區 -->
    <section class="c-card hidden bg-white p-4 md:block">
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-full bg-zinc-200"></div>

        <div class="min-w-0 flex-1">
          <textarea
            v-model="content"
            class="text-fg-primary min-h-16 w-full resize-none bg-transparent text-base outline-none"
            placeholder="分享你的寵物日常..."
            :maxlength="maxLength"
          />

          <!-- 圖片預覽區 -->
          <div v-if="images.length > 0" class="mt-3 flex flex-wrap gap-2">
            <div
              v-for="(img, index) in images"
              :key="img.id"
              class="group relative aspect-square w-24 cursor-pointer overflow-hidden rounded-xl border border-zinc-200"
              @click="reCropImage(img)"
            >
              <img
                :src="img.url"
                class="h-full w-full object-cover transition-transform group-hover:scale-105"
              />

              <!-- 上傳中遮罩 -->
              <div
                v-if="img.status === 'uploading'"
                class="absolute inset-0 z-20 flex items-center justify-center bg-black/60"
              >
                <div
                  class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
              </div>

              <!-- 成功勾勾 -->
              <div
                v-if="img.status === 'success'"
                class="absolute inset-0 z-20 flex items-center justify-center bg-gray-700/40"
              >
                <span class="text-xl font-bold text-white">✓</span>
              </div>

              <!-- 編輯提示 -->
              <div
                v-if="img.status === 'idle'"
                class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span class="text-xs font-bold text-white">重裁</span>
              </div>

              <!-- 移除按鈕 -->
              <button
                type="button"
                class="absolute top-1 right-1 z-30 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                @click.stop="removeImage(index)"
              >
                <span class="text-xs font-bold">✕</span>
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center text-zinc-700">
              <button
                type="button"
                class="text-fg-secondary/70 hover:text-brand-primary cursor-pointer place-items-center rounded-full text-lg"
                aria-label="Image"
                @click="triggerImageUpload"
              >
                <i class="fa-regular fa-image"></i>
              </button>
            </div>

            <div class="relative flex items-center gap-3">
              <AudiencePicker v-model="audience" />
              <div class="text-sm text-zinc-400">{{ countText }}</div>
              <button
                type="button"
                class="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                :disabled="!canSubmit"
                @click="submit"
              >
                {{ isSubmitting ? '處理中...' : editing ? '更新' : '發布' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 手機彈窗 -->
    <div v-if="open" class="fixed inset-0 z-60 md:hidden">
      <div class="absolute inset-0 bg-black/60" @click="close"></div>
      <div class="relative mx-auto flex h-full max-w-130 items-center p-4">
        <section class="w-full rounded-2xl bg-white p-4 shadow-lg">
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

          <div class="mt-3">
            <textarea
              ref="textareaRef"
              v-model="content"
              class="w-full resize-none bg-transparent text-base leading-7 outline-none"
              placeholder="分享你的寵物日常..."
              :maxlength="maxLength"
              rows="3"
            />
          </div>

          <!-- 手機預覽 -->
          <div v-if="images.length > 0" class="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2">
            <div
              v-for="(img, index) in images"
              :key="img.id"
              class="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border-2 border-zinc-200"
              @click="reCropImage(img)"
            >
              <img :src="img.url" class="h-full w-full object-cover" />

              <!-- 上傳中遮罩 -->
              <div
                v-if="img.status === 'uploading'"
                class="absolute inset-0 z-20 flex items-center justify-center bg-black/60"
              >
                <div
                  class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
              </div>

              <!-- 成功勾勾 -->
              <div
                v-if="img.status === 'success'"
                class="absolute inset-0 z-20 flex items-center justify-center bg-gray-700/40"
              >
                <span class="text-xl font-bold text-white">✓</span>
              </div>

              <button
                type="button"
                class="absolute top-1 right-1 z-30 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white"
                @click.stop="removeImage(index)"
              >
                <span class="text-[10px]">✕</span>
              </button>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3">
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
            <div class="flex items-center gap-3">
              <div class="text-xs text-zinc-400">{{ countText }}</div>
              <button
                type="button"
                class="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                :disabled="!canSubmit"
                @click="submit"
              >
                {{ isSubmitting ? '...' : '發布' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
