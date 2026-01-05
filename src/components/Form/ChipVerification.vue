<script setup>
import { ref, computed } from 'vue'
import BaseInput from '@/components/Form/BaseInput.vue'
import { isValidPetChip } from '@/utils/validators'

defineProps({
  petName: {
    type: String,
    default: '您的毛孩'
  }
})

const emit = defineEmits(['skip', 'submit'])

const chipNumber = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const status = ref('idle') // idle | submitting | pending | success

const isFormatValid = computed(() => {
  if (!chipNumber.value) return false
  return isValidPetChip(chipNumber.value)
})

const handleVerify = async () => {
  errorMsg.value = ''

  if (!isFormatValid.value) {
    errorMsg.value = '晶片號碼格式錯誤 (需為 10 或 15 碼數字)'
    return
  }

  isLoading.value = true
  status.value = 'submitting'

  // TODO: 未來需替換成真實 API 呼叫（例如：POST /api/pets/verify-chip）
  // 目前為模擬 API，包含隨機失敗機制以測試錯誤處理
  try {
    await new Promise((resolve, reject) => {
      // 模擬隨機成功或失敗
      const isSuccess = Math.random() > 0.2 // 80% 成功率
      setTimeout(() => {
        if (isSuccess) {
          resolve()
        } else {
          reject(new Error('模擬網路錯誤'))
        }
      }, 1500)
    })
    // 成功送出，進入「待審核」狀態
    status.value = 'pending'
    emit('submit', chipNumber.value)
  } catch {
    status.value = 'idle'
    errorMsg.value = '連線錯誤，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const handleSkip = () => {
  emit('skip')
}
</script>

<template>
  <div class="mx-auto w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
    <!-- UI 狀態：待審核 (提交成功後) -->
    <div v-if="status === 'pending'" class="py-8 text-center">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
        <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h3 class="mb-2 text-2xl font-bold text-gray-800">已提交審核</h3>
      <p class="mb-8 text-gray-600">
        我們已收到{{ petName }}的晶片資料
        <br />
        管理員將在 24 小時內完成驗證。
      </p>
      <button
        class="w-full rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
        @click="handleSkip"
      >
        進入首頁
      </button>
    </div>

    <!-- UI 狀態：輸入中 -->
    <div v-else>
      <div class="mb-8 text-center">
        <h2 class="mb-2 text-2xl font-bold text-gray-800">寵物晶片驗證</h2>
        <p class="text-sm text-gray-500">
          驗證晶片可獲得「已認證飼主」標章
          <br />
          並解鎖更多社群功能
        </p>
      </div>

      <div class="mb-6 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
        <svg class="mt-0.5 h-5 w-5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <p class="text-sm text-blue-700">
          您可以輸入 10 碼或 15 碼的晶片編號。若您的寵物尚未植入晶片，可選擇暫時略過。
        </p>
      </div>

      <BaseInput v-model="chipNumber" label="晶片號碼" placeholder="請輸入 10 或 15 碼數字" :error="errorMsg" />

      <div class="mt-8 flex flex-col gap-3">
        <button
          class="flex w-full items-center justify-center rounded-xl bg-gray-900 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isLoading"
          @click="handleVerify"
        >
          <svg v-if="isLoading" class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isLoading ? '驗證中...' : '提交驗證' }}
        </button>

        <button
          class="w-full py-3 font-medium text-gray-500 transition-colors hover:text-gray-700"
          :disabled="isLoading"
          @click="handleSkip"
        >
          稍後再說
        </button>
      </div>
    </div>
  </div>
</template>
