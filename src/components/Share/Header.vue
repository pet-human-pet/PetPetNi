<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const defaultAvatar =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'

/** 最終顯示在 Header 上的頭像 */
const avatarUrl = ref(defaultAvatar)

/** 選檔 input */
const fileInput = ref(null)

/** 裁切彈窗狀態 */
const cropOpen = ref(false)

/** 使用者選到的原圖（Object URL） */
const rawImageUrl = ref('')
let rawObjectUrl = null

/** 裁切區 dom / 圖片 dom */
const cropArea = ref(null)
const cropImgEl = ref(null)

/** 圖片 natural size */
const naturalW = ref(0)
const naturalH = ref(0)

/** 裁切區大小（方形） */
const cropSize = ref(0)

/** cover 基準縮放（讓圖片至少蓋住裁切框） */
const baseScale = ref(1)

/** 使用者縮放倍率（>=1） */
const zoom = ref(1)

/** 使用者拖曳位移（以裁切框中心為基準） */
const pos = ref({ x: 0, y: 0 })

/** 拖曳狀態 */
let dragging = false
let dragStart = { x: 0, y: 0, baseX: 0, baseY: 0 }

/** 最終 avatar object url（存 blob 用） */
let avatarObjectUrl = null

function openPicker() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片檔')
    e.target.value = ''
    return
  }

  // 清掉舊原圖 URL
  if (rawObjectUrl) URL.revokeObjectURL(rawObjectUrl)

  rawObjectUrl = URL.createObjectURL(file)
  rawImageUrl.value = rawObjectUrl
  cropOpen.value = true

  // reset
  pos.value = { x: 0, y: 0 }
  zoom.value = 1

  // 允許選同一張圖也能觸發 change
  e.target.value = ''

  // 等 DOM 出來後量裁切框尺寸
  nextTick(() => {
    updateCropMetrics()
  })
}

function closeCrop() {
  cropOpen.value = false

  // 關掉裁切窗就釋放原圖 URL（可依需求保留）
  if (rawObjectUrl) {
    URL.revokeObjectURL(rawObjectUrl)
    rawObjectUrl = null
  }
  rawImageUrl.value = ''
}

/** 量測裁切框大小 + 算 cover baseScale */
function updateCropMetrics() {
  const el = cropArea.value
  if (!el) return
  cropSize.value = el.clientWidth || 0

  // 有 natural size 才能算 cover
  if (!naturalW.value || !naturalH.value || !cropSize.value) return

  const cover = Math.max(cropSize.value / naturalW.value, cropSize.value / naturalH.value)
  baseScale.value = cover

  // 預設縮放 = 1（以 cover 為基準）
  zoom.value = Math.max(1, zoom.value)

  clampPos()
}

/** 圖片載入後取得 natural size */
function onCropImgLoad() {
  const img = cropImgEl.value
  if (!img) return
  naturalW.value = img.naturalWidth || 0
  naturalH.value = img.naturalHeight || 0
  updateCropMetrics()
}

/** clamp 拖曳範圍：避免露出背景（永遠填滿裁切框） */
function clampPos() {
  const size = cropSize.value
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

function onPointerDown(e) {
  if (!cropOpen.value) return
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

watch(zoom, () => {
  clampPos()
})

/** 圖片在裁切框中的 transform */
const imgStyle = computed(() => {
  const scale = baseScale.value * zoom.value
  return {
    transform: `translate(-50%, -50%) translate(${pos.value.x}px, ${pos.value.y}px) scale(${scale})`,
    transformOrigin: 'center',
    willChange: 'transform'
  }
})

/** 儲存裁切：輸出圓形 PNG，並填滿頭像框 */
async function saveCrop() {
  const img = cropImgEl.value
  const size = cropSize.value
  if (!img || !size || !naturalW.value || !naturalH.value) return

  const scale = baseScale.value * zoom.value
  const renderedW = naturalW.value * scale
  const renderedH = naturalH.value * scale

  // 圖片在裁切框內的 top-left（以裁切框左上為 (0,0)）
  const imgLeft = size / 2 + pos.value.x - renderedW / 2
  const imgTop = size / 2 + pos.value.y - renderedH / 2

  // 裁切框對應到原圖的取樣區域（方形）
  const srcX = (0 - imgLeft) / scale
  const srcY = (0 - imgTop) / scale
  const srcSize = size / scale

  const out = 512
  const canvas = document.createElement('canvas')
  canvas.width = out
  canvas.height = out
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, out, out)

  // 先做圓形裁切
  ctx.save()
  ctx.beginPath()
  ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, out, out)
  ctx.restore()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  // 釋放舊 avatar URL
  if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
  avatarObjectUrl = URL.createObjectURL(blob)
  avatarUrl.value = avatarObjectUrl

  closeCrop()
}

function onResize() {
  if (!cropOpen.value) return
  updateCropMetrics()
}

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (rawObjectUrl) URL.revokeObjectURL(rawObjectUrl)
  if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
})
</script>

<template>
  <header
    class="fixed left-0 top-0 z-1000 w-full border-b border-[#eee] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
  >
    <div
      class="mx-auto flex h-17.5 max-w-300 items-center justify-between px-6 max-[800px]:h-15 max-[800px]:px-4"
    >
      <a href="#" class="flex items-center no-underline">
        <span
          class="text-[26px] font-semibold text-[#ff9f43] max-[800px]:text-[22px]"
          style="font-family: 'Fredoka', sans-serif"
        >
          PetPetNi
        </span>
      </a>

      <div class="flex items-center gap-3">
        <!-- desktop icons -->
        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="收藏"
          type="button"
        >
          <i class="fa-regular fa-heart"></i>
        </button>

        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="訊息"
          type="button"
        >
          <i class="fa-regular fa-comment-dots"></i>
          <span class="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#ff5e57]" />
        </button>

        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="通知"
          type="button"
        >
          <i class="fa-regular fa-bell"></i>
        </button>

        <!-- Avatar：點擊開啟裁切流程 -->
        <button
          type="button"
          class="h-10 w-10 overflow-hidden rounded-full border-2 border-[#eee] p-0"
          title="更換頭像"
          @click="openPicker"
        >
          <img :src="avatarUrl" class="h-full w-full object-cover" alt="avatar" />
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        />

        <button
          class="ml-2 rounded-lg p-1.25 text-[22px] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          type="button"
          title="menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- Crop Modal -->
  <div
    v-if="cropOpen"
    class="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 p-4"
    @click.self="closeCrop"
  >
    <div class="w-full max-w-105 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div class="flex items-center justify-between">
        <div class="text-[16px] font-bold">裁切頭像</div>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          @click="closeCrop"
          aria-label="關閉"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Crop Area -->
      <div
        ref="cropArea"
        class="relative mt-4 aspect-square w-full overflow-hidden rounded-xl bg-[#f3f4f6] touch-none"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <img
          ref="cropImgEl"
          :src="rawImageUrl"
          class="absolute left-1/2 top-1/2 select-none"
          :style="imgStyle"
          draggable="false"
          alt="crop"
          @load="onCropImgLoad"
        />

        <!-- mask overlay：外面變暗 + 圓形框 -->
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full
                   shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          />
          <div
            class="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full
                   ring-2 ring-white"
          />
        </div>
      </div>

      <!-- Zoom -->
      <div class="mt-4">
        <div class="mb-2 text-[13px] font-bold text-[#666]">縮放</div>
        <input
          v-model.number="zoom"
          type="range"
          min="1"
          max="3"
          step="0.01"
          class="w-full"
        />
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
          @click="closeCrop"
        >
          取消
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg bg-[#ff9f43] p-3 font-bold text-white"
          @click="saveCrop"
        >
          儲存頭像
        </button>
      </div>

      <div class="mt-3 text-[12px] text-[#888]">
        提示：可用手指/滑鼠拖曳調整位置，用滑桿縮放。
      </div>
    </div>
  </div>
</template>
