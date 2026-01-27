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

// 建立寵物標籤
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
      const { realName, nickName, phone, city, district, gender, pet, optionalTags, avatarUrl } =
        req.body
      console.log('📦 createProfile body:', req.body)

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
            gender: gender === 'secret' ? null : gender,
            avatar_url: avatarUrl || null
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

      console.log('✅ Profile 建立成功，ID:', profile.id)
      console.log('📊 User ID (Int):', profile.user_id_int)

      // ========== 5.1 處理頭像關聯 (New!) ==========
      if (avatarUrl) {
        try {
          console.log('🖼️ 正在建立頭像紀錄:', avatarUrl)
          // 1. 在 images 表尋找或新增
          const { data: imgData, error: imgError } = await supabase
            .from('images')
            .upsert({ url: avatarUrl, folder: 'avatars' }, { onConflict: 'url' })
            .select('id')
            .single()

          if (imgError) {
            console.error('⚠️ images 表寫入失敗:', imgError.message)
          } else if (imgData) {
            console.log('📸 圖片 ID:', imgData.id)
            // 2. 建立 profile_images 關聯
            const { error: relError } = await supabase.from('profile_images').insert({
              profile_id: profile.id,
              image_id: imgData.id,
              is_current: true
            })
            if (relError) {
              console.error('⚠️ profile_images 關聯失敗:', relError.message)
            } else {
              console.log('✅ 頭像中間表建立成功')
            }
          }
        } catch (err) {
          console.error('⚠️ 頭像階段發生非預期錯誤:', err.message)
        }
      }

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

        // 回滾：刪除已建立的相關資料
        const rollbackPromises = [supabase.from('profiles').delete().eq('user_id', user.id)]

        // 如果建立了頭像關聯，也一併回滾
        if (avatarUrl) {
          rollbackPromises.push(
            supabase.from('profile_images').delete().eq('profile_id', profile.id)
          )
        }

        const results = await Promise.allSettled(rollbackPromises)
        results.forEach((res, idx) => {
          if (res.status === 'rejected') {
            console.error(`⚠️ 回滾項 ${idx} 失敗:`, res.reason)
          }
        })

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
  },

  // 更新個人檔案 API (含寵物與標籤)
  updateProfile: async (req, res) => {
    try {
      // 1. Token 驗證
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供授權 token' })
      }

      const token = authHeader.split(' ')[1]
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return res.status(401).json({ error: 'Token 無效或已過期' })
      }

      // 2. 解構輸入
      const { realName, nickname, phone, city, district, gender, pet, optionalTags } = req.body
      const nickName = req.body.nickName || nickname
      const avatarUrl = req.body.avatarUrl || req.body.avatar_url
      console.log('📦 updateProfile body:', JSON.stringify(req.body, null, 2))
      console.log('🖼️ avatarUrl resolved:', avatarUrl)

      // 3. 輸入驗證 (簡單版，與 createProfile 類似)
      // 注意：這裡假設更新時會傳完整資料，或是部分更新
      // 為簡化邏輯，我們假設前端會傳送需要更新的欄位

      // 4. 更新 Profile
      const updateData = {
        updated_at: new Date().toISOString() // 手動補上時間格式，確保 Supabase 認得是 1/27
      }
      if (realName !== undefined) updateData.real_name = sanitizeString(realName)
      if (nickName !== undefined) updateData.nick_name = sanitizeString(nickName)
      if (phone !== undefined) updateData.phone = phone.trim()
      if (city !== undefined) updateData.city = sanitizeString(city)
      if (district !== undefined) updateData.district = sanitizeString(district)
      if (gender !== undefined) updateData.gender = gender === 'secret' ? null : gender
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl

      let profile = null

      if (Object.keys(updateData).length > 1) {
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          console.error('❌ profiles 表更新發生 Supabase 錯誤:', error.message)
          throw error
        }

        if (!data) {
          console.error('⚠️ 警告: profiles 表沒有更新任何資料！請檢查 User UUID。')
          return res.status(404).json({ error: '找不到對應的使用者資料進行更新' })
        }

        profile = data
      } else {
        // 如果沒更新 profile，先查出來以便後續使用 (例如 user_id_int)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        profile = data
      }

      // 5.1 處理頭像關聯更新
      if (avatarUrl) {
        try {
          // 採納 Yuna 建議：存入紀錄表前移除裁切參數 (c_crop...)
          // 這樣同一個原始圖片檔案就不會因為裁切範圍不同而產生多筆紀錄
          const sanitizedUrl = avatarUrl.replace(/\/c_crop[^/]+\//, '/')

          // 1. 在 images 表尋找或新增 (使用過濾後的原始網址)
          const { data: imgData, error: imgError } = await supabase
            .from('images')
            .upsert({ url: sanitizedUrl, folder: 'avatars' }, { onConflict: 'url' })
            .select('id')
            .single()

          if (imgError) {
            console.error('⚠️ images 表更新失敗:', imgError.message)
          } else if (imgData) {
            // 2. 將舊的頭像關聯設為非當前
            await supabase
              .from('profile_images')
              .update({ is_current: false })
              .eq('profile_id', profile.id)
              .eq('is_current', true)

            // 3. 建立新的 profile_images 關聯
            const { error: relError } = await supabase.from('profile_images').insert({
              profile_id: profile.id,
              image_id: imgData.id,
              is_current: true
            })

            if (relError) {
              // RLS 錯誤 (42501) 僅記錄警告，不中斷主程序
              if (relError.code === '42501') {
                console.warn('⚠️ profile_images 寫入受限 (RLS)，但 profiles 主表已成功更新')
              } else {
                console.error('⚠️ profile_images 更新失敗:', relError.message)
              }
            } else {
              console.log('✅ 頭像關聯表更新成功')
            }
          }
        } catch (err) {
          console.error('⚠️ 處理圖片關聯時發生非預期錯誤:', err.message)
        }
      }

      // 5. 更新 Pet
      let petData = null
      if (pet) {
        const petUpdateData = {}
        if (pet.name !== undefined) petUpdateData.name = sanitizeString(pet.name)
        if (pet.type !== undefined) petUpdateData.type = pet.type
        if (pet.breed !== undefined) petUpdateData.breed = sanitizeString(pet.breed)
        if (pet.birthday !== undefined) petUpdateData.birthday = pet.birthday || null
        if (pet.gender !== undefined) petUpdateData.gender = pet.gender || null

        if (Object.keys(petUpdateData).length > 0) {
          const { data, error } = await supabase
            .from('pets')
            .update(petUpdateData)
            .eq('user_id_int', profile.user_id_int)
            .select()
            .single()

          if (error) {
            console.error('Pet Update Error:', error)
            // 如果找不到 pet (可能還沒建立?)，嘗試建立?
            // 這裡假設 createProfile 已經建立過 pet
          } else {
            petData = data
          }
        }
      }

      // 確保取得 petData (為了更新 tags)
      if (!petData) {
        const { data } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id_int', profile.user_id_int)
          .single()
        petData = data
      }

      // 6. 更新 Tags (全刪全建)
      let finalTags = []
      if (optionalTags !== undefined && Array.isArray(optionalTags) && petData) {
        console.log(`🏷️ 正在更新標籤, PetID: ${petData.id}, 數量: ${optionalTags.length}`)
        // 刪除舊 tags
        await supabase.from('pet_tags').delete().eq('pet_id', petData.id)

        // 建立新 tags
        const tagsResult = await createPetTags(petData.id, optionalTags)
        if (tagsResult.success) {
          finalTags = optionalTags
          console.log('✅ 標籤更新完成')
        } else {
          console.error('❌ 標籤更新失敗:', tagsResult.error)
          // 嘗試讀取現有的
          const { data: currentTags } = await supabase
            .from('pet_tags')
            .select('tag')
            .eq('pet_id', petData.id)
          finalTags = (currentTags || []).map((t) => t.tag)
        }
      } else {
        // 如果沒更新 tags，也把現有的抓出來
        const { data: currentTags } = await supabase
          .from('pet_tags')
          .select('tag')
          .eq('pet_id', petData.id)
        finalTags = (currentTags || []).map((t) => t.tag)
      }

      res.json({
        success: true,
        message: '個人資料更新成功',
        data: {
          profile,
          pet: petData,
          tags: finalTags
        }
      })
    } catch (error) {
      console.error('❌ updateProfile 錯誤:', error)
      res.status(500).json({ error: '更新失敗，請稍後再試' })
    }
  },

  // 取得個人檔案 API
  getProfile: async (req, res) => {
    try {
      // 1. Token 驗證
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未提供授權 token' })
      }

      const token = authHeader.split(' ')[1]
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return res.status(401).json({ error: 'Token 無效或已過期' })
      }

      // 2. 查詢 Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*') // 已包含 role
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        return res.status(404).json({ error: '找不到使用者資料' })
      }

      // 3. 查詢 Pet & Tags
      // 先找寵物
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id_int', profile.user_id_int)
        .single()

      let tags = []
      if (pet) {
        // 如果有寵物，再找標籤
        const { data: petTags, error: tagsError } = await supabase
          .from('pet_tags')
          .select('tag')
          .eq('pet_id', pet.id)

        if (!tagsError && petTags) {
          tags = petTags.map((t) => t.tag)
        }
      }

      // 4. 回傳組合後的資料
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email
          },
          profile,
          pet,
          tags
        }
      })
    } catch (error) {
      console.error('❌ getProfile 錯誤:', error)
      res.status(500).json({ error: '伺服器錯誤' })
    }
  },

  // 取得其他用戶的公開 Profile API
  getPublicProfile: async (req, res) => {
    try {
      const userIdInt = parseInt(req.params.userIdInt, 10)

      if (isNaN(userIdInt)) {
        return res.status(400).json({ error: '無效的用戶 ID' })
      }

      // 1. 查詢 Profile（根據 user_id_int）
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id_int, nick_name, avatar_url, city, district, role')
        .eq('user_id_int', userIdInt)
        .single()

      if (profileError) {
        return res.status(404).json({ error: '找不到使用者資料' })
      }

      // 2. 查詢寵物資料與標籤
      const { data: pet, error: petQueryError } = await supabase
        .from('pets')
        .select('id, name, type, breed, birthday, gender')
        .eq('user_id_int', userIdInt)
        .single()

      let tags = []
      if (!petQueryError && pet) {
        const { data: petTags } = await supabase.from('pet_tags').select('tag').eq('pet_id', pet.id)

        if (petTags) {
          tags = petTags.map((t) => t.tag)
        }
      }

      // 4. 查詢追蹤數量
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id_int', userIdInt)

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id_int', userIdInt)

      // 5. 回傳公開資料
      res.status(200).json({
        success: true,
        data: {
          profile: {
            ...profile,
            followersCount: followersCount || 0,
            followingCount: followingCount || 0
          },
          pet,
          tags
        }
      })
    } catch (error) {
      console.error('❌ getPublicProfile 錯誤:', error)
      res.status(500).json({ error: '伺服器錯誤' })
    }
  }
}
