// ==========================================
// 認證 API 封裝
// ==========================================
// 這個檔案封裝所有認證相關的 API 呼叫
// 使用 axios instance (已設定好攔截器)

import api from './index'

/**
 * 認證 API
 */
export const authApi = {
  /**
   * 用戶註冊
   * @param {Object} data - 註冊資料
   * @param {string} data.email - Email
   * @param {string} data.password - 密碼
   * @returns {Promise} API 回應
   */
  register(data) {
    return api.post('/auth/register', data)
  },

  /**
   * 用戶登入
   * @param {Object} data - 登入資料
   * @param {string} data.email - Email
   * @param {string} data.password - 密碼
   * @returns {Promise} API 回應
   */
  login(data) {
    return api.post('/auth/login', data)
  },

  /**
   * 用戶登出
   * @returns {Promise} API 回應
   */
  logout() {
    return api.post('/auth/logout')
  }
}

export default authApi
