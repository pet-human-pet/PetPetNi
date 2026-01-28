/**
 * 雷達圖計算演算法 v1.3
 * 計算兩隻寵物之間的五維配對分數
 *
 * 【五個維度】
 * 1. 地緣 (Geo) - 地理位置匹配度
 * 2. 特質 (Traits) - 硬性條件匹配（品種、體型、性別）
 * 3. 共鳴 (Resonance) - 軟性興趣匹配（個性、愛好）
 * 4. 契合 (Chemistry) - 補償機制
 * 5. 星運 (Destiny) - 隨機因素
 */

/**
 * 計算五維雷達圖數據
 *
 * @param {Object} me - 當前用戶的寵物資料
 * @param {Object} target - 配對對象的寵物資料
 * @returns {Array<number>} - 五個維度的分數 (10-100)
 */
export function calculateRadarData(me, target) {
  // ==================== 維度 1: 地緣 (Geo) ====================
  // 相同地區給高分，不同地區給低分
  let scoreGeo =
    me.location === target.location
      ? 90 + Math.floor(Math.random() * 6) // 90-95
      : 40 + Math.floor(Math.random() * 11) // 40-50

  // ==================== 維度 2: 特質 (Traits) ====================
  // 硬性條件匹配（品種、體型、性別等）
  let scoreTraits = 0

  // 從 tags 中提取硬性標籤（格式：#breed:柴犬, #size:中型, #gender:公）
  const myHardTags = me.tags.filter((tag) => tag.startsWith('#'))
  const targetHardTags = target.tags.filter((tag) => tag.startsWith('#'))

  // 品種匹配檢查
  const myBreed = myHardTags.find((t) => t.startsWith('#breed:'))
  const targetBreed = targetHardTags.find((t) => t.startsWith('#breed:'))
  if (myBreed && targetBreed && myBreed === targetBreed) {
    scoreTraits += 30 // 品種相同 +30
  }

  // 體型匹配檢查
  const mySize = myHardTags.find((t) => t.startsWith('#size:'))
  const targetSize = targetHardTags.find((t) => t.startsWith('#size:'))
  if (mySize && targetSize && mySize === targetSize) {
    scoreTraits += 30 // 體型相同 +30
  }

  // 性別匹配檢查
  const myGender = myHardTags.find((t) => t.startsWith('#gender:'))
  const targetGender = targetHardTags.find((t) => t.startsWith('#gender:'))
  if (myGender && targetGender && myGender === targetGender) {
    scoreTraits += 20 // 性別相同 +20
  }

  // 其他硬性標籤匹配（每個 +10）
  const hardTagMatches = myHardTags.filter((tag) => targetHardTags.includes(tag))
  const otherMatches = hardTagMatches.filter(
    (tag) => !tag.startsWith('#breed:') && !tag.startsWith('#size:') && !tag.startsWith('#gender:')
  )
  scoreTraits += otherMatches.length * 10

  // 基礎分 + 隨機擾動
  scoreTraits = Math.min(100, scoreTraits + 20 + Math.floor(Math.random() * 10))

  // ==================== 維度 3: 共鳴 (Resonance) ====================
  // 軟性興趣匹配（個性、愛好等非必選標籤）
  const mySoftTags = me.tags.filter((tag) => !tag.startsWith('#'))
  const targetSoftTags = target.tags.filter((tag) => !tag.startsWith('#'))

  // 計算軟性標籤重疊
  const softTagMatches = mySoftTags.filter((tag) => targetSoftTags.includes(tag))

  // 基礎分 50，每個共同興趣 +15
  let scoreResonance = 50 + softTagMatches.length * 15
  scoreResonance = Math.min(100, scoreResonance + Math.floor(Math.random() * 10) - 5)

  // ==================== 計算前三項平均 ====================
  const currentAvg = (scoreGeo + scoreTraits + scoreResonance) / 3

  // ==================== 維度 4: 契合 (Chemistry) - 補償維度 ====================
  // 若前三項分數低，此項自動補高，營造「互補」感
  let scoreChemistry
  if (currentAvg < 55) {
    // 低分區：大力補償 (80-95)
    scoreChemistry = 80 + Math.floor(Math.random() * 16)
  } else if (currentAvg < 70) {
    // 中分區：適度補償 (70-85)
    scoreChemistry = 70 + Math.floor(Math.random() * 16)
  } else {
    // 高分區：正常隨機 (60-90)
    scoreChemistry = 60 + Math.floor(Math.random() * 31)
  }

  // ==================== 維度 5: 星運 (Destiny) - 補償維度 ====================
  // 純隨機高分，確保圖形視覺飽滿
  const scoreDestiny = 75 + Math.floor(Math.random() * 25) // 75-99

  // ==================== 邊界檢查 (10-100) ====================
  return [scoreGeo, scoreTraits, scoreResonance, scoreChemistry, scoreDestiny].map((s) =>
    Math.max(10, Math.min(100, s))
  )
}

/**
 * 隨機抽選配對對象（同物種）
 *
 * @param {Object} myPet - 當前寵物
 * @param {Array} allPets - 所有可配對的寵物清單
 * @returns {Object|null} - 配對結果
 */
export function randomMatch(myPet, allPets) {
  // 硬性過濾：同物種 + 排除自己
  const candidates = allPets.filter((pet) => pet.species === myPet.species && pet.id !== myPet.id)

  if (candidates.length === 0) return null

  // 純隨機抽選
  const randomIndex = Math.floor(Math.random() * candidates.length)
  return candidates[randomIndex]
}
