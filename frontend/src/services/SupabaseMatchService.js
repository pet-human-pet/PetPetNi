import { supabase } from '@/lib/supabase'

/**
 * Supabase 配對服務 (Supabase Matching Service)
 * 負責處理每日配對邏輯、狀態檢查與歷史記錄
 */
export const supabaseMatchService = {
  /**
   * 檢查今日配對狀態
   * @param {string} userId - Auth User ID (UUID)
   * @returns {Promise<{ hasMatched: boolean }>}
   */
  async getMatchStatus(userId) {
    try {
      // 1. 取得 user_id_int
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id_int')
        .eq('user_id', userId)
        .single()

      if (profileError || !myProfile) {
        // console.warn('⚠️ 無法取得用戶 Profile，無法檢查配對狀態')
        return { hasMatched: false }
      }

      // 2. 檢查配對歷史 (使用台灣時間今日 00:00:00)

      // 取得當地時間的午夜
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { count, error: historyError } = await supabase
        .from('match_history')
        .select('*', { count: 'exact', head: true })
        .or(`user_id_int.eq.${myProfile.user_id_int},partner_id_int.eq.${myProfile.user_id_int}`)
        .gte('created_at', todayStart.toISOString())

      if (historyError) {
        throw historyError
      }

      return { hasMatched: count > 0 }
    } catch (error) {
      // console.error('❌ Service Error (getMatchStatus):', error)
      return { hasMatched: false }
    }
  },

  /**
   * 取得今日的配對資料
   * @param {string} userId
   * @returns {Promise<Object|null>} 配對結果或 null
   */
  async getLastMatch(userId) {
    try {
      // 1. 取得 myProfile
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id_int, city, district, nick_name, avatar_url')
        .eq('user_id', userId)
        .single()

      if (profileError || !myProfile) return null

      // 2. 查詢配對歷史
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: history, error: historyError } = await supabase
        .from('match_history')
        .select('*')
        .or(`user_id_int.eq.${myProfile.user_id_int},partner_id_int.eq.${myProfile.user_id_int}`)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (historyError || !history) return null

      // 3. 識別夥伴 ID
      const partnerIdInt =
        history.user_id_int === myProfile.user_id_int ? history.partner_id_int : history.user_id_int

      // 4. 取得雙方寵物與資料
      // (我的寵物)
      const { data: myPet } = await supabase
        .from('pets')
        .select(`*, pet_tags ( tag )`)
        .eq('user_id_int', myProfile.user_id_int)
        .limit(1)
        .single()

      // (夥伴資料)
      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('user_id_int, city, district, nick_name, avatar_url')
        .eq('user_id_int', partnerIdInt)
        .single()

      // (夥伴寵物)
      const { data: matchedPet } = await supabase
        .from('pets')
        .select(`*, pet_tags ( tag )`)
        .eq('user_id_int', partnerIdInt)
        .limit(1)
        .single()

      if (!myPet || !partnerProfile || !matchedPet) return null

      // 5. 計算分數
      const radarScores = this.calculateRadarScores(myProfile, myPet, partnerProfile, matchedPet)
      const avgScore = Math.round(radarScores.reduce((a, b) => a + b) / 5)

      // 6. 找回聊天室 ID
      let roomId = null
      const { data: pair } = await supabase
        .from('private_chat_pairs')
        .select('room_id')
        .or(
          `and(user_1_int.eq.${myProfile.user_id_int},user_2_int.eq.${partnerIdInt}),` +
            `and(user_1_int.eq.${partnerIdInt},user_2_int.eq.${myProfile.user_id_int})`
        )
        .single()

      if (pair) roomId = pair.room_id

      // 7. 組裝結果
      const partnerTags = matchedPet.pet_tags ? matchedPet.pet_tags.map((t) => t.tag) : []
      return {
        pet: {
          id: matchedPet.id,
          name: matchedPet.name,
          species: matchedPet.type === 'dog' ? 'DOG' : matchedPet.type === 'cat' ? 'CAT' : 'OTHER',
          avatarUrl: matchedPet.avatar_url || (matchedPet.type === 'dog' ? '🐕' : '🐈'),
          location: partnerProfile.city || 'Unknown',
          tags: partnerTags,
          bio: matchedPet.bio || `這是一隻可愛的 ${matchedPet.type}`
        },
        owner: {
          id: partnerProfile.user_id_int,
          nickName: partnerProfile.nick_name,
          avatarUrl: partnerProfile.avatar_url
        },
        radarScores,
        avgScore,
        roomId
      }
    } catch (error) {
      // console.error('getLastMatch error:', error)
      return null
    }
  },

  /**
   * 執行每日配對
   * @param {string} userId - Auth User ID (UUID)
   * @returns {Promise<Object>} 配對結果
   */
  async performDailyMatch(userId) {
    try {
      // 1. 取得當前用戶 Profile (含 user_id_int)
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id_int, city, district, nick_name, avatar_url')
        .eq('user_id', userId)
        .single()

      if (profileError || !myProfile) {
        throw new Error('找不到用戶資料')
      }

      // 2. 取得當前用戶寵物資料
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
        const error = new Error('您尚未建立寵物資料')
        error.code = 'NO_PET_DATA'
        throw error
      }

      // 3. 檢查今日配對狀態 (再次檢查以防萬一)
      const { hasMatched } = await this.getMatchStatus(userId)
      if (hasMatched) {
        const error = new Error('今日已進行過配對')
        error.code = 'MATCH_LIMIT_REACHED'
        throw error
      }

      // 4. 準備排除名單
      let excludeIds = [myProfile.user_id_int]

      // 查詢已存在的私聊對象
      const { data: existingChats } = await supabase
        .from('private_chat_pairs')
        .select('user_1_int, user_2_int')
        .or(`user_1_int.eq.${myProfile.user_id_int},user_2_int.eq.${myProfile.user_id_int}`)

      if (existingChats) {
        existingChats.forEach((chat) => {
          if (chat.user_1_int !== myProfile.user_id_int) excludeIds.push(chat.user_1_int)
          if (chat.user_2_int !== myProfile.user_id_int) excludeIds.push(chat.user_2_int)
        })
      }
      excludeIds = [...new Set(excludeIds)]

      // 5. 搜尋候選人 (階梯式)
      let candidates = []

      // 5.1 同縣市
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

        if (excludeIds.length > 0) {
          query = query.not('user_id_int', 'in', `(${excludeIds.join(',')})`)
        }

        const { data: cityCandidates } = await query
        if (cityCandidates && cityCandidates.length > 0) {
          candidates = cityCandidates
        }
      }

      // 5.2 全國 (若無同縣市)
      if (candidates.length === 0) {
        let query = supabase.from('pets').select(`
            *,
            profiles:user_id_int!inner (
              user_id_int,
              nick_name,
              avatar_url,
              city,
              district
            ),
            pet_tags ( tag )
          `)

        if (excludeIds.length > 0) {
          query = query.not('user_id_int', 'in', `(${excludeIds.join(',')})`)
        }

        const { data: globalCandidates } = await query
        candidates = globalCandidates || []
      }

      if (candidates.length === 0) {
        throw new Error('目前沒有其他寵物可供配對')
      }

      // 6. 隨機抽選
      const randomIndex = Math.floor(Math.random() * candidates.length)
      const matchedPet = candidates[randomIndex]
      const partnerProfile = matchedPet.profiles

      // 7. 計算雷達圖分數
      const radarScores = this.calculateRadarScores(myProfile, myPet, partnerProfile, matchedPet)
      const avgScore = Math.round(radarScores.reduce((a, b) => a + b) / 5)

      // 8. 建立聊天室 & 記錄配對歷史
      let roomId = null

      try {
        roomId = await this.findOrCreatePrivateRoom(
          myProfile.user_id_int,
          partnerProfile.user_id_int
        )
      } catch (chatError) {
        // console.error('❌ Failed to create/find chat room:', chatError)
        // 配對成功但聊天室建立失敗... 算成功
      }

      // 記錄配對歷史
      const { error: recordError } = await supabase.from('match_history').insert({
        user_id_int: myProfile.user_id_int,
        partner_id_int: partnerProfile.user_id_int
      })

      if (recordError) {
        // console.error('❌ 無法寫入配對歷史:', recordError)
        throw new Error('配對記錄失敗')
      }

      // 9. 回傳結果
      const partnerTags = matchedPet.pet_tags ? matchedPet.pet_tags.map((t) => t.tag) : []
      return {
        success: true,
        match: {
          pet: {
            id: matchedPet.id,
            name: matchedPet.name,
            species:
              matchedPet.type === 'dog' ? 'DOG' : matchedPet.type === 'cat' ? 'CAT' : 'OTHER',
            avatarUrl: matchedPet.avatar_url || (matchedPet.type === 'dog' ? '🐕' : '🐈'),
            location: partnerProfile.city || 'Unknown',
            tags: partnerTags,
            bio: matchedPet.bio || `這是一隻可愛的 ${matchedPet.type}`
          },
          owner: {
            id: partnerProfile.user_id_int,
            nickName: partnerProfile.nick_name,
            avatarUrl: partnerProfile.avatar_url
          },
          radarScores,
          avgScore,
          roomId
        }
      }
    } catch (error) {
      console.error('❌ Service Error (performDailyMatch):', error)
      throw error
    }
  },

  /**
   * 尋找或建立私聊房間
   * 邏輯移植自 backend/src/services/chatService.js
   */
  async findOrCreatePrivateRoom(userA_Id, userB_Id) {
    if (!userA_Id || !userB_Id) throw new Error('Missing user IDs for chat creation')

    // 確保 ID 順序
    const u1 = userA_Id < userB_Id ? userA_Id : userB_Id
    const u2 = userA_Id < userB_Id ? userB_Id : userA_Id

    // 1. [Fast path] 查 private_chat_pairs 索引表
    const { data: pair, error: checkError } = await supabase
      .from('private_chat_pairs')
      .select('room_id')
      .eq('user_1_int', u1)
      .eq('user_2_int', u2)
      .single()

    if (pair) {
      return pair.room_id
    }

    // 忽略查無資料錯誤 (PGRST116)
    if (checkError && checkError.code !== 'PGRST116') {
      // console.warn('⚠️ 查詢 private_chat_pairs 錯誤，嘗試 fallback:', checkError)
    }

    // 2. [Create] 建立新房間
    // (1) 建立聊天室
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        type: 'private',
        name: null
      })
      .select('id')
      .single()

    if (roomError || !newRoom) {
      throw new Error('建立聊天室失敗')
    }

    const roomId = newRoom.id

    // (2) 建立參與者
    const participants = [
      { room_id: roomId, user_id_int: u1 },
      { room_id: roomId, user_id_int: u2 }
    ]

    const { error: partError } = await supabase.from('chat_room_participants').insert(participants)

    if (partError) {
      // 若失敗盡量清理
      await supabase.from('chat_rooms').delete().eq('id', roomId)
      throw partError
    }

    // (3) 新增至 private_chat_pairs 索引表
    const { error: pairError } = await supabase.from('private_chat_pairs').insert({
      user_1_int: u1,
      user_2_int: u2,
      room_id: roomId
    })

    if (pairError) {
      // console.error('❌ 建立 private_chat_pair 記錄失敗:', pairError)
    }

    return roomId
  },

  /**
   * 計算雷達圖分數
   */
  calculateRadarScores(myProfile, myPet, partnerProfile, matchedPet) {
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

    const myTags = myPet.pet_tags ? myPet.pet_tags.map((t) => t.tag) : []
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

    // (2) 特質 (Traits)
    let scoreTraits = MATCH_SCORE_CONSTANTS.TRAITS_BASE
    if (myPet.type === matchedPet.type) scoreTraits += MATCH_SCORE_CONSTANTS.TRAITS_MATCH_BONUS
    if (myPet.breed === matchedPet.breed) scoreTraits += MATCH_SCORE_CONSTANTS.TRAITS_MATCH_BONUS
    scoreTraits = Math.min(
      MATCH_SCORE_CONSTANTS.TRAITS_MAX,
      scoreTraits + Math.floor(Math.random() * MATCH_SCORE_CONSTANTS.TRAITS_RANDOM_BONUS)
    )

    // (3) 共鳴 (Resonance)
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

    return [scoreGeo, scoreTraits, scoreResonance, scoreChemistry, scoreDestiny]
  }
}
