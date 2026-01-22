import { supabase } from '../services/supabase.js'

export const authController = {
  // ==========================================
  // 📝 註冊 API
  // ==========================================
  register: async (req, res) => {
    try {
      // 1. 取得參數
      const { email, password } = req.body

      // 2. 驗證必填欄位
      if (!email || !password) {
        return res.status(400).json({
          error: '請提供 email 和 password'
        })
      }

      // 3. 驗證 Email 格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Email 格式不正確'
        })
      }

      // 4. 驗證密碼長度
      if (password.length < 6) {
        return res.status(400).json({
          error: '密碼至少需要 6 個字元'
        })
      }

      // 5. 呼叫 Supabase Auth 註冊
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      // 6. 處理 Supabase 錯誤
      if (error) {
        console.error('❌ Supabase 註冊錯誤:', error)

        // 根據錯誤類型回傳不同訊息
        if (error.message.includes('already registered')) {
          return res.status(409).json({ error: '此 Email 已被註冊' })
        }

        return res.status(400).json({ error: error.message })
      }

      // 7. 成功回傳
      console.log('✅ 用戶註冊成功:', data.user.email)

      res.status(201).json({
        message: '註冊成功',
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      })
    } catch (error) {
      console.error('❌ 註冊 API 發生錯誤:', error)
      res.status(500).json({
        error: '伺服器錯誤，請稍後再試'
      })
    }
  },

  // ==========================================
  // 📝 登入 API
  // ==========================================
  login: async (req, res) => {
    try {
      // 1. 取得參數
      const { email, password } = req.body

      // 2. 驗證必填欄位
      if (!email || !password) {
        return res.status(400).json({
          error: '請提供 email 和 password'
        })
      }

      // 3. 呼叫 Supabase Auth 登入
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      // 4. 處理錯誤
      if (error) {
        console.error('❌ Supabase 登入錯誤:', error)
        return res.status(401).json({
          error: '帳號或密碼錯誤'
        })
      }

      // 5. 成功回傳
      console.log('✅ 用戶登入成功:', data.user.email)

      res.status(200).json({
        message: '登入成功',
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      })
    } catch (error) {
      console.error('❌ 登入 API 發生錯誤:', error)
      res.status(500).json({
        error: '伺服器錯誤，請稍後再試'
      })
    }
  },

  // ==========================================
  // 📝 登出 API（簡化版 - 只驗證 token）
  // ==========================================
  logout: async (req, res) => {
    try {
      // 1. 從 Authorization header 取得 token
      const authHeader = req.headers.authorization

      // 2. 驗證 token 是否存在
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: '未提供授權 token'
        })
      }

      // 3. 提取 token
      const parts = authHeader.split(' ')
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        // 如果格式不對，直接回傳 401 錯誤，告訴前端格式錯誤
        return res.status(401).json({ error: '授權 token 格式不正確' })
      }

      const token = parts[1]

      // 4. 驗證 token 是否有效
      const { data, error } = await supabase.auth.getUser(token)

      // 5. Token 無效，回傳 401
      if (error || !data.user) {
        console.error('❌ Token 驗證失敗:', error)
        return res.status(401).json({
          error: 'Token 無效或已過期'
        })
      }

      // 6. Token 有效，回傳成功（前端自己清除 localStorage）
      console.log('✅ 用戶登出成功:', data.user.email)

      res.status(200).json({
        message: '登出成功'
      })
    } catch (error) {
      console.error('❌ 登出 API 發生錯誤:', error)
      res.status(500).json({
        error: '伺服器錯誤，請稍後再試'
      })
    }
  },

  // ==========================================
  // 📝 取得當前用戶資料 API（用於驗證 token）
  // ==========================================
  getCurrentUser: async (req, res) => {
    try {
      // 1. 從 Authorization header 取得 token
      const authHeader = req.headers.authorization

      // 2. 驗證 token 是否存在
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: '未提供授權 token'
        })
      }

      // 3. 提取 token
      const token = authHeader.split(' ')[1]

      // 4. 驗證 token 並取得用戶資料
      const { data: authData, error: authError } = await supabase.auth.getUser(token)

      if (authError || !authData.user) {
        console.error('❌ Token 驗證失敗:', authError)
        return res.status(401).json({
          error: 'Token 無效或已過期'
        })
      }

      // 5. 從 profiles 表取得完整用戶資料（包含 user_id_int）
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError) {
        console.error('❌ 取得 profile 失敗:', profileError)
        return res.status(404).json({
          error: '找不到用戶資料'
        })
      }

      // 6. 成功回傳
      console.log('✅ 取得用戶資料成功:', authData.user.email)

      res.status(200).json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          created_at: authData.user.created_at
        },
        profile: {
          user_id_int: profile.user_id_int,
          nick_name: profile.nick_name,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          birthday: profile.birthday,
          gender: profile.gender
        }
      })
    } catch (error) {
      console.error('❌ 取得用戶資料 API 發生錯誤:', error)
      res.status(500).json({
        error: '伺服器錯誤，請稍後再試'
      })
    }
  }
}
