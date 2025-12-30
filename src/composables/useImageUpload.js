import imageCompression from 'browser-image-compression'
import axios from 'axios'

/* 圖片上傳：負責壓縮 +上傳到 Cloudinary */
export const useImageUpload = () => {
  const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  const CLOUDINARY_FOLDER = 'petpetni/social' //上傳的雲端資料夾

  /* 1.壓縮圖片 
   輸入: 原始檔案 (File)
   輸出: 壓縮後的檔案資料 (包含 Blob 和大小資訊) */
  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 1.0,
        maxWidthOrHeight: 1920, // 解析度最長邊不超過1920px
        useWebWorker: true, // 使用背景執行緒，避免網頁卡頓
        fileType: 'image/jpeg', // 格式統一轉成JPG
        initialQuality: 0.8 // 畫質保留80%品質
      }

      const compressed = await imageCompression(file, options) // 呼叫套件開始壓縮，因耗時所以用await

      return {
        blob: compressed, // 壓縮後的檔案實體 (二進位資料)
        sizeKB: Math.round(compressed.size / 1024),
        originalSizeKB: Math.round(file.size / 1024)
      }
    } catch {
      throw new Error('圖片壓縮失敗')
    }
  }

  /* 2.上傳到 Cloudinary
   輸入: blob要上傳的檔案、onProgress每當上傳進度更新時呼叫它
   輸出: Cloudinary 回傳的網址資訊 */
  const uploadToCloudinary = async (blob, onProgress) => {
    const formData = new FormData() 
    // 準備一個虛擬表單，是上傳檔案的標準包裹格式
    formData.append('file', blob) // 把檔案放進去
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET) // 把鑰匙放進去
    formData.append('folder', CLOUDINARY_FOLDER) // 指定資料夾

    try {
      // Cloudinary的API不走後端，所以直接用axios而非api實體
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => { // Axios內建的進度監聽器
            if (progressEvent.total && onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(percent)
            } // 如有傳入onProgress函式，且知道總檔案大小，算出百分比，呼叫外部傳進來的函式顯示現在百分比
          }
        }
      )

      return {
        url: res.data.secure_url,
        publicId: res.data.public_id, // 圖片ID(以後要刪可用)
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
