import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)

  // 暫存第三方登入回傳的資料 (尚未綁定的新用戶)
  const tempOAuthData = ref(null)

  // Actions

  /**
   * 模擬發起 OAuth 登入
   * 實際專案會跳轉至後端 API: /api/auth/google
   */
  const initiateOAuthLogin = (provider) => {
    console.log(`[AuthStore] Initiating ${provider} login...`)
    // 模擬跳轉至 Callback 頁面 (帶上假的 code)
    const mockCode = `mock_code_${Date.now()}`
    window.location.href = `/auth/callback?code=${mockCode}&provider=${provider}`
  }

  /**
   * 處理 OAuth Callback
   * 模擬後端驗證 Code 並決定流程
   */
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
            id: 1,
            name: 'Old User',
            role: 'OWNER'
          }
          resolve({ status: 'SUCCESS' })
        }
      }, 1500) // 模擬網路延遲
    })
  }

  /**
   * 完成手機綁定，正式註冊
   */
  const registerWithPhone = async (phone) => {
    console.log('[AuthStore] Registering with phone:', phone)
    if (!tempOAuthData.value) {
      throw new Error('No OAuth data found')
    }

    // 模擬註冊 API
    return new Promise((resolve) => {
      setTimeout(() => {
        // 註冊成功，寫入用戶狀態
        user.value = {
          ...tempOAuthData.value,
          phone,
          role: 'PENDING' // 等待選擇身分
        }
        // 清除暫存
        tempOAuthData.value = null
        token.value = 'new_user_token'

        resolve()
      }, 1000)
    })
  }

  return {
    user,
    token,
    tempOAuthData,
    initiateOAuthLogin,
    handleOAuthCallback,
    registerWithPhone
  }
})
