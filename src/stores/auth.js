import { defineStore } from 'pinia'
import { ref } from 'vue'
import authApi from '@/api/auth'
import { supabase } from '@/lib/supabase'
import router from '@/router'

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

      console.log('✅ 登入成功:', user.value.email)

      // 檢查是否已建立 profile
      const hasProfile = await checkProfileExists(response.data.user.id)

      if (!hasProfile) {
        console.log('⚠️ 尚未建立 profile，需要完成註冊流程')
        // 回傳狀態，讓前端知道需要導向註冊流程
        return {
          ...response.data,
          needsRegistration: true
        }
      }

      console.log('✅ 已有 profile，登入完成')
      return {
        ...response.data,
        needsRegistration: false
      }
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

  // ==========================================
  // Supabase OAuth 處理
  // ==========================================

  /**
   * 處理 Supabase OAuth session
   * 檢查使用者是否已建立 profile，決定導向註冊流程或首頁
   */
  const handleSupabaseSession = async (session) => {
    try {
      console.log('[AuthStore] 處理 Supabase session')

      // 儲存 token
      token.value = session.access_token
      localStorage.setItem('token', token.value)

      // 儲存 user 資料
      user.value = {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      }

      // 檢查是否已建立 profile
      const hasProfile = await checkProfileExists(session.user.id)

      if (hasProfile) {
        console.log('✅ 已有 profile，登入成功')
        // 導向首頁
        router.push('/')
      } else {
        console.log('⚠️ 尚未建立 profile，導向註冊流程')
        // 導向角色選擇頁面
        router.push({ name: 'login', query: { mode: 'role' } })
      }
    } catch (error) {
      console.error('❌ 處理 Supabase session 失敗:', error)
      throw error
    }
  }

  /**
   * 檢查使用者是否已建立 profile
   */
  const checkProfileExists = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id_int')
        .eq('user_id', userId)
        .single()

      if (error) {
        // 如果是 PGRST116 錯誤（找不到資料），代表尚未建立 profile
        if (error.code === 'PGRST116') {
          return false
        }
        throw error
      }

      // 若有資料，儲存 user_id_int
      if (data?.user_id_int) {
        userIdInt.value = data.user_id_int
        return true
      }

      return false
    } catch (error) {
      console.error('❌ 檢查 profile 失敗:', error)
      return false
    }
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
    registerWithEmail,
    handleSupabaseSession,
    checkProfileExists
  }
})
