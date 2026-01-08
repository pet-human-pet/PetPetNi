import axios from 'axios'

// 1.建立 axios 實體
// 建立一個專屬的api物件
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json' 
  }
})

// 2. Request Interceptor: 自動帶入 Token
// 每次發送請求前，這個函式都會被執行
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // 假設 Token 存在這裡，從localStorage 拿 Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } // 如果有Token，就把它貼在Header
    return config
  },
  (error) => Promise.reject(error)
)

// 3. Response Interceptor: 統一錯誤處理
// 每次收到後端的回應後，會先經過這裡
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expired or unauthorized')
      // TODO: 之後這裡可以加會導向登入頁或是哪裡的邏輯
    }
    return Promise.reject(error)
  }
)

export default api
