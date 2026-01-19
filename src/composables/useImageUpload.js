import imageCompression from 'browser-image-compression'
import axios from 'axios'

// 圖片上傳：負責壓縮 +上傳到 Cloudinary
export const useImageUpload = () => {
  const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  // 壓縮
  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 1.0,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8
      }

      const compressed = await imageCompression(file, options)

      return {
        blob: compressed,
        sizeKB: Math.round(compressed.size / 1024),
        originalSizeKB: Math.round(file.size / 1024)
      }
    } catch {
      throw new Error('圖片壓縮失敗')
    }
  }

  // 上傳到 Cloudinary
  const uploadToCloudinary = async (blob, { folder = 'petpetni/posts' } = {}, onProgress) => {
    const formData = new FormData()
    formData.append('file', blob)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', folder)

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            // Axios內建的進度監聽器
            if (progressEvent.total && onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(percent)
            }
          }
        }
      )

      const publicId = res.data.public_id
      const webpUrl = `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload/f_webp,q_auto/${publicId}`

      return {
        url: webpUrl, // 現在這個 url 就是 webp
        publicId, // 可留（未來刪圖、換尺寸）
        width: res.data.width,
        height: res.data.height
      }
    } catch {
      throw new Error('圖片上傳失敗，請檢查網路或稍後再試')
    }
  }

  return {
    compressImage,
    uploadToCloudinary
  }
}
