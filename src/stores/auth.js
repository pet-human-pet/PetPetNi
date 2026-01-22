import { defineStore } from 'pinia'
import { ref } from 'vue'
import authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  //State
  const user = ref(null)
  const userIdInt = ref(null) // 用戶自增 ID（主要識別碼）
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const tempOAuthData = ref(null)

  // Actions
  const initAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken

      try {
        // 呼叫 API 驗證 token 並取得用戶資料
        const response = await authApi.getCurrentUser()
        user.value = response.data.user
        userIdInt.value = response.data.profile.user_id_int

        console.log('✅ Token 驗證成功，已恢復登入狀態')
      } catch {
        // Token 無效，清除狀態
        console.warn('⚠️ Token 無效或已過期，清除登入狀態')
        user.value = null
        userIdInt.value = null
        token.value = null
        localStorage.removeItem('token')
      }
    }
  }

  const register = async (email, password) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.register({ email, password })

      user.value = response.data.user
      token.value = response.data.session.access_token
      localStorage.setItem('token', token.value)

      // user_id_int 需在 profile 建立後才會有，先設為 null
      userIdInt.value = null

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

  const login = async (email, password) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.login({ email, password })

      user.value = response.data.user
      token.value = response.data.session.access_token
      localStorage.setItem('token', token.value)

      // TODO: 從 profile API 取得 user_id_int
      userIdInt.value = null

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

  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      await authApi.logout()
      console.log('✅ 登出成功')
    } catch (err) {
      console.error('❌ 登出失敗:', err)
      error.value = err.response?.data?.error || '登出失敗，請稍後再試'
    } finally {
      // 無論 API 成功或失敗，都清除本地狀態
      user.value = null
      userIdInt.value = null
      token.value = null
      localStorage.removeItem('token')
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const setUserIdInt = (id) => {
    userIdInt.value = id
    console.log('📊 已設定 User ID (Int):', id)
  }

  // OAuth (TODO)
  const initiateOAuthLogin = (provider) => {
    console.log(`[AuthStore] Initiating ${provider} login...`)
    // TODO: 之後實作
    alert(`${provider} 登入功能即將開放！`)
  }

  const handleOAuthCallback = async (code, provider) => {
    console.log(`[AuthStore] Handling OAuth callback for ${provider}`)
    // TODO: 之後實作
    return { status: 'NOT_IMPLEMENTED' }
  }

  const registerWithEmail = async (email) => {
    console.log('[AuthStore] Registering with email:', email)
    // TODO: 之後實作
  }

  return {
    user,
    userIdInt,
    token,
    isLoading,
    error,
    tempOAuthData,
    initAuth,
    register,
    login,
    logout,
    clearError,
    setUserIdInt,
    initiateOAuthLogin,
    handleOAuthCallback,
    registerWithEmail
  }
})
