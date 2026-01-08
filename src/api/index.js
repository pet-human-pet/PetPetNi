import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json' 
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // TODO:之後改useAuthStore取得。並或可在src/utils/constants.js定義 export const TOKEN_KEY ='auth_token'引用
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
    if (error.response?.status === 401) {
      console.warn('Token expired or unauthorized')
      // TODO: 之後這裡可以加導向登入頁或是哪裡的邏輯
    }
    return Promise.reject(error)
  }
)

export default api
