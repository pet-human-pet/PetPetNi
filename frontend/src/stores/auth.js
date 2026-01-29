import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '@/api/auth'
import profileApi from '@/api/profile'
import { supabase } from '@/lib/supabase'
import { useNotificationStore } from '@/stores/notification'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const userIdInt = ref(null) // 用戶自增 ID（主要識別碼）
  const profile = ref(null) // 完整 Profile
  const pet = ref(null) // 寵物資料
  const tags = ref([]) // 寵物標籤
  const token = ref(null)
  const isLoading = ref(false)
  const isReady = ref(false) // 初始化狀態
  const error = ref(null)
  const tempOAuthData = ref(null)
  const hasPet = ref(false)

  // Getters
  const isPetOwner = computed(() => hasPet.value)
  const notificationStore = useNotificationStore()

  // Actions
  const initAuth = async () => {
    // 防止重複初始化
    if (isReady.value) return

    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken

      try {
        // 呼叫 API 驗證 token 並取得完整用戶資料
        // 改用 profileApi.getProfile 取代原本只取 header 的 authApi.getCurrentUser (如果後端有調整)
        // 但這裡我們直接呼叫新做的 profileApi.getProfile 來拿所有資訊
        const response = await profileApi.getProfile()
        const data = response.data.data // { user, profile, pet, tags }

        user.value = data.user
        profile.value = data.profile
        pet.value = data.pet
        tags.value = data.tags || []
        userIdInt.value = data.profile?.user_id_int
        hasPet.value = data.has_pet ?? !!data.pet

        if (userIdInt.value) {
          notificationStore.startRealtime(userIdInt.value)
        }
      } catch (err) {
        // Token 無效，清除狀態

        logout(false) // 傳入 false 代表不呼叫 API，只清本地
      }
    }
    isReady.value = true
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
      profile.value = null
      pet.value = null
      tags.value = []
      hasPet.value = false

      return response.data
    } catch (err) {
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

      // 嘗試取得完整 Profile
      try {
        const profileRes = await profileApi.getProfile()
        const data = profileRes.data.data

        profile.value = data.profile
        pet.value = data.pet
        tags.value = data.tags || []
        userIdInt.value = data.profile?.user_id_int

        hasPet.value = data.has_pet ?? !!data.pet

        if (userIdInt.value) {
          notificationStore.startRealtime(userIdInt.value)
        }
        return {
          ...response.data,
          needsRegistration: false
        }
      } catch (e) {
        // 如果抓不到 Profile，可能是還沒 Onboarding
        if (e.response?.status === 404) {
          return {
            ...response.data,
            needsRegistration: true
          }
        }
        throw e
      }
    } catch (err) {
      error.value = err.response?.data?.error || '登入失敗，請檢查帳號密碼'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (callApi = true) => {
    try {
      isLoading.value = true
      error.value = null

      if (callApi) {
        await authApi.logout()
      }
    } catch (err) {
      error.value = err.response?.data?.error || '登出失敗，請稍後再試'
    } finally {
      // 無論 API 成功或失敗，都清除本地狀態
      user.value = null
      userIdInt.value = null
      profile.value = null
      pet.value = null
      tags.value = []
      token.value = null
      hasPet.value = false
      localStorage.removeItem('token')
      notificationStore.stopRealtime()
      isLoading.value = false

      // 清除 LocalStorage (保留一些非用戶相關的設定如有需要，但目前全清最安全)
      localStorage.clear()

      // 重置其他 Store 狀態
      // 使用動態 import 避免 Circular Dependency (因為其他 Store 都依賴 Auth)
      import('@/stores/matching').then(({ useMatchingStore }) => {
        useMatchingStore().reset()
      })
      import('@/stores/chat').then(({ useChatStore }) => {
        useChatStore().clear()
      })
      import('@/stores/favorites').then(({ useFavoritesStore }) => {
        useFavoritesStore().clear()
      })
      import('@/stores/ai').then(({ useAIStore }) => {
        useAIStore().clear()
      })
    }
  }

  const clearError = () => {
    error.value = null
  }

  const setUserIdInt = (id) => {
    userIdInt.value = id
    if (userIdInt.value) {
      notificationStore.startRealtime(userIdInt.value)
    }
  }

  const setHasPet = (status) => {
    hasPet.value = status
  }

  // OAuth (TODO)
  const initiateOAuthLogin = (provider) => {
    // TODO: 之後實作
    alert(`${provider} 登入功能即將開放！`)
  }

  const handleOAuthCallback = async (code, provider) => {
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
      // 儲存 token
      token.value = session.access_token
      localStorage.setItem('token', token.value)

      // 儲存 user 資料
      user.value = {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      }

      // 嘗試取得完整 Profile
      try {
        const profileRes = await profileApi.getProfile()
        const data = profileRes.data.data

        profile.value = data.profile
        pet.value = data.pet
        tags.value = data.tags || []
        userIdInt.value = data.profile?.user_id_int
        hasPet.value = data.has_pet ?? !!data.pet

        if (userIdInt.value) {
          notificationStore.startRealtime(userIdInt.value)
        }
        router.push('/')
      } catch (e) {
        router.push({ name: 'login', query: { mode: 'role' } })
      }
    } catch (error) {}
  }

  /**
   * 檢查使用者是否已建立 profile
   * (保留給 login flow 判斷用，如果不走 getProfile 的話)
   */
  const checkProfileExists = async (userId) => {
    // 這裡其實可以 deprecated，因為我們現在都試著直接抓 profile
    // 但為了保持相容性先留著，或者讓它也呼叫 API?
    // 暫時維持原樣，但上面的流程已經改用 getProfile 判斷
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id_int')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return false
        throw error
      }
      if (data?.user_id_int) {
        userIdInt.value = data.user_id_int
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * 刷新 Profile (例如編輯後)
   */
  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile()
      const data = response.data.data

      user.value = data.user
      profile.value = data.profile
      pet.value = data.pet
      tags.value = data.tags || []
      userIdInt.value = data.profile?.user_id_int
      hasPet.value = data.has_pet ?? !!data.pet
      if (userIdInt.value) {
        notificationStore.startRealtime(userIdInt.value)
      }
    } catch (e) {}
  }

  return {
    user,
    userIdInt,
    profile,
    pet,
    tags,
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
    setHasPet,
    fetchProfile,
    isReady
  }
})
