import { ref } from 'vue'

export const useImagePreview = () => {
  const previewOpen = ref(false)
  const previewImages = ref([])
  const previewIndex = ref(0)

  const openPreview = ({ images, index }) => {
    previewImages.value = images ?? []
    previewIndex.value = index ?? 0
    previewOpen.value = true
  }

  const closePreview = () => {
    previewOpen.value = false
    previewImages.value = []
    previewIndex.value = 0
  }

  return {
    previewOpen,
    previewImages,
    previewIndex,
    openPreview,
    closePreview
  }
}
