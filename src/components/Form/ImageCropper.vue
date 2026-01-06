<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
  // 接收選中的圖片檔案
  file: {
    type: File,
    required: true
  },
  // 裁切框大小（像素）
  cropSize: {
    type: Number,
    default: 300
  },
  // 輸出解析度
  outputSize: {
    type: Number,
    default: 512
  }
})

const emit = defineEmits(['close', 'save'])

// --- 狀態變數 ---

/** 原圖 URL（Blob） */
const rawImageUrl = ref('')
let rawObjectUrl = null

/** 裁切區/圖片 DOM */
const cropArea = ref(null)
const cropImgEl = ref(null)

/** 圖片原始尺寸 */
const naturalW = ref(0)
const naturalH = ref(0)

/** 實際渲染的裁切框寬度 (px) - 可能會隨 RWD 改變 */
const currentCropSize = ref(0)

/** cover 基準縮放 */
const baseScale = ref(1)

/** 使用者縮放倍率（>=1） */
const zoom = ref(1)

/** 使用者拖曳位移 */
const pos = ref({ x: 0, y: 0 })

/** 拖曳狀態 */
let dragging = false
let dragStart = { x: 0, y: 0, baseX: 0, baseY: 0 }

// --- 初始化與監聽 ---

// 監聽傳入的 file 變化
watch(
  () => props.file,
  (newFile) => {
    if (!newFile) return
    loadFile(newFile)
  },
  { immediate: true }
)

// 監聽 zoom 變化，自動限制位置
watch(zoom, () => {
  clampPos()
})

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (rawObjectUrl) URL.revokeObjectURL(rawObjectUrl)
})

// --- 核心邏輯 ---

function loadFile(file) {
  // 清釋舊 URL
  if (rawObjectUrl) URL.revokeObjectURL(rawObjectUrl)

  rawObjectUrl = URL.createObjectURL(file)
  rawImageUrl.value = rawObjectUrl

  // Reset
  pos.value = { x: 0, y: 0 }
  zoom.value = 1

  // 等待 DOM 更新後測量
  nextTick(() => {
    updateCropMetrics()
  })
}

/** 量測裁切框大小 + 計算 cover baseScale */
function updateCropMetrics() {
  const el = cropArea.value
  if (!el) return
  currentCropSize.value = el.clientWidth || 0

  // 有 natural size 才能算 cover
  if (!naturalW.value || !naturalH.value || !currentCropSize.value) return

  // 確保圖片最短邊也能填滿
  const cover = Math.max(
    currentCropSize.value / naturalW.value,
    currentCropSize.value / naturalH.value
  )
  baseScale.value = cover

  // 確保 zoom 至少為 1
  zoom.value = Math.max(1, zoom.value)

  clampPos()
}

/** 圖片載入完成 (DOM事件) */
function onCropImgLoad() {
  const img = cropImgEl.value
  if (!img) return
  naturalW.value = img.naturalWidth || 0
  naturalH.value = img.naturalHeight || 0
  updateCropMetrics()
}

/** 限制拖曳範圍：確保圖片不會露出背景 */
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

/** 輸出裁切結果 */
async function saveCrop() {
  const img = cropImgEl.value
  const size = currentCropSize.value
  if (!img || !size || !naturalW.value || !naturalH.value) return

  const scale = baseScale.value * zoom.value
  const renderedW = naturalW.value * scale
  const renderedH = naturalH.value * scale

  // 計算圖片在裁切框內的 Top-Left
  // 裁切框中心 (size/2, size/2) 對應到 圖片中心 + pos
  const imgLeft = size / 2 + pos.value.x - renderedW / 2
  const imgTop = size / 2 + pos.value.y - renderedH / 2

  // 計算對應原圖的取樣區域 (source rect)
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

  // 圓形裁切
  ctx.save()
  ctx.beginPath()
  ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  // 繪圖: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, out, out)
  ctx.restore()

  // 轉成 Blob 輸出
  canvas.toBlob((blob) => {
    if (blob) {
      emit('save', blob)
    }
  }, 'image/png')
}

// --- 互動事件 ---

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

// 計算樣式
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
    <div class="w-full max-w-105 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div class="flex items-center justify-between">
        <div class="text-[16px] font-bold">裁切頭像</div>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#FFA75F]"
          aria-label="關閉"
          @click="emit('close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Crop Area -->
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

        <!-- Mask Overlay -->
        <!-- TODO: EXIF 方向支援 -->
        <div class="pointer-events-none absolute inset-0">
          <!-- 陰影遮罩：中間鏤空 -->
          <div
            class="absolute top-1/2 left-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          />
          <!-- 白色邊框 -->
          <div
            class="absolute top-1/2 left-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          />
        </div>
      </div>

      <!-- Zoom Slider -->
      <div class="mt-4">
        <div class="mb-2 text-[13px] font-bold text-[#666]">縮放</div>
        <input v-model.number="zoom" type="range" min="1" max="3" step="0.01" class="w-full" />
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg bg-[#FFA75F] p-3 font-bold text-white"
          @click="saveCrop"
        >
          儲存頭像
        </button>
      </div>

      <div class="mt-3 text-[12px] text-[#888]">提示：可用手指/滑鼠拖曳調整位置，用滑桿縮放。</div>
    </div>
  </div>
</template>
