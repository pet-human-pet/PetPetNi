import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 載入 .env 環境變數 (相對於 backend/src/services/supabase.js，.env 在 backend/)
dotenv.config({ path: '../../.env' })

// 如果在 backend 下執行且 .env 在 backend 下，可以直接 .config()
// 但為了確保路徑正確，顯式標註或確保呼叫位置。
// 這裡用最保險的寫法：
dotenv.config()

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
