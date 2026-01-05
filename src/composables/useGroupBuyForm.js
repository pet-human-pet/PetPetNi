import { reactive, computed } from 'vue'
import { isValidUrl } from '@/utils/validators'

export function useGroupBuyForm() {
  const form = reactive({
    title: '',
    price: '',
    target: '',
    category: 'food', // food | clothes | toys | health | other
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    deadline: '', // yyyy-mm-dd
    deliveryMethod: 'meetup', // meetup | delivery
    meetupLocation: '', // when meetup
    shippingNote: '', // when delivery
    contact: '', // line/ig/phone/email
    desc: ''
  })

  const errors = reactive({
    title: '',
    price: '',
    img: '',
    deadline: '',
    meetupLocation: '',
    shippingNote: '',
    contact: '',
    desc: ''
  })

  // Category Label Logic
  const categoryLabel = computed(() => {
    const map = {
      food: '零食/食品',
      clothes: '衣物/配件',
      toys: '玩具/用品',
      health: '保健/清潔',
      other: '其他'
    }
    return map[form.category] || '其他'
  })

  function clearErrors() {
    Object.keys(errors).forEach((k) => (errors[k] = ''))
  }

  function validate() {
    clearErrors()
    let isValid = true

    if (!form.title.trim()) {
      errors.title = '請填寫商品名稱'
      isValid = false
    }

    if (!form.price || Number(form.price) <= 0) {
      errors.price = '價格需為大於 0 的數字'
      isValid = false
    }

    if (form.img && !isValidUrl(form.img)) {
      errors.img = '圖片網址格式不正確（需 http/https）'
      isValid = false
    }

    if (!form.deadline) {
      errors.deadline = '請選擇截止日期'
      isValid = false
    } else {
      // 截止日不可早於今天（以本地日期為準）
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const d = new Date(`${form.deadline}T00:00:00`)
      if (d < today) {
        errors.deadline = '截止日期不可早於今天'
        isValid = false
      }
    }

    if (form.deliveryMethod === 'meetup') {
      if (!form.meetupLocation.trim()) {
        errors.meetupLocation = '請填寫面交地點'
        isValid = false
      }
    } else {
      if (!form.shippingNote.trim()) {
        errors.shippingNote = '請填寫配送/運費說明'
        isValid = false
      }
    }

    if (!form.contact.trim()) {
      errors.contact = '請填寫聯絡方式（LINE/IG/電話/Email）'
      isValid = false
    }

    if (!form.desc.trim()) {
      errors.desc = '請填寫詳細說明（特色、規格、注意事項等）'
      isValid = false
    }

    return isValid
  }

  function resetForm() {
    form.title = ''
    form.price = ''
    form.target = ''
    form.category = 'food'
    form.img =
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'
    form.deadline = ''
    form.deliveryMethod = 'meetup'
    form.meetupLocation = ''
    form.shippingNote = ''
    form.contact = ''
    form.desc = ''
    clearErrors()
  }

  return {
    form,
    errors,
    categoryLabel, // Expoose this as it was used in submit payload
    validate,
    resetForm
  }
}
