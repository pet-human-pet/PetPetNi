<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import AudiencePicker from './AudiencePicker.vue'
import ImageCropper from '@/components/Share/ImageCropper.vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { useToast } from '@/composables/useToast'

// 發布貼文流程
const props = defineProps({
  username: { type: String, default: 'test' },
  maxLength: { type: Number, default: 500 }
})

const emit = defineEmits(['submit', 'toast'])
const { compressImage, uploadToCloudinary } = useImageUpload()
const { success, error, info } = useToast()

const open = ref(false)
const content = ref('')
const textareaRef = ref(null)
const fileInputRef = ref(null)

const isSubmitting = ref(false)

// 存放最終已裁切的圖片：{ id, url, file (Blob), originalFile, status }
const images = ref([])

// 裁切佇列系統
const cropQueue = ref([]) 
const currentCropSrc = ref('')
const isCropping = ref(false)
const isReCropping = ref(false)
const reCropTargetId = ref(null)

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

// 處理下一張裁切
const processNextCrop = () => {
  if (cropQueue.value.length === 0) {
    isCropping.value = false
    currentCropSrc.value = ''
    return
  }

  const nextFile = cropQueue.value[0]
  currentCropSrc.value = URL.createObjectURL(nextFile)
  isCropping.value = true
}

// 處理檔案選擇
const handleFileChange = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  if (images.value.length + cropQueue.value.length + files.length > 4) {
    error('最多只能上傳 4 張圖片')
    event.target.value = ''
    return
  }

  const validFiles = files.filter(f => f.type.startsWith('image/'))
  if (validFiles.length > 0) {
    isReCropping.value = false
    cropQueue.value.push(...validFiles)
    processNextCrop()
  }

  event.target.value = ''
}

// 處理下一張裁切
const processNextCrop = () => {
  if (cropQueue.value.length === 0) {
    isCropping.value = false
    isReCropping.value = false
    currentCropSrc.value = ''
    reCropTargetId.value = null
    return
  }

  const nextFile = cropQueue.value[0]
  currentCropSrc.value = URL.createObjectURL(nextFile)
  isCropping.value = true
}

// 確認裁切
const onCropConfirm = (blob) => {
  const previewUrl = URL.createObjectURL(blob)
  
  if (isReCropping.value && reCropTargetId.value) {
    const index = images.value.findIndex(img => img.id === reCropTargetId.value)
    if (index !== -1) {
      URL.revokeObjectURL(images.value[index].url)
      images.value[index].url = previewUrl
      images.value[index].file = blob
    }
  } else {
    images.value.push({
      id: Date.now() + Math.random().toString(36).slice(2, 9),
      url: previewUrl,
      file: blob,
      originalFile: cropQueue.value[0],
      status: 'idle'
    })
  }

  cropQueue.value.shift()
  URL.revokeObjectURL(currentCropSrc.value)
  processNextCrop()
}

// 取消裁切
const onCropCancel = () => {
  cropQueue.value.shift()
  URL.revokeObjectURL(currentCropSrc.value)
  processNextCrop()
}

// 重新裁切
const reCropImage = (img) => {
  isReCropping.value = true
  reCropTargetId.value = img.id
  cropQueue.value = [img.originalFile]
  processNextCrop()
}

const removeImage = (index) => {
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
}

// 發布
const submit = async () => {
  if (!canSubmit.value) return

  const text = content.value.trim()
  const hasImages = images.value.length > 0
  
  if (!hasImages && text.length <= 5) {
    error('文字須超過五個字才能發布')
    return
  }

  isSubmitting.value = true
  const uploadedUrls = []

  try {
    if (hasImages) {
      images.value.forEach(img => img.status = 'uploading')
      
      const uploadPromises = images.value.map(async (img) => {
        try {
          const { blob: compressedBlob } = await compressImage(new File([img.file], 'image.jpg', { type: 'image/jpeg' }))
          const result = await uploadToCloudinary(compressedBlob)
          img.status = 'success'
          return result.url
        } catch (err) {
          img.status = 'error'
          throw err
        }
      })

      uploadedUrls.push(...await Promise.all(uploadPromises))
    }

    emit('submit', {
      content: content.value,
      images: uploadedUrls,
      hashtags: [],
      audience: audience.value
    })

    success('貼文已發布！')
    content.value = ''
    images.value.forEach((img) => URL.revokeObjectURL(img.url))
    images.value = []
    open.value = false

  } catch {
    error('發布失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  if (isCropping.value) {
    cropQueue.value = []
    isCropping.value = false
  }
  open.value = false
}

const editing = ref(false)
const audience = ref('public')
</script>

<template>
  <div>
    <!-- 裁切彈窗 -->
    <ImageCropper
      v-if="isCropping"
      :image-src="currentCropSrc"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />

    <!-- 隱藏的檔案輸入框 -->
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
            class="min-h-16 w-full resize-none bg-transparent text-fg-primary text-sm outline-none"
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
              <img :src="img.url" class="h-full w-full object-cover transition-transform group-hover:scale-105" />
              
              <!-- 上傳中遮罩 -->
              <div v-if="img.status === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>

              <!-- 成功勾勾 -->
              <div v-if="img.status === 'success'" class="absolute inset-0 flex items-center justify-center bg-green-500/40 z-20">
                <span class="text-white text-xl font-bold">✓</span>
              </div>

              <!-- 編輯提示 -->
              <div v-if="img.status === 'idle'" class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <span class="text-white text-xs font-bold">重裁</span>
              </div>

              <!-- 移除按鈕 -->
              <button
                type="button"
                class="absolute top-1 right-1 z-30 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                @click.stop="removeImage(index)"
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
              <div class="text-sm text-zinc-400">{{ countText }}</div>
              <button
                type="button"
                class="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                :disabled="!canSubmit"
                @click="submit"
              >
                {{ isSubmitting ? '處理中...' : (editing ? '更新' : '發布') }}
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
          <div v-if="images.length > 0" class="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <div
              v-for="(img, index) in images"
              :key="img.id"
              class="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border-2 border-zinc-200"
              @click="reCropImage(img)"
            >
              <img :src="img.url" class="h-full w-full object-cover" />
              
              <!-- 上傳中遮罩 -->
              <div v-if="img.status === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>

              <!-- 成功勾勾 -->
              <div v-if="img.status === 'success'" class="absolute inset-0 flex items-center justify-center bg-green-500/40 z-20">
                <span class="text-white text-xl font-bold">✓</span>
              </div>

              <button
                type="button"
                class="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white z-30"
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