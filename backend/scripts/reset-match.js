// 重置配對資料腳本 (僅清除今日測試資料)
//
// 使用說明：
// 此腳本用於重置特定用戶在「今日」產生的配對紀錄與私聊房間，方便重複測試配對流程。
// 不會刪除該用戶的個人資料、寵物資料，也不會影響昨日以前建立的聊天室。
//
// 執行方式：
// 1. 開啟終端機 (Terminal)
// 2. 切換到專案根目錄
// 3. 執行以下指令 (將 user@example.com 替換為您的測試帳號 Email)：
//    npm run reset-match -- user@example.com

import { supabase } from '../src/services/supabase.js'

async function resetMatchData() {
  const targetEmail = process.argv[2]

  if (!targetEmail) {
    console.error('❌ 請提供要重置的用戶 Email')
    console.log('用法: npm run reset-match -- <user_email>')
    process.exit(1)
  }

  console.log(`🧹 準備重置用戶配對資料: ${targetEmail}...`)

  // 1. 根據 Email 找 user_id (Auth) -> user_id_int (Profiles)
  // 這裡假設我們可以直接從 profiles 表查 email (如果有的話)，或是先從 auth 查
  // 由於 profiles 表通常也會存 email，我們先試試看 profiles
  // 或是直接從 auth.users 查 id, 再去 profiles 查 user_id_int

  // 為了準確，先查 Auth
  const {
    data: { users },
    error: authError
  } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ 無法讀取用戶列表:', authError)
    return
  }

  const targetUser = users.find((u) => u.email === targetEmail)

  if (!targetUser) {
    console.error(`❌ 找不到 Email 為 ${targetEmail} 的用戶`)
    return
  }

  const userId = targetUser.id
  console.log(`🔍 Found Auth User ID: ${userId}`)

  // 查 Profiles 取得 user_id_int
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id_int')
    .eq('user_id', userId)
    .single()

  if (profileError || !profile) {
    console.error('❌ 找不到該用戶的 Profile 資料 (user_id_int)', profileError)
    return
  }

  const targetIdInt = profile.user_id_int
  console.log(`🎯 Target User Int ID: ${targetIdInt}`)

  // ============================================
  // 開始刪除 (僅限今日)
  // ============================================

  // 使用本地時間 (台灣時間) 計算 YYYY-MM-DD
  // 這樣能確保在凌晨 00:00 - 08:00 (UTC+8) 期間執行時，能夠正確刪除「今天」的資料
  const dateOptions = { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }
  const formatter = new Intl.DateTimeFormat('en-CA', dateOptions) // en-CA gives YYYY-MM-DD format
  const today = formatter.format(new Date())

  console.log(`📅 僅刪除 ${today} (Asia/Taipei) 之後建立的資料，保留舊歷史`)

  // 1. 刪除 match_history (今日)
  const { error: matchError, count: matchCount } = await supabase
    .from('match_history')
    .delete({ count: 'exact' })
    .or(`user_id_int.eq.${targetIdInt},partner_id_int.eq.${targetIdInt}`)
    .gte('created_at', today)

  if (matchError) {
    console.error('❌ 刪除 match_history 失敗:', matchError)
  } else {
    console.log(`✅ 已刪除 ${matchCount || 0} 筆今日配對歷史`)
  }

  // 2. 找出並刪除私聊房間 (今日建立的)
  const { data: chats, error: chatError } = await supabase
    .from('private_chat_pairs')
    .select('room_id')
    .or(`user_1_int.eq.${targetIdInt},user_2_int.eq.${targetIdInt}`)
    .gte('created_at', today)

  if (chatError) {
    console.error('❌ 查詢 private_chat_pairs 失敗:', chatError)
  } else if (chats && chats.length > 0) {
    const roomIds = chats.map((c) => c.room_id)
    console.log(`found ${roomIds.length} new private rooms to delete:`, roomIds)

    // chat_rooms 刪除會自動 cascade 刪除 participants 和 messages
    const { error: roomError, count: roomCount } = await supabase
      .from('chat_rooms')
      .delete({ count: 'exact' })
      .in('id', roomIds)

    if (roomError) {
      console.error('❌ 刪除 chat_rooms 失敗:', roomError)
    } else {
      console.log(`✅ 已刪除 ${roomCount} 個今日建立的私聊房間`)
    }
  } else {
    console.log('✨ 該用戶今日沒有建立新的私聊房間')
  }

  console.log('🎉 重置完成！您可以再次進行配對測試了。')
  console.log(
    '💡 提示：若前端仍顯示「今日已配對」，請在瀏覽器 Console (F12) 輸入 localStorage.clear() 或重新登入以清除快取。'
  )
}

resetMatchData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('💥 執行過程發生錯誤:', err)
    process.exit(1)
  })
