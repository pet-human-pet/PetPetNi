// ==========================================
// Auth API 測試案例
// ==========================================
// 使用 TDD 方式開發認證功能：
// 1. 先寫測試（會失敗 🔴）
// 2. 實作程式碼讓測試通過（🟢）
// 3. 重構優化（🔵）

import request from 'supertest'
import express from 'express'
import authRoutes from '../src/routes/auth.js'

// 建立測試用的 Express app
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

// ==========================================
// 測試群組 1：註冊 API
// ==========================================
describe('POST /api/auth/register', () => {
  it('應該成功註冊新用戶並回傳 201', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `newuser${Date.now()}@example.com`, // 使用時間戳避免重複
        password: 'Test123!@#'
      })

    // 驗證狀態碼
    expect(response.status).toBe(201)

    // 驗證回傳資料結構
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('session')

    // 驗證 user 物件
    expect(response.body.user).toHaveProperty('id')
    expect(response.body.user).toHaveProperty('email')
    expect(response.body.user).toHaveProperty('created_at')

    // 驗證 session 物件
    expect(response.body.session).toHaveProperty('access_token')
    expect(response.body.session).toHaveProperty('refresh_token')
  })

  // ❌ 測試案例 2：缺少 email
  it('缺少 email 應該回傳 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      password: 'Test123!@#'
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toMatch(/email/i)
  })

  // ❌ 測試案例 3：缺少 password
  it('缺少 password 應該回傳 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com'
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toMatch(/password/i)
  })

  // ❌ 測試案例 4：Email 格式錯誤
  it('Email 格式錯誤應該回傳 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'invalid-email',
      password: 'Test123!@#'
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/Email.*格式/i)
  })

  // ❌ 測試案例 5：密碼太短
  it('密碼少於 6 個字應該回傳 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123'
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/密碼.*6/i)
  })

  // ❌ 測試案例 6：Email 已存在（會真的測試 Supabase）
  it('重複註冊同一個 email 應該回傳 409', async () => {
    const testEmail = `duplicate${Date.now()}@example.com`

    // 第一次註冊（應該成功）
    await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'Test123!@#'
    })

    // 第二次註冊（應該失敗）
    const response = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'Test123!@#'
    })

    expect(response.status).toBe(409)
    expect(response.body.error).toMatch(/已.*註冊|already/i)
  })
})

// ==========================================
// 測試群組 2：登入 API
// ==========================================
describe('POST /api/auth/login', () => {
  // 測試用的用戶資料（使用已存在的用戶）
  const testUser = {
    email: 'testuser@example.com',
    password: 'Test123!@#'
  }

  // ✅ 測試案例 1：成功登入
  it('使用正確的帳密應該成功登入並回傳 200', async () => {
    const response = await request(app).post('/api/auth/login').send(testUser)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('session')
    expect(response.body.user.email).toBe(testUser.email)
  })

  // ❌ 測試案例 2：密碼錯誤
  it('密碼錯誤應該回傳 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123'
    })

    expect(response.status).toBe(401)
    expect(response.body.error).toMatch(/密碼|帳號|incorrect|invalid/i)
  })

  // ❌ 測試案例 3：用戶不存在
  it('用戶不存在應該回傳 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'notexist@example.com',
      password: 'Test123!@#'
    })

    expect(response.status).toBe(401)
    expect(response.body.error).toMatch(/密碼|帳號|incorrect|invalid/i)
  })

  // ❌ 測試案例 4：缺少必填欄位
  it('缺少 email 應該回傳 400', async () => {
    const response = await request(app).post('/api/auth/login').send({
      password: 'Test123!@#'
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/email/i)
  })

  it('缺少 password 應該回傳 400', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/password/i)
  })
})

// ==========================================
// 測試群組 3：登出 API
// ==========================================
describe('POST /api/auth/logout', () => {
  let authToken = null
  const testUser = {
    email: `logout${Date.now()}@example.com`,
    password: 'Test123!@#'
  }

  // 在登出測試前，先註冊並登入取得 token
  beforeAll(async () => {
    // 註冊
    await request(app).post('/api/auth/register').send(testUser)

    // 登入取得 token
    const loginResponse = await request(app).post('/api/auth/login').send(testUser)

    authToken = loginResponse.body.session.access_token
  })

  // ✅ 測試案例 1：成功登出
  it('帶正確 token 應該成功登出並回傳 200', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body.message).toMatch(/登出|logout/i)
  })

  // ❌ 測試案例 2：缺少 token
  it('沒有提供 token 應該回傳 401', async () => {
    const response = await request(app).post('/api/auth/logout')

    expect(response.status).toBe(401)
    expect(response.body.error).toMatch(/token|授權|未登入/i)
  })

  // ❌ 測試案例 3：無效的 token
  it('提供無效的 token 應該回傳 401', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer invalid_token_123')

    expect(response.status).toBe(401)
    expect(response.body.error).toMatch(/token|無效|invalid/i)
  })
})
