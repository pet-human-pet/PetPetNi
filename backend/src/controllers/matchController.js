import { supabase } from '../services/supabase.js'
import { chatService } from '../services/chatService.js'

export const matchController = {
  performDailyMatch: async (req, res) => {
    try {
      console.log('💘 收到配對請求')

      // 1. 驗證 Token 並取得當前用戶
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
        return res.status(401).json({ error: 'Token 無效' })
      }

      // 取得當前用戶 Profile (含 user_id_int)
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id_int, city, district')
        .eq('user_id', user.id)
        .single()

      if (profileError || !myProfile) {
        return res.status(404).json({ error: '找不到用戶資料' })
      }

      // 取得當前用戶寵物資料 (用於計算雷達圖)
      const { data: myPet, error: myPetError } = await supabase
        .from('pets')
        .select(
          `
          *,
          pet_tags ( tag )
        `
        )
        .eq('user_id_int', myProfile.user_id_int)
        .limit(1)
        .single()

      if (myPetError || !myPet) {
        // [優化] 回傳特定錯誤代碼，讓前端可以導向
        return res.status(400).json({ error: '您尚未建立寵物資料', code: 'NO_PET_DATA' })
      }

      // [優化] 2. 每日配對限制檢查 (改為直接查詢 match_history)
      // 使用 Asia/Taipei 時區的今日 00:00:00
      const now = new Date()
      const taiwanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
      const todayStart = new Date(
        taiwanTime.getFullYear(),
        taiwanTime.getMonth(),
        taiwanTime.getDate()
      ).toISOString()

      const { count: todayCount, error: historyError } = await supabase
        .from('match_history')
        .select('*', { count: 'exact', head: true })
        .or(`user_id_int.eq.${myProfile.user_id_int},partner_id_int.eq.${myProfile.user_id_int}`)
        .gte('created_at', todayStart)

      if (historyError) {
        console.error('❌ Failed to check match history:', historyError)
        return res.status(500).json({ error: '配對服務暫時無法存取歷史記錄' })
      }

      if (todayCount > 0) {
        return res.status(403).json({ error: '今日已進行過配對', code: 'MATCH_LIMIT_REACHED' })
      }

      // 整理我的 Tags
      const myTags = myPet.pet_tags ? myPet.pet_tags.map((t) => t.tag) : []

      // [優化] 3. 準備排除名單 (Exclude List)
      // 包含：自己 + 已經有私聊房間的朋友
      let excludeIds = [myProfile.user_id_int]

      // 查詢已存在的私聊對象
      const { data: existingChats, error: chatError } = await supabase
        .from('private_chat_pairs')
        .select('user_1_int, user_2_int')
        .or(`user_1_int.eq.${myProfile.user_id_int},user_2_int.eq.${myProfile.user_id_int}`)

      if (!chatError && existingChats) {
        existingChats.forEach((chat) => {
          if (chat.user_1_int !== myProfile.user_id_int) excludeIds.push(chat.user_1_int)
          if (chat.user_2_int !== myProfile.user_id_int) excludeIds.push(chat.user_2_int)
        })
      }

      // 排除今日已配對過的對象 (雖然上面擋了 todayCount > 0，但如果開放多次配對，這裡需要)
      // 暫時不需要，因為每天只能一次

      // 去重
      excludeIds = [...new Set(excludeIds)]
      console.log('🚫 排除名單:', excludeIds)

      // [優化] 4. 階梯式搜尋 (Tiered Search)
      // 策略：先找同縣市 -> 若無 -> 找全國
      let candidates = []

      // 4.1 優先搜尋：同縣市 (City)
      if (myProfile.city) {
        let query = supabase
          .from('pets')
          .select(
            `
            *,
            profiles:user_id_int!inner (
              user_id_int,
              nick_name,
              avatar_url,
              city,
              district
            ),
            pet_tags ( tag )
          `
          )
          .eq('profiles.city', myProfile.city)

        // 應用排除清單
        if (excludeIds.length > 0) {
          // 使用 filter 確保括號格式正確: not.in.(1,2,3)
          query = query.filter('user_id_int', 'not.in', `(${excludeIds.join(',')})`)
        }

        const { data: cityCandidates } = await query

        if (cityCandidates && cityCandidates.length > 0) {
          console.log(`📍 在 ${myProfile.city} 找到 ${cityCandidates.length} 位候選對象`)
          candidates = cityCandidates
        }
      }

      // 4.2 擴大搜尋：全國 (Global) - 如果第一階段沒找到
      if (candidates.length === 0) {
        console.log('🌏 擴大搜尋範圍至全國...')
        let query = supabase.from('pets').select(`
            *,
            profiles:user_id_int (
              user_id_int,
              nick_name,
              avatar_url,
              city,
              district
            ),
            pet_tags ( tag )
          `)

        // 應用排除清單
        if (excludeIds.length > 0) {
          query = query.filter('user_id_int', 'not.in', `(${excludeIds.join(',')})`)
        }

        const { data: globalCandidates, error: searchError } = await query

        if (searchError) {
          console.error('❌ 搜尋候選人失敗:', searchError)
          // 不回傳 500，嘗試使用 Fallback
        }
        candidates = globalCandidates || []
      }

      if (candidates.length === 0) {
        return res.status(200).json({
          success: false,
          message: '目前沒有其他寵物可供配對，請稍後再試'
        })
      }

      // 5. 隨機抽選
      const randomIndex = Math.floor(Math.random() * candidates.length)
      const matchedPet = candidates[randomIndex]
      const partnerProfile = matchedPet.profiles

      if (!partnerProfile) {
        console.error('❌ Critical Error: Matched pet has no profile', matchedPet)
        return res.status(500).json({ error: '配對資料異常，請稍後重試' })
      }

      console.log(`✨ 配對成功: ${myPet.name} <-> ${matchedPet.name}`)

      // 6. 計算雷達圖分數 (5 Angles)
      const MATCH_SCORE_CONSTANTS = {
        GEO_BASE: 40,
        GEO_SAME_CITY: 90,
        GEO_SAME_DISTRICT: 95,
        GEO_RANDOM_RANGE: 21,
        TRAITS_BASE: 60,
        TRAITS_MATCH_BONUS: 15,
        TRAITS_MAX: 100,
        TRAITS_RANDOM_BONUS: 10,
        RESONANCE_BASE: 50,
        RESONANCE_MULTIPLIER: 10,
        RESONANCE_MAX: 100,
        CHEMISTRY_THRESHOLD: 60,
        CHEMISTRY_HIGH_BASE: 80,
        CHEMISTRY_HIGH_RANDOM: 20,
        CHEMISTRY_LOW_BASE: 60,
        CHEMISTRY_LOW_RANDOM: 30,
        DESTINY_BASE: 75,
        DESTINY_RANDOM: 25
      }

      const partnerTags = matchedPet.pet_tags ? matchedPet.pet_tags.map((t) => t.tag) : []

      // (1) 地緣 (Geo)
      let scoreGeo = MATCH_SCORE_CONSTANTS.GEO_BASE
      if (myProfile.city === partnerProfile.city) {
        scoreGeo = MATCH_SCORE_CONSTANTS.GEO_SAME_CITY
        if (myProfile.district === partnerProfile.district) {
          scoreGeo = MATCH_SCORE_CONSTANTS.GEO_SAME_DISTRICT
        }
      } else {
        scoreGeo =
          MATCH_SCORE_CONSTANTS.GEO_BASE +
          Math.floor(Math.random() * MATCH_SCORE_CONSTANTS.GEO_RANDOM_RANGE)
      }

      // (2) 特質 (Traits) - 硬性條件
      let scoreTraits = MATCH_SCORE_CONSTANTS.TRAITS_BASE
      if (myPet.type === matchedPet.type) scoreTraits += MATCH_SCORE_CONSTANTS.TRAITS_MATCH_BONUS
      if (myPet.breed === matchedPet.breed) scoreTraits += MATCH_SCORE_CONSTANTS.TRAITS_MATCH_BONUS
      scoreTraits = Math.min(
        MATCH_SCORE_CONSTANTS.TRAITS_MAX,
        scoreTraits + Math.floor(Math.random() * MATCH_SCORE_CONSTANTS.TRAITS_RANDOM_BONUS)
      )

      // (3) 共鳴 (Resonance) - 興趣標籤
      const intersection = myTags.filter((t) => partnerTags.includes(t))
      let scoreResonance =
        MATCH_SCORE_CONSTANTS.RESONANCE_BASE +
        intersection.length * MATCH_SCORE_CONSTANTS.RESONANCE_MULTIPLIER
      scoreResonance = Math.min(MATCH_SCORE_CONSTANTS.RESONANCE_MAX, scoreResonance)

      // (4) 契合 (Chemistry)
      const avg = (scoreGeo + scoreTraits + scoreResonance) / 3
      let scoreChemistry = 0
      if (avg < MATCH_SCORE_CONSTANTS.CHEMISTRY_THRESHOLD) {
        scoreChemistry =
          MATCH_SCORE_CONSTANTS.CHEMISTRY_HIGH_BASE +
          Math.floor(Math.random() * MATCH_SCORE_CONSTANTS.CHEMISTRY_HIGH_RANDOM)
      } else {
        scoreChemistry =
          MATCH_SCORE_CONSTANTS.CHEMISTRY_LOW_BASE +
          Math.floor(Math.random() * MATCH_SCORE_CONSTANTS.CHEMISTRY_LOW_RANDOM)
      }

      // (5) 星運 (Destiny)
      const scoreDestiny =
        MATCH_SCORE_CONSTANTS.DESTINY_BASE +
        Math.floor(Math.random() * MATCH_SCORE_CONSTANTS.DESTINY_RANDOM)

      const radarScores = [scoreGeo, scoreTraits, scoreResonance, scoreChemistry, scoreDestiny]

      // 7. 建立/取得聊天室
      let roomId = 'mock-room-bot'

      if (partnerProfile.user_id_int !== 0) {
        roomId = await chatService.findOrCreatePrivateRoom(
          myProfile.user_id_int,
          partnerProfile.user_id_int
        )

        // 8. 寫入配對歷史 (改為直接寫入 match_history)
        // 8. 寫入配對歷史 (改為直接寫入 match_history)
        const { error: recordError } = await supabase.from('match_history').insert({
          user_id_int: myProfile.user_id_int,
          partner_id_int: partnerProfile.user_id_int
        })

        if (recordError) {
          console.error('❌ 無法寫入配對歷史 (DB Error):', recordError)
          throw new Error('資料庫寫入失敗') // 拋出錯誤以中斷流程
        }
        console.log('✅ 配對歷史已記錄')
      } else {
        console.log('ℹ️ 配對成功，但未記錄到 DB。')
      }

      // 8. 回傳結果
      res.json({
        success: true,
        match: {
          pet: {
            id: matchedPet.id,
            name: matchedPet.name,
            species:
              matchedPet.type === 'dog' ? 'DOG' : matchedPet.type === 'cat' ? 'CAT' : 'OTHER', // 對應前端格式
            avatarUrl: matchedPet.avatar_url || (matchedPet.type === 'dog' ? '🐕' : '🐈'), // 若無圖則給預設
            location: partnerProfile.city || 'Unknown',
            tags: partnerTags,
            bio: matchedPet.bio || `這是一隻可愛的 ${matchedPet.type}` // 若 DB 有 bio 欄位
          },
          owner: {
            nickName: partnerProfile.nick_name,
            avatarUrl: partnerProfile.avatar_url
          },
          radarScores,
          avgScore: Math.round(radarScores.reduce((a, b) => a + b) / 5),
          roomId
        }
      })
    } catch (error) {
      console.error('❌ 配對 API 錯誤:', error)
      res.status(500).json({ error: '伺服器錯誤' })
    }
  },

  // 檢查今日配對狀態
  getMatchStatus: async (req, res) => {
    try {
      // 1. 驗證 Token
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
        return res.status(401).json({ error: 'Token 無效' })
      }

      // 2. 取得 user_id_int
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id_int')
        .eq('user_id', user.id)
        .single()

      if (profileError || !myProfile) {
        return res.status(404).json({ error: '找不到用戶資料' })
      }

      // 3. 檢查 Match History
      const now = new Date()
      const taiwanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
      const todayStart = new Date(
        taiwanTime.getFullYear(),
        taiwanTime.getMonth(),
        taiwanTime.getDate()
      ).toISOString()

      const { count: todayCount, error: historyError } = await supabase
        .from('match_history')
        .select('*', { count: 'exact', head: true })
        .or(`user_id_int.eq.${myProfile.user_id_int},partner_id_int.eq.${myProfile.user_id_int}`)
        .gte('created_at', todayStart)

      if (historyError) {
        console.error('❌ Failed to check match status:', historyError)
        return res.status(500).json({ error: '無法檢查配對狀態' })
      }

      // 若有記錄則回傳 hasMatched: true
      return res.json({
        success: true,
        hasMatched: todayCount > 0
      })
    } catch (error) {
      console.error('❌ Status API Error:', error)
      res.status(500).json({ error: '伺服器錯誤' })
    }
  }
}
