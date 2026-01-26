import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  const hasPet = ref(false)

  // Getters
  const isPetOwner = computed(() => hasPet.value)

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
        hasPet.value = response.data.has_pet || false

        console.log('✅ Token 驗證成功，已恢復登入狀態')
      } catch {
        // Token 無效，清除狀態
        console.warn('⚠️ Token 無效或已過期，清除登入狀態')
        user.value = null
        userIdInt.value = null
        token.value = null
        hasPet.value = false
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
      hasPet.value = false

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

      // 如果有 profile，重新 fetch 一次 getCurrentUser 以取得完整資訊包含 hasPet
      // 或者後端 login API 也應該回傳 hasPet (但目前只改了 getCurrentUser)
      // 為了保險起見，這裡可以呼叫 initAuth 或手動 fetch
      await initAuth()

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
      hasPet.value = false
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

  const setHasPet = (status) => {
    hasPet.value = status
  }

  // OAuth (TODO)
  const initiateOAuthLogin = (provider) => {
    console.log(`[AuthStore] Initiating ${provider} login...`)
    // TODO: 之後實作
    alert(`${provider} 登入功能即將開放！`)
  }

  const handleOAuthCallback = async (code, provider) => {
    console.log(`[AuthStore] Handling callback with code: ${code}`)

    return new Promise((resolve) => {
      setTimeout(() => {
        // 模擬：隨機決定是「新用戶」還是「老用戶」
        // 這裡為了演示 Onboarding 流程，我們強制模擬為「新用戶」
        const isNewUser = true

        if (isNewUser) {
          // 新用戶：存入暫存資料，準備引導註冊
          tempOAuthData.value = {
            provider,
            email: 'test_user@example.com',
            name: 'Test OAuth User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
          }
          resolve({ status: 'NEW_USER' })
        } else {
          // 老用戶：直接登入成功
          token.value = 'mock_jwt_token'
          user.value = {
            id: '86367eb0-40bb-41a3-b937-f36079845ff1',
            name: 'Old User',
            role: 'OWNER'
          }
          resolve({ status: 'SUCCESS' })
        }
      }, 1500) // 模擬網路延遲
    })
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
    checkProfileExists,
    hasPet,
    isPetOwner,
    setHasPet
  }
})
