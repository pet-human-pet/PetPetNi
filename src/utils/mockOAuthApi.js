// Mock OAuth API for development
// 這個檔案提供開發環境的 Mock API，用於測試 OAuth 流程

/**
 * Mock Discord OAuth URL 生成
 * 實際應該呼叫: GET /api/auth/discord/url
 */
export const getMockDiscordOAuthUrl = () => {
  const state = generateRandomState()

  // 在實際環境中，這會返回 Discord 的授權 URL
  // 開發環境可以返回一個 Mock URL，重定向回本地
  return {
    authUrl: `http://localhost:5173/auth/discord/callback?code=mock_discord_code&state=${state}`,
    state
  }
}

/**
 * Mock Google OAuth URL 生成
 * 實際應該呼叫: GET /api/auth/google/url
 */
export const getMockGoogleOAuthUrl = () => {
  const state = generateRandomState()

  return {
    authUrl: `http://localhost:5173/auth/google/callback?code=mock_google_code&state=${state}`,
    state
  }
}

/**
 * Mock OAuth Callback 處理
 * 實際應該呼叫: GET /api/auth/{provider}/callback?code=xxx&state=xxx
 *
 * @param {string} provider - 'discord' 或 'google'
 * @param {string} code - OAuth 授權碼
 * @param {string} state - CSRF 防護 token
 */
export const mockOAuthCallback = async (provider, code, state) => {
  // 模擬 API 延遲
  await delay(1000)

  // 模擬隨機決定是新使用者還是現有使用者
  const isNewUser = Math.random() > 0.5

  if (isNewUser) {
    // 新使用者需要綁定 Email
    return {
      needBindEmail: true,
      tempToken: generateMockTempToken(provider)
    }
  } else {
    // 現有使用者直接返回 JWT Token
    return {
      needBindEmail: false,
      token: generateMockJWT()
    }
  }
}

/**
 * Mock Email 綁定
 * 實際應該呼叫: POST /api/auth/bind-email
 *
 * @param {string} tempToken - 臨時 Token
 * @param {string} email - 用戶 Email
 */
export const mockBindEmail = async (tempToken, email) => {
  // 模擬 API 延遲
  await delay(800)

  // 驗證 tempToken 格式
  if (!tempToken || !tempToken.startsWith('temp_')) {
    throw new Error('Invalid temporary token')
  }

  // 驗證 Email 格式
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format')
  }

  return {
    success: true,
    token: generateMockJWT(),
    needsOnboarding: true
  }
}

// ==================== Helper Functions ====================

/**
 * 生成隨機 State 參數（CSRF 防護）
 */
function generateRandomState() {
  return 'state_' + Math.random().toString(36).substring(2, 15)
}

/**
 * 生成 Mock 臨時 Token
 */
function generateMockTempToken(provider) {
  return `temp_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 生成 Mock JWT Token
 */
function generateMockJWT() {
  // 實際 JWT 格式: header.payload.signature
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      userId: Math.floor(Math.random() * 10000),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 天後過期
    })
  )
  const signature = Math.random().toString(36).substring(2, 15)

  return `${header}.${payload}.${signature}`
}

/**
 * 延遲函數（模擬網路延遲）
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==================== 使用範例 ====================

/*
// 在 LoginForm.vue 或 RegisterForm.vue 中使用：

import { getMockDiscordOAuthUrl, getMockGoogleOAuthUrl } from '@/utils/mockOAuthApi'

const handleSocialLogin = async (provider) => {
  try {
    // 開發環境使用 Mock API
    if (import.meta.env.DEV) {
      const mockApi = provider === 'discord' ? getMockDiscordOAuthUrl : getMockGoogleOAuthUrl
      const { authUrl } = mockApi()
      window.location.href = authUrl
      return
    }
    
    // 生產環境呼叫真實 API
    const response = await fetch(`/api/auth/${provider}/url`, {
      method: 'GET',
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Failed to get OAuth URL')
    const data = await response.json()
    window.location.href = data.authUrl
  } catch (error) {
    console.error('Social login error:', error)
    alert('第三方登入失敗，請稍後再試')
  }
}
*/

/*
// 在 OAuthCallback.vue 中使用：

import { mockOAuthCallback } from '@/utils/mockOAuthApi'

onMounted(async () => {
  const { code, state, error } = route.query
  const provider = route.params.provider
  
  try {
    // 開發環境使用 Mock API
    if (import.meta.env.DEV) {
      const data = await mockOAuthCallback(provider, code, state)
      // 處理回應...
      return
    }
    
    // 生產環境呼叫真實 API
    const response = await fetch(`/api/auth/${provider}/callback?code=${code}&state=${state}`, {
      method: 'GET',
      credentials: 'include'
    })
    // 處理回應...
  } catch (error) {
    // 錯誤處理...
  }
})
*/

/*
// 在 SocialBindEmail.vue 中使用：

import { mockBindEmail } from '@/utils/mockOAuthApi'

const handleBind = async () => {
  try {
    // 開發環境使用 Mock API
    if (import.meta.env.DEV) {
      const data = await mockBindEmail(tempToken.value, email.value)
      localStorage.setItem('token', data.token)
      emit('success')
      return
    }
    
    // 生產環境呼叫真實 API
    const response = await fetch('/api/auth/bind-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: tempToken.value,
        email: email.value
      })
    })
    // 處理回應...
  } catch (error) {
    // 錯誤處理...
  }
}
*/
