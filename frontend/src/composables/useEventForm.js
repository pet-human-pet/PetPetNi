import { reactive } from 'vue'
import { isValidEmail, isValidPhoneTW } from '@/utils/validators'

export function useEventForm() {
  const form = reactive({
    title: '',
    capacity: '',
    locId: 1,
    startAt: '',
    endAt: '',
    contact: '',
    desc: ''
  })

  const errors = reactive({
    title: '',
    capacity: '',
    locId: '',
    startAt: '',
    endAt: '',
    contact: '',
    desc: ''
  })

  function resetForm() {
    form.title = ''
    form.capacity = ''
    form.locId = 1
    form.startAt = ''
    form.endAt = ''
    form.contact = ''
    form.desc = ''

    Object.keys(errors).forEach((k) => (errors[k] = ''))
  }

  function validate() {
    // Clear previous errors
    Object.keys(errors).forEach((k) => (errors[k] = ''))

    let isValid = true

    if (!form.title.trim()) {
      errors.title = '請輸入活動名稱'
      isValid = false
    }

    if (!form.capacity) {
      errors.capacity = '請輸入活動人數上限'
      isValid = false
    } else {
      const n = Number(form.capacity)
      if (!Number.isFinite(n) || n <= 0) {
        errors.capacity = '人數需為正整數'
        isValid = false
      } else if (!Number.isInteger(n)) {
        errors.capacity = '人數需為整數'
        isValid = false
      } else if (n < 2) {
        errors.capacity = '人數至少 2 人以上'
        isValid = false
      } else if (n > 50) {
        errors.capacity = '人數上限不超過 50'
        isValid = false
      }
    }

    if (!form.locId) {
      errors.locId = '請選擇地點'
      isValid = false
    }

    if (!form.startAt) {
      errors.startAt = '請選擇開始時間'
      isValid = false
    }
    if (!form.endAt) {
      errors.endAt = '請選擇結束時間'
      isValid = false
    }
    if (form.startAt && form.endAt) {
      const s = new Date(form.startAt).getTime()
      const e = new Date(form.endAt).getTime()
      if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
        errors.endAt = '結束時間必須晚於開始時間'
        isValid = false
      }
    }

    const contact = form.contact.trim()
    if (!contact) {
      errors.contact = '請填寫聯絡方式（手機或 Email）'
      isValid = false
    } else if (!isValidEmail(contact) && !isValidPhoneTW(contact)) {
      errors.contact = '格式不正確，請輸入 Email 或台灣手機號碼（09xxxxxxxx）'
      isValid = false
    }

    if (!form.desc.trim()) {
      errors.desc = '請輸入活動描述'
      isValid = false
    } else if (form.desc.trim().length < 10) {
      errors.desc = '描述至少 10 個字，讓大家更清楚活動內容'
      isValid = false
    }

    return isValid
  }

  return {
    form,
    errors,
    validate,
    resetForm
  }
}
