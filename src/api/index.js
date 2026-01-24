import axios from 'axios'
import { useToast } from '@/composables/useToast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { error: showError } = useToast()

    if (error.response) {
      // 伺服器有回應，但狀態碼不在 2xx 範圍
      const status = error.response.status
      const message = error.response.data?.message || '發生錯誤，請稍後再試'

      switch (status) {
        case 401:
          // TODO: 處理登出或導向登入
          showError('請先登入')
          localStorage.removeItem('token')
          // 如果有 router 可以在這裡做 redirect
          break
        case 403:
          showError('您沒有權限執行此操作')
          break
        case 404:
          showError('找不到請求的資源')
          break
        case 429:
          showError('請求太頻繁，請稍後再試')
          break
        case 500:
          showError('伺服器內部錯誤')
          break
        default:
          showError(message)
      }
    } else if (error.request) {
      showError('網路連線異常，請檢查您的網路')
    } else {
      showError('請求發生錯誤')
    }

    return Promise.reject(error)
  }
)

export default api
