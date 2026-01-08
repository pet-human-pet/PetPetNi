<script setup>
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])
const cropperRef = ref(null)

const onConfirm = () => {
  const { canvas } = cropperRef.value.getResult()
  if (canvas) {
    // 轉成 Blob 傳出去
    canvas.toBlob((blob) => {
      emit('confirm', blob)
    }, 'image/jpeg', 0.9) // 90% 品質 JPG
  }
}
</script>

<template>
  <div class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4">
    <div class="w-full max-w-lg rounded-xl bg-bg-surface p-4 shadow-2xl">
      <h3 class="mb-4 text-center text-lg font-bold text-fg-primary">調整圖片範圍</h3>
      
      <!-- 裁切器 -->
      <div class="overflow-hidden rounded-lg bg-black">
        <Cropper
          ref="cropperRef"
          class="h-75 w-full"
          :src="imageSrc"
          :stencil-props="{ aspectRatio: 1/1 }" 
        />
      </div>

      <!-- 按鈕區 -->
      <div class="mt-6 flex gap-3">
        <button 
          class="flex-1 rounded-lg bg-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
          @click="$emit('cancel')"
        >
          取消
        </button>
        <button 
          class="flex-1 rounded-lg bg-brand-primary py-2.5 font-medium text-white hover:opacity-90"
          @click="onConfirm"
        >
          確認裁切
        </button>
      </div>
    </div>
  </div>
</template>
