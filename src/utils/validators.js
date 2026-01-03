/**
 * 驗證 email 格式
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
  // 移除可能誤輸入的空白
  const cleanNumber = chipNumber.trim()
  // 檢查是否全為數字且長度為 10 或 15
  const re = /^(?:\d{10}|\d{15})$/
  return re.test(cleanNumber)
}
