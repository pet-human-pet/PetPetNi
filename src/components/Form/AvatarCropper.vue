<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
  file: {
    type: File,
    required: true
  },
  cropSize: {
    type: Number,
    default: 300
  },
  outputSize: {
    type: Number,
    default: 512
  }
})

const emit = defineEmits(['close', 'save'])

const rawImageUrl = ref('')
let rawObjectUrl = null

const cropArea = ref(null)
const cropImgEl = ref(null)

const naturalW = ref(0)
const naturalH = ref(0)
const currentCropSize = ref(0)
const baseScale = ref(1)
const zoom = ref(1)
const pos = ref({ x: 0, y: 0 })

let dragging = false
let dragStart = { x: 0, y: 0, baseX: 0, baseY: 0 }

watch(
  () => props.file,
  (newFile) => {
    if (!newFile) return
    loadFile(newFile)
  },
  { immediate: true }
)

watch(zoom, () => clampPos())

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (rawObjectUrl) URL.revokeObjectURL(rawObjectUrl)
})

function loadFile(file) {
  if (rawObjectUrl) URL.revokeObjectURL(rawObjectUrl)

  rawObjectUrl = URL.createObjectURL(file)
  rawImageUrl.value = rawObjectUrl
  pos.value = { x: 0, y: 0 }
  zoom.value = 1

  nextTick(() => updateCropMetrics())
}

/** 計算 cover 縮放比例，確保圖片最短邊填滿裁切框 */
function updateCropMetrics() {
  const el = cropArea.value
  if (!el) return
  currentCropSize.value = el.clientWidth || 0

  if (!naturalW.value || !naturalH.value || !currentCropSize.value) return

  baseScale.value = Math.max(
    currentCropSize.value / naturalW.value,
    currentCropSize.value / naturalH.value
  )
  zoom.value = Math.max(1, zoom.value)
  clampPos()
}

function onCropImgLoad() {
  const img = cropImgEl.value
  if (!img) return
  naturalW.value = img.naturalWidth || 0
  naturalH.value = img.naturalHeight || 0
  updateCropMetrics()
}

/** 限制拖曳範圍，確保圖片邊緣不超出裁切框 */
function clampPos() {
  const size = currentCropSize.value
  if (!size || !naturalW.value || !naturalH.value) return

  const scale = baseScale.value * zoom.value
  const renderedW = naturalW.value * scale
  const renderedH = naturalH.value * scale

  const maxX = Math.max(0, (renderedW - size) / 2)
  const maxY = Math.max(0, (renderedH - size) / 2)

  pos.value = {
    x: Math.min(maxX, Math.max(-maxX, pos.value.x)),
    y: Math.min(maxY, Math.max(-maxY, pos.value.y))
  }
}

/**
 * 將目前裁切框內的圖片區域輸出為圓形 PNG Blob
 * 使用 Canvas 進行圓形遮罩繪製
 */
async function saveCrop() {
  const img = cropImgEl.value
  const size = currentCropSize.value
  if (!img || !size || !naturalW.value || !naturalH.value) return

  const scale = baseScale.value * zoom.value
  const renderedW = naturalW.value * scale
  const renderedH = naturalH.value * scale

  const imgLeft = size / 2 + pos.value.x - renderedW / 2
  const imgTop = size / 2 + pos.value.y - renderedH / 2

  const srcX = (0 - imgLeft) / scale
  const srcY = (0 - imgTop) / scale
  const srcSize = size / scale

  const out = props.outputSize
  const canvas = document.createElement('canvas')
  canvas.width = out
  canvas.height = out
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, out, out)
  ctx.save()
  ctx.beginPath()
  ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, out, out)
  ctx.restore()

  canvas.toBlob((blob) => {
    if (blob) emit('save', blob)
  }, 'image/png')
}

function onPointerDown(e) {
  dragging = true
  dragStart = {
    x: e.clientX,
    y: e.clientY,
    baseX: pos.value.x,
    baseY: pos.value.y
  }
  cropArea.value?.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e) {
  if (!dragging) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  pos.value = { x: dragStart.baseX + dx, y: dragStart.baseY + dy }
  clampPos()
}

function onPointerUp() {
  dragging = false
}

function onResize() {
  updateCropMetrics()
}

const imgStyle = computed(() => {
  const scale = baseScale.value * zoom.value
  return {
    transform: `translate(-50%, -50%) translate(${pos.value.x}px, ${pos.value.y}px) scale(${scale})`,
    transformOrigin: 'center',
    willChange: 'transform'
  }
})
</script>

<template>
  <div
    class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
    @click.self="emit('close')"
  >
    <!-- TODO: shadow-[rgba] 應替換為設計系統陰影變數 -->
    <div class="w-full max-w-105 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div class="flex items-center justify-between">
        <!-- TODO: text-[16px] 應替換為設計系統字級 -->
        <div class="text-[16px] font-bold">裁切頭像</div>
        <!-- TODO: bg-[#f0f2f5] text-[#666] hover:bg-[#fffcf7] hover:text-[#FFA75F] 應替換為設計系統顏色變數 -->
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#FFA75F]"
          aria-label="關閉"
          @click="emit('close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- TODO: bg-[#f3f4f6] 應替換為設計系統顏色變數 -->
      <div
        ref="cropArea"
        class="relative mt-4 aspect-square w-full touch-none overflow-hidden rounded-xl bg-[#f3f4f6]"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <img
          v-if="rawImageUrl"
          ref="cropImgEl"
          :src="rawImageUrl"
          class="absolute top-1/2 left-1/2 select-none"
          :style="imgStyle"
          draggable="false"
          alt="crop"
          @load="onCropImgLoad"
        />

        <!-- TODO: EXIF 方向支援 -->
        <div class="pointer-events-none absolute inset-0">
          <!-- TODO: shadow-[rgba(0,0,0,0.45)] 應替換為設計系統陰影/顏色變數 -->
          <div
            class="absolute top-1/2 left-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          />
          <div
            class="absolute top-1/2 left-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          />
        </div>
      </div>

      <div class="mt-4">
        <!-- TODO: text-[13px] text-[#666] 應替換為設計系統字級與顏色變數 -->
        <div class="mb-2 text-[13px] font-bold text-[#666]">縮放</div>
        <input v-model.number="zoom" type="range" min="1" max="3" step="0.01" class="w-full" />
      </div>

      <div class="mt-4 flex gap-3">
        <!-- TODO: bg-[#eee] text-[#666] 應替換為設計系統顏色變數或使用 c-btn--secondary -->
        <button
          type="button"
          class="flex-1 rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
          @click="emit('close')"
        >
          取消
        </button>
        <!-- TODO: bg-[#FFA75F] 應替換為設計系統顏色變數或使用 c-btn--accent -->
        <button
          type="button"
          class="flex-1 rounded-lg bg-[#FFA75F] p-3 font-bold text-white"
          @click="saveCrop"
        >
          儲存頭像
        </button>
      </div>

      <!-- TODO: text-[12px] text-[#888] 應替換為設計系統字級與顏色變數，或使用 c-meta -->
      <div class="mt-3 text-[12px] text-[#888]">提示：可用手指/滑鼠拖曳調整位置，用滑桿縮放。</div>
    </div>
  </div>
</template>
