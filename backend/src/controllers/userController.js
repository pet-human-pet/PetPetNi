import { supabase } from '../services/supabase.js'

const isValidPhone = (phone) => {
  const phoneRegex = /^09\d{8}$/
  return phoneRegex.test(phone)
}

const isValidPetType = (type) => {
  const validTypes = ['dog', 'cat', 'bird', 'other']
  return validTypes.includes(type)
}

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str
  return str.trim().slice(0, 100) // 限制長度
}

/**
 * 建立寵物標籤
 */
const createPetTags = async (petId, tags) => {
  if (!tags?.length) {
    return { success: true, count: 0 }
  }

  const tagsToInsert = tags.map((tag) => ({
    pet_id: petId,
    tag: sanitizeString(tag)
  }))

  const { error } = await supabase.from('pet_tags').insert(tagsToInsert)

  if (error) {
    console.error('❌ Tags 建立失敗:', error)
    return { success: false, error }
  }

  console.log(`✅ Tags 建立成功: ${tagsToInsert.length} 筆`)
  return { success: true, count: tagsToInsert.length }
}

// ========== Controller ==========

export const userController = {
  createProfile: async (req, res) => {
    try {
      console.log('📝 收到 createProfile 請求')

      // ========== 1. Token 驗證 ==========
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          error: '未提供授權 token',
          code: 'MISSING_TOKEN'
        })
      }

      const token = authHeader.split(' ')[1]
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        console.error('❌ Token 驗證失敗:', authError)
        return res.status(401).json({
          error: 'Token 無效或已過期',
          code: 'INVALID_TOKEN'
        })
      }

      console.log('👤 驗證成功，用戶 ID:', user.id)

      // ========== 2. 解構並清理輸入 ==========
      const { realName, nickName, phone, city, district, gender, pet, optionalTags } = req.body

      // ========== 3. 輸入驗證 ==========
      const errors = []

      // 個人資料驗證
      if (!realName?.trim()) errors.push('請提供真實姓名')
      if (!nickName?.trim()) errors.push('請提供暱稱')
      if (!phone) {
        errors.push('請提供手機號碼')
      } else if (!isValidPhone(phone)) {
        errors.push('手機號碼格式不正確')
      }

      // 寵物資料驗證
      if (!pet?.name?.trim()) errors.push('請提供寵物名稱')
      if (!pet?.type) {
        errors.push('請提供寵物類型')
      } else if (!isValidPetType(pet.type)) {
        errors.push('寵物類型不正確')
      }

      // optionalTags 驗證
      if (optionalTags !== undefined && !Array.isArray(optionalTags)) {
        errors.push('標籤格式不正確')
      }

      if (errors.length > 0) {
        console.warn('⚠️ 驗證失敗:', errors)
        return res.status(400).json({
          error: '輸入資料驗證失敗',
          code: 'VALIDATION_ERROR',
          details: errors
        })
      }

      // ========== 4. 檢查是否已完成 Onboarding ==========
      const { data: existingPet } = await supabase
        .from('pets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (existingPet) {
        console.warn('⚠️ 用戶已完成 Onboarding:', user.id)
        return res.status(409).json({
          error: '您已完成初始設定，請使用更新 API',
          code: 'ALREADY_ONBOARDED'
        })
      }

      // ========== 5. 建立 Profile ==========
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            real_name: sanitizeString(realName),
            nick_name: sanitizeString(nickName),
            phone: phone.trim(),
            city: city ? sanitizeString(city) : null,
            district: district ? sanitizeString(district) : null,
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
          code: 'PROFILE_CREATE_ERROR',
          details: profileError.message
        })
      }

      console.log('✅ Profile 建立成功:', profile.id)
      console.log('📊 User ID (UUID):', user.id)
      console.log('📊 User ID (Int):', profile.user_id_int)

      // ========== 6. 建立 Pet ==========
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .insert({
          user_id_int: profile.user_id_int, // 只使用自增 ID
          name: sanitizeString(pet.name),
          type: pet.type,
          breed: pet.breed ? sanitizeString(pet.breed) : null,
          birthday: pet.birthday || null,
          gender: pet.gender || null
        })
        .select()
        .single()

      if (petError) {
        console.error('❌ Pet 建立失敗:', petError)

        // 回滾：刪除已建立的 profile
        const { error: rollbackError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user.id)

        if (rollbackError) {
          console.error('⚠️ 回滾失敗:', rollbackError)
          // 可以記錄到錯誤追蹤系統（如 Sentry）
        }

        return res.status(400).json({
          error: '寵物資料建立失敗',
          code: 'PET_CREATE_ERROR',
          details: petError.message
        })
      }

      console.log('✅ Pet 建立成功:', petData.id)

      // ========== 7. 建立 Tags ==========
      const tagsResult = await createPetTags(petData.id, optionalTags)

      // Tags 失敗不中斷流程，但記錄在回應中
      const warnings = []
      if (!tagsResult.success) {
        warnings.push('標籤建立失敗，請稍後重試')
      }

      // ========== 8. 回傳成功結果 ==========
      console.log('🎉 Onboarding 完成:', user.email)

      res.status(201).json({
        success: true,
        message: 'Profile 建立成功',
        data: {
          profile,
          pet: petData,
          tagsCount: tagsResult.count || 0
        },
        ...(warnings.length > 0 && { warnings })
      })
    } catch (error) {
      console.error('❌ createProfile 發生未預期錯誤:', error)
      res.status(500).json({
        error: '伺服器錯誤，請稍後再試',
        code: 'INTERNAL_ERROR',
        // 僅在開發環境回傳詳細錯誤資訊，確保生產環境安全
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message
        })
      })
    }
  }
}
