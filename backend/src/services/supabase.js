import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 1. 定位 .env 路徑 (從 src/services/supabase.js 往上兩層到 backend/.env)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../.env')

// 2. 載入環境變數
const result = dotenv.config({ path: envPath })
if (result.error) {
  console.error('❌ 無法載入 .env 檔案:', result.error)
}

const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || '').trim()

// 3. 診斷 Log
console.log('🔗 .env 路徑:', envPath)
console.log('🚀 Supabase URL:', supabaseUrl || '(未設定)')
console.log('🔑 Key 已設定:', supabaseKey ? '是' : '否')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤: SUPABASE_URL 或 SUPABASE_SERVICE_KEY 遺失！')
}

// 4. 初始化伺服器端 Client
export const supabase = createClient(supabaseUrl, supabaseKey)
