import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 載入 .env 環境變數 (相對於 backend/src/services/supabase.js，.env 在 backend/)
dotenv.config({ path: '../../.env' })

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
