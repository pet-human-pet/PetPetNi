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
