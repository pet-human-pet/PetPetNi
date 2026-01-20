// 清理測試用戶腳本
import { supabase } from '../src/services/supabase.js'

async function cleanupTestUsers() {
  console.log('🧹 開始清理測試用戶...')

  // 取得所有用戶
  const {
    data: { users },
    error
  } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('❌ 取得用戶列表失敗:', error)
    return
  }

  console.log(`📊 總共有 ${users.length} 個用戶`)

  // 篩選測試用戶（email 包含 @example.com）
  const testUsers = users.filter(
    (user) => user.email.includes('@example.com') && user.email !== 'testuser@example.com' // 保留固定的測試用戶
  )

  console.log(`🎯 找到 ${testUsers.length} 個測試用戶需要清理`)

  if (testUsers.length === 0) {
    console.log('✨ 沒有需要清理的測試用戶')
    return
  }

  // 刪除測試用戶
  let successCount = 0
  let failCount = 0

  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error) {
      console.error(`❌ 刪除用戶失敗 ${user.email}:`, error.message)
      failCount++
    } else {
      console.log(`✅ 已刪除: ${user.email}`)
      successCount++
    }
  }

  console.log('\n📊 清理結果:')
  console.log(`✅ 成功刪除: ${successCount} 個用戶`)
  console.log(`❌ 刪除失敗: ${failCount} 個用戶`)
  console.log(`🎉 清理完成！`)
}

cleanupTestUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('💥 清理過程發生錯誤:', err)
    process.exit(1)
  })
