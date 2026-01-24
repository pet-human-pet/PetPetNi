import { ref } from 'vue'
import { useImageUpload } from './useImageUpload'
import { useToast } from './useToast'

export const usePostComposerImages = (maxCount = 4) => {
  const { compressImage, uploadToCloudinary } = useImageUpload()
  const { error } = useToast()
  const images = ref([]) // 最終裁切後的圖片列表
  const cropQueue = ref([]) // 待裁切檔案佇列
  const currentCropSrc = ref('') // 當前裁切預覽源
  const isCropping = ref(false) // 裁切器開關
  const isReCropping = ref(false) // 是否為重裁模式
  const reCropTargetId = ref(null) // 重裁目標的 ID

  // 啟動下一張裁切
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

  // 處理檔案選擇
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (images.value.length + cropQueue.value.length + files.length > maxCount) {
      error(`最多只能上傳 ${maxCount} 張圖片`)
      event.target.value = ''
      return
    }

    const validFiles = files.filter((f) => f.type.startsWith('image/'))
    if (validFiles.length > 0) {
      isReCropping.value = false
      cropQueue.value.push(...validFiles)
      processNextCrop()
    }

    event.target.value = ''
  }

  // 確認裁切
  const onCropConfirm = (blob) => {
    const previewUrl = URL.createObjectURL(blob)

    if (isReCropping.value && reCropTargetId.value) {
      const index = images.value.findIndex((img) => img.id === reCropTargetId.value)
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

  // 移除圖片
  const removeImage = (index) => {
    URL.revokeObjectURL(images.value[index].url)
    images.value.splice(index, 1)
  }

  // 上傳邏輯 (submit時呼叫)
  const uploadAllImages = async () => {
    if (images.value.length === 0) return []

    images.value.forEach((img) => (img.status = 'uploading'))

    const uploadPromises = images.value.map(async (img) => {
      try {
        const { blob: compressedBlob } = await compressImage(
          new File([img.file], 'image.jpg', { type: 'image/jpeg' })
        )
        const result = await uploadToCloudinary(compressedBlob, { folder: 'petpetni/posts' })
        img.status = 'success'
        return result.url
      } catch {
        img.status = 'error'
        return null
      }
    })

    return await Promise.all(uploadPromises)
  }

  // 清空所有狀態
  const clearImages = () => {
    images.value.forEach((img) => URL.revokeObjectURL(img.url))
    images.value = []
    cropQueue.value = []
  }

  return {
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
  }
}