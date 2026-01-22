import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // ==========================================
  // State（狀態）
  // ==========================================
  const user = ref(null) // 用戶資料
  const token = ref(null) // JWT Token
  const isLoading = ref(false) // 載入狀態
  const error = ref(null) // 錯誤訊息

  // 暫存第三方登入資料（OAuth 用，暫時保留）
  const tempOAuthData = ref(null)

  // ==========================================
  // Actions（方法）
  // ==========================================

  /**
   * 初始化認證狀態
   * 從 localStorage 恢復登入狀態
   */
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // TODO: 可以呼叫 API 驗證 token 並取得用戶資料
      // 目前先簡單恢復 token
    }
  }

  /**
   * 用戶註冊
   * @param {string} email - Email
   * @param {string} password - 密碼
   */
  const register = async (email, password) => {
    try {
      isLoading.value = true
      error.value = null

      // 呼叫註冊 API
      const response = await authApi.register({ email, password })

      // 儲存用戶資料和 Token
      user.value = response.data.user
      token.value = response.data.session.access_token
      localStorage.setItem('token', token.value)

      console.log('✅ 註冊成功:', user.value.email)
      return response.data
    } catch (err) {
      console.error('❌ 註冊失敗:', err)
      error.value = err.response?.data?.error || '註冊失敗，請稍後再試'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用戶登入
   * @param {string} email - Email
   * @param {string} password - 密碼
   */
  const login = async (email, password) => {
    try {
      isLoading.value = true
      error.value = null

      // 呼叫登入 API
      const response = await authApi.login({ email, password })

      // 儲存用戶資料和 Token
      user.value = response.data.user
      token.value = response.data.session.access_token
      localStorage.setItem('token', token.value)

      console.log('✅ 登入成功:', user.value.email)
      return response.data
    } catch (err) {
      console.error('❌ 登入失敗:', err)
      error.value = err.response?.data?.error || '登入失敗，請檢查帳號密碼'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用戶登出
   */
  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      // 呼叫登出 API
      await authApi.logout()

      // 清除本地狀態
      user.value = null
      token.value = null
      localStorage.removeItem('token')

      console.log('✅ 登出成功')
    } catch (err) {
      console.error('❌ 登出失敗:', err)
      error.value = err.response?.data?.error || '登出失敗，請稍後再試'
      // 即使 API 失敗，也要清除本地狀態
      user.value = null
      token.value = null
      localStorage.removeItem('token')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清除錯誤訊息
   */
  const clearError = () => {
    error.value = null
  }

  // ==========================================
  // OAuth 相關（暫時保留，之後實作）
  // ==========================================

  /**
   * 發起 OAuth 登入
   * TODO: 整合真實的 OAuth API
   */
  const initiateOAuthLogin = (provider) => {
    console.log(`[AuthStore] Initiating ${provider} login...`)
    // TODO: 之後實作
    alert(`${provider} 登入功能即將開放！`)
  }

  /**
   * 處理 OAuth Callback
   * TODO: 整合真實的 OAuth API
   */
  const handleOAuthCallback = async (code, provider) => {
    console.log(`[AuthStore] Handling OAuth callback for ${provider}`)
    // TODO: 之後實作
    return { status: 'NOT_IMPLEMENTED' }
  }

  /**
   * Email 註冊（OAuth 用）
   * TODO: 整合真實的 OAuth API
   */
  const registerWithEmail = async (email) => {
    console.log('[AuthStore] Registering with email:', email)
    // TODO: 之後實作
  }

  // ==========================================
  // 暴露給外部使用
  // ==========================================
  return {
    // State
    user,
    token,
    isLoading,
    error,
    tempOAuthData,

    // Actions
    initAuth,
    register,
    login,
    logout,
    clearError,

    // OAuth (暫時保留)
    initiateOAuthLogin,
    handleOAuthCallback,
    registerWithEmail
  }
})
