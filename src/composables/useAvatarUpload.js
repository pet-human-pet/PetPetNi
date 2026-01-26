import axios from 'axios'
import imageCompression from 'browser-image-compression'

export const useAvatarUpload = () => {
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
      return { blob: compressed }
    } catch {
      throw new Error('圖片壓縮失敗')
    }
  }

  // 生成 Cloudinary 動態裁切網址
  const getDynamicUrl = (publicId, coordinates = null) => {
    if (!publicId) return ''
    const transformation = coordinates
      ? `c_crop,w_${Math.round(coordinates.width)},h_${Math.round(coordinates.height)},x_${Math.round(coordinates.left)},y_${Math.round(coordinates.top)}/`
      : ''
    return `https://res.cloudinary.com/${CLOUDINARY_NAME}/image/upload/${transformation}f_webp,q_auto/${publicId}`
  }

  // 上傳壓縮後的原圖
  const uploadOriginal = async (blob) => {
    const formData = new FormData()
    formData.append('file', blob)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'petpetni/avatars')

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        formData
      )
      return {
        publicId: res.data.public_id,
        url: res.data.secure_url // 這裡是上傳後的原圖網址
      }
    } catch {
      throw new Error('圖片上傳失敗')
    }
  }

  return {
    compressImage,
    uploadOriginal,
    getDynamicUrl
  }
}
