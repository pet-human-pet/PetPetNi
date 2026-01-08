// composables/usePasswordValidator.js
import { computed } from 'vue'

/**
 * 模組化密碼強度驗證
 *
 * 設計原則：
 * 1. 拒絕「單體巨型正則」- 每個規則獨立驗證
 * 2. UX 優先 - 告訴用戶「還差什麼」而不是只顯示「格式錯誤」
 *
 * @param {Ref<string>} password - 密碼的 reactive reference
 * @returns {Object} 驗證結果和規則狀態
 */
export function usePasswordValidator(password) {
  // 定義規則集
  const rules = computed(() => {
    const val = password.value || ''
    return [
      {
        key: 'length',
        label: '至少 8 個字元',
        regex: /.{8,}/,
        met: /.{8,}/.test(val)
      },
      {
        key: 'lowercase',
        label: '包含小寫字母',
        regex: /[a-z]/,
        met: /[a-z]/.test(val)
      },
      {
        key: 'uppercase',
        label: '包含大寫字母',
        regex: /[A-Z]/,
        met: /[A-Z]/.test(val)
      },
      {
        key: 'number',
        label: '包含數字',
        regex: /\d/,
        met: /\d/.test(val)
      },
      {
        key: 'special',
        label: '包含特殊符號 (!@#$...)',
        regex: /[\W_]/,
        met: /[\W_]/.test(val)
      }
    ]
  })

  // 計算分數 (0 - 5)
  const score = computed(() => {
    return rules.value.filter((r) => r.met).length
  })

  // 判斷是否通過核心門檻
  // 規則：至少 8 碼 + 其餘 4 種規則中需滿足至少 3 種
  const isValid = computed(() => {
    if (!rules.value.find((r) => r.key === 'length')?.met) return false
    // 扣除長度規則後，剩餘 4 種規則中需滿足至少 3 種
    const otherRulesMet = rules.value.filter((r) => r.key !== 'length' && r.met).length
    return otherRulesMet >= 3
  })

  // 返回未通過的規則標籤 (用於 UI 提示)
  const failedRules = computed(() => {
    return rules.value.filter((r) => !r.met).map((r) => r.label)
  })

  // 密碼強度等級 (用於顏色和文字提示)
  const strengthLevel = computed(() => {
    if (score.value <= 2) return { level: 'weak', label: '弱', color: 'red' }
    if (score.value <= 4) return { level: 'medium', label: '中等', color: 'yellow' }
    return { level: 'strong', label: '強', color: 'green' }
  })

  // 動態顏色類別（Tailwind）
  const getProgressColor = computed(() => {
    const s = score.value
    if (s <= 2) return 'bg-red-500'
    if (s <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  })

  return {
    rules,
    score,
    isValid,
    failedRules,
    strengthLevel,
    getProgressColor
  }
}

/**
 * 後端驗證用的單行 Regex（最後一道防線）
 *
 * 需求：至少 8 碼，必須包含大小寫字母、數字、特殊符號
 *
 * 警告：此 Regex 僅適用於後端驗證，前端請使用 usePasswordValidator
 *
 * @param {string} password - 要驗證的密碼
 * @returns {boolean} 是否通過驗證
 */
export function validatePasswordRegex(password) {
  // ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
  return regex.test(password)
}

/**
 * 檢查密碼是否符合 ASCII 可見字符範圍
 * 用於防止使用重音符號等特殊字符
 *
 * @param {string} password - 要檢查的密碼
 * @returns {boolean} 是否符合 ASCII 範圍
 */
export function isASCIIPassword(password) {
  const asciiRegex = /^[\x20-\x7E]+$/
  return asciiRegex.test(password)
}
