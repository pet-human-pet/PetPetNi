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

  // 生成 Cloudinary 動態裁切網址
  const getDynamicUrl = (publicId, coordinates = null) => {
    if (!publicId) return ''

    // 如果有裁切座標，加入 c_crop 參數
    // 格式：c_crop,w_[width],h_[height],x_[x],y_[y]
    const transformation = coordinates
      ? `c_crop,w_${Math.round(coordinates.width)},h_${Math.round(coordinates.height)},x_${Math.round(coordinates.left)},y_${Math.round(coordinates.top)}/`
      : ''

    return `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload/${transformation}f_webp,q_auto/${publicId}`
  }

  // 上傳到 Cloudinary
  const uploadToCloudinary = async (fileOrBlob, { folder = 'petpetni/posts' } = {}, onProgress) => {
    const formData = new FormData()
    formData.append('file', fileOrBlob)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', folder)

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(percent)
            }
          }
        }
      )

      const publicId = res.data.public_id

      return {
        url: res.data.secure_url, // 原始網址
        publicId,
        width: res.data.width,
        height: res.data.height,
        // 預設提供一個基本的最佳化網址
        optimizedUrl: getDynamicUrl(publicId)
      }
    } catch {
      throw new Error('圖片上傳失敗，請檢查網路或稍後再試')
    }
  }

  return {
    compressImage,
    uploadToCloudinary,
    getDynamicUrl
  }
}
