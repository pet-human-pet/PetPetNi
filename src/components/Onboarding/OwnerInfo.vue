<script setup>
import { ref, watch, computed, watchEffect } from 'vue'
import BaseInput from '@/components/Form/BaseInput.vue'
import { taiwanLocations, cities } from '@/utils/taiwanLocations'

const props = defineProps({
  email: {
    type: String,
    required: true
  },
  initialData: {
    type: Object,
    default: null
  },
  showEmail: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit', 'back'])

const realName = ref('')
const nickname = ref('')
const phone = ref('')
const phoneError = ref('')

const city = ref('')
const district = ref('')
const gender = ref('')
const birthday = ref('')
const nameError = ref('')

// 計算今天日期（YYYY-MM-DD 格式，用於日期選擇器的 max 屬性）
const today = new Date().toISOString().split('T')[0]

// 填充初始資料（當返回此頁面時）
watchEffect(() => {
  if (props.initialData) {
    realName.value = props.initialData.realName || ''
    nickname.value = props.initialData.nickname || ''
    phone.value = props.initialData.phone || ''
    city.value = props.initialData.city || ''
    district.value = props.initialData.district || ''
    gender.value = props.initialData.gender || ''
    birthday.value = props.initialData.birthday || ''
  }
})

const availableDistricts = computed(() => {
  return city.value ? taiwanLocations[city.value] : []
})

// 當城市改變時，重置行政區
watch(city, () => {
  district.value = ''
})

// 真實姓名驗證（支援中英文、空格、連字號、撇號）
const validateName = (name) => {
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\s'-]+$/
  const minLength = 2
  const maxLength = 50

  if (!name || name.trim().length < minLength) {
    return '姓名至少需要 2 個字元'
  }
  if (name.length > maxLength) {
    return '姓名不可超過 50 個字元'
  }
  if (!nameRegex.test(name)) {
    return "姓名僅可包含中英文、空格、連字號(-)或撇號(')"
  }
  return ''
}

// 台灣手機號碼格式驗證（09xx-xxx-xxx 或 09xxxxxxxx）
const validatePhone = (phoneNumber) => {
  const phoneRegex = /^09\d{8}$/
  const phoneWithDashRegex = /^09\d{2}-\d{3}-\d{3}$/
  return phoneRegex.test(phoneNumber.replace(/-/g, '')) || phoneWithDashRegex.test(phoneNumber)
}

const handleSubmit = () => {
  // 清空錯誤訊息
  phoneError.value = ''
  nameError.value = ''

  // 驗證姓名
  const nameValidationError = validateName(realName.value)
  if (nameValidationError) {
    nameError.value = nameValidationError
    return
  }

  // 驗證電話格式
  const cleanPhone = phone.value.replace(/-/g, '')
  if (!validatePhone(cleanPhone)) {
    phoneError.value = '請輸入正確的手機號碼格式（例如：0912345678）'
    return
  }

  // 提交資料
  emit('submit', {
    email: props.email, // 使用 props 中的 email（一般註冊或 OAuth 都有）
    realName: realName.value,
    nickname: nickname.value,
    phone: cleanPhone,
    city: city.value,
    district: district.value,
    gender: gender.value,
    birthday: birthday.value
  })
}
</script>

<template>
  <div class="flex h-full max-h-screen flex-col overflow-y-hidden p-4 text-gray-800 md:p-6">
    <!-- 標題區（固定） -->
    <div class="shrink-0">
      <h2 class="mb-2 text-center text-2xl font-bold">填寫個人資料</h2>
      <p class="mb-6 text-center text-sm text-gray-500">讓我們更認識您</p>
    </div>

    <!-- 表單區（可滾動） -->
    <form
      class="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4"
      @submit.prevent="handleSubmit"
    >
      <!-- Email（唯讀顯示） -->
      <div v-if="showEmail" class="space-y-2">
        <label class="text-sm font-medium text-gray-600">Email</label>
        <div class="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-500">
          {{ email }}
        </div>
      </div>

      <!-- 真實姓名 -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">真實姓名</label>
        <BaseInput
          v-model="realName"
          :error="nameError"
          placeholder="請輸入您的真實姓名"
          type="text"
          required
          @blur="nameError = validateName(realName)"
        />
      </div>

      <!-- 暱稱 -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">暱稱</label>
        <BaseInput v-model="nickname" placeholder="在平台上顯示的名稱" type="text" required />
      </div>

      <!-- 電話 -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">手機號碼</label>
        <BaseInput
          v-model="phone"
          :error="phoneError"
          placeholder="例如：0912345678"
          type="tel"
          required
          @blur="
            phoneError =
              phone && !validatePhone(phone) ? '請輸入正確的手機號碼格式（例如：0912345678）' : ''
          "
        />
      </div>

      <!-- 所在地 / 城市 -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">所在地</label>
        <div class="flex gap-2">
          <!-- 縣市選單 -->
          <div class="relative flex-1">
            <select
              v-model="city"
              class="w-full appearance-none rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-800 transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              required
            >
              <option value="" disabled selected>縣市</option>
              <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
            >
              <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </div>
          </div>

          <!-- 行政區選單 -->
          <div class="relative flex-1">
            <select
              v-model="district"
              class="w-full appearance-none rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-800 transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
              :disabled="!city"
              required
            >
              <option value="" disabled selected>區域</option>
              <option v-for="d in availableDistricts" :key="d" :value="d">{{ d }}</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
            >
              <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 性別 -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">性別</label>
        <div class="flex gap-4">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="gender"
              type="radio"
              value="male"
              class="h-4 w-4 text-orange-400 focus:ring-orange-400"
              required
            />
            <span>男</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="gender"
              type="radio"
              value="female"
              class="h-4 w-4 text-orange-400 focus:ring-orange-400"
            />
            <span>女</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="gender"
              type="radio"
              value="secret"
              class="h-4 w-4 text-orange-400 focus:ring-orange-400"
            />
            <span>不透露</span>
          </label>
        </div>
      </div>

      <!-- 生日 -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-600">生日</label>
        <input
          v-model="birthday"
          type="date"
          :max="today"
          class="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-800 transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
          required
        />
      </div>

      <!-- 按鈕群組（固定） -->
      <div class="mt-2 flex shrink-0 gap-3">
        <button
          type="button"
          class="flex-1 rounded-2xl border-2 border-gray-300 bg-white py-4 text-lg font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          @click="emit('back')"
        >
          上一步
        </button>
        <button
          type="submit"
          class="bg-brand-primary flex-1 rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          :disabled="false"
        >
          下一步
        </button>
      </div>
    </form>
  </div>
</template>
