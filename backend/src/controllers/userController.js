import { supabase } from '../services/supabase.js'

export const userController = {
  /**
   * 建立用戶完整 Profile（Onboarding 完成後呼叫）
   * POST /api/user/profile
   */
  createProfile: async (req, res) => {
    try {
      console.log('📝 收到 createProfile 請求:', JSON.stringify(req.body, null, 2))

      const {
        realName,
        nickName,
        phone,
        city,
        district,
        gender, // 新增：接收性別
        pet,
        optionalTags
      } = req.body

      // 1. 從 Authorization header 取得 token 並驗證
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供授權 token' })
      }

      const token = authHeader.split(' ')[1]
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        console.error('❌ Token 驗證失敗:', authError)
        return res.status(401).json({ error: 'Token 無效或已過期' })
      }

      console.log('👤 驗證成功，用戶 ID:', user.id)

      // 2. 驗證必填欄位
      if (!realName || !nickName || !phone) {
        console.warn('⚠️ 個人資料不完整:', { realName, nickName, phone })
        return res.status(400).json({ error: '請提供完整的個人資料' })
      }

      if (!pet || !pet.name || !pet.type) {
        console.warn('⚠️ 寵物資料不完整:', pet)
        return res.status(400).json({ error: '請提供完整的寵物資料' })
      }

      // 3. 建立 Profile (改用 upsert 避免重複錯誤)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            real_name: realName,
            nick_name: nickName,
            phone,
            city,
            district,
            // 如果是 'secret' (不透露) 則存為 null，否則存原本的值 (male/female)
            gender: gender === 'secret' ? null : gender
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single()

      if (profileError) {
        console.error('❌ Profile 建立失敗:', profileError)
        return res.status(400).json({
          error: '用戶資料建立失敗',
          details: profileError.message,
          hint: profileError.hint
        })
      }

      console.log('✅ Profile 建立/更新成功:', profile.id)

      // 4. 建立 Pet
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .insert({
          user_id: user.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed || null,
          birthday: pet.birthday || null,
          gender: pet.gender || null
        })
        .select()
        .single()

      if (petError) {
        console.error('❌ Pet 建立失敗:', petError)
        return res.status(400).json({
          error: '寵物資料建立失敗',
          details: petError.message,
          hint: petError.hint
        })
      }

      console.log('✅ Pet 建立成功:', petData.id)

      // 5. 建立 Tags (如果有)
      if (optionalTags && optionalTags.length > 0) {
        const tagsToInsert = optionalTags.map((tag) => ({
          pet_id: petData.id,
          tag: tag
        }))

        const { error: tagsError } = await supabase.from('pet_tags').insert(tagsToInsert)

        if (tagsError) {
          console.error('❌ Tags 建立失敗:', tagsError)
          // 不中斷流程，只記錄錯誤
        } else {
          console.log('✅ Tags 建立成功:', tagsToInsert.length)
        }
      }

      console.log('🎉 流程全部完成:', user.email)

      res.status(201).json({
        message: 'Profile 建立成功',
        profile,
        pet: petData
      })
    } catch (error) {
      console.error('❌ createProfile 發生未預期錯誤:', error)
      res.status(500).json({
        error: '伺服器錯誤，請稍後再試',
        details: error.message
      })
    }
  }
}
