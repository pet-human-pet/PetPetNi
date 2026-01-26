<script setup>
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

defineProps({
  imageSrc: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])
const cropperRef = ref(null)

// 設定初始裁切框為最大正方形
const defaultSize = ({ imageSize }) => {
  const size = Math.min(imageSize.width, imageSize.height)
  return {
    width: size,
    height: size
  }
}

const onConfirm = () => {
  const result = cropperRef.value.getResult()
  const { canvas, coordinates } = result
  if (canvas) {
    canvas.toBlob(
      (blob) => {
        emit('confirm', { blob, coordinates })
      },
      'image/jpeg',
      0.9
    )
  }
}
</script>

<template>
  <div class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4">
    <div class="bg-bg-surface w-full max-w-lg rounded-xl p-4 shadow-2xl">
      <h3 class="text-fg-primary mb-4 text-center text-lg font-bold">調整圖片範圍</h3>

      <div class="overflow-hidden rounded-lg bg-black">
        <Cropper
          ref="cropperRef"
          class="h-100 w-full"
          :src="imageSrc"
          :stencil-props="{
            aspectRatio: 1 / 1,
            movable: true,
            resizable: true
          }"
          :default-size="defaultSize"
          image-restriction="stencil"
        />
      </div>

      <div class="mt-6 flex gap-3">
        <button
          class="flex-1 cursor-pointer rounded-lg bg-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
          @click="$emit('cancel')"
        >
          取消
        </button>
        <button
          class="bg-btn-primary hover:bg-btn-primary-dark flex-1 cursor-pointer rounded-lg py-2.5 font-medium text-white"
          @click="onConfirm"
        >
          確認裁切
        </button>
      </div>
    </div>
  </div>
</template>
