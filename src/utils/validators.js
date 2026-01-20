/**
 * 驗證 Email 格式
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 驗證寵物晶片號碼 (台灣常見為 10 碼或 15 碼數字)
 * @param {string} chipNumber
 * @returns {boolean}
 */
export const isValidPetChip = (chipNumber) => {
  const cleanNumber = chipNumber.trim()
  const re = /^(?:\d{10}|\d{15})$/
  return re.test(cleanNumber)
}

/**
 * 驗證台灣手機號碼
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhoneTW = (phone) => {
  const digits = phone.replace(/[\s-]/g, '')
  return /^09\d{8}$/.test(digits)
}

/**
 * 驗證 URL 格式
 * @param {string} url
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
/**
 * 驗證內容是否包含敏感資訊 (用於 PET_MODE)
 * 包含：Line, IG, FB, 手機, Email
 * @param {string} content
 * @returns {boolean} true 表示包含敏感資訊
 */
export const checkSensitiveContent = (content) => {
  if (!content) return false
  const lowerContent = content.toLowerCase()

  // 1. 社交軟體關鍵字
  const socialKeywords = ['line', 'ig', 'fb', 'facebook', 'instagram', '微信', 'wechat', '加我']
  const hasSocialKeyword = socialKeywords.some((k) => lowerContent.includes(k))

  // 2. 數字連號 (手機或 ID 常見) - 超過 8 位數字
  const hasSerialNumbers = /\d{8,}/.test(content)

  // 3. Email 格式
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const hasEmail = emailPattern.test(content)

  // 4. 手機號碼 (台灣格式 09 開頭)
  const phonePattern = /09\d{2}[-?\s?]?\d{3}[-?\s?]?\d{3}/
  const hasPhone = phonePattern.test(content)

  return hasSocialKeyword || hasSerialNumbers || hasEmail || hasPhone
}
