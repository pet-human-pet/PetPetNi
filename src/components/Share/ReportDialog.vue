<script setup>
import { ref, onMounted } from 'vue'
import { useReport } from '@/composables/useReport'

const { registerReport } = useReport()
const visible = ref(false)
const resolvePromise = ref(null)
const selectedReason = ref('')
const otherReason = ref('')

const reasons = [
  '垃圾訊息 / 廣告',
  '不當內容 (色情、暴力)',
  '騷擾行為',
  '仇恨言論',
  '其他'
]

const show = () => {
  selectedReason.value = ''
  otherReason.value = ''
  visible.value = true
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const instance = { show }

onMounted(() => {
  registerReport(instance)
})

const handleConfirm = () => {
  if (!selectedReason.value) return
  
  const finalReason = selectedReason.value === '其他' ? otherReason.value : selectedReason.value
  
  visible.value = false
  if (resolvePromise.value) {
    resolvePromise.value({ confirmed: true, reason: finalReason })
  }
}

const handleCancel = () => {
  visible.value = false
  if (resolvePromise.value) {
    resolvePromise.value({ confirmed: false })
  }
}

defineExpose({ show })
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="c-dialog-overlay">
      <div class="c-dialog-box">
        <div class="px-6 pt-6 pb-2">
          <h3 class="text-lg font-bold text-fg-primary">檢舉此內容</h3>
          <p class="text-xs text-fg-secondary mt-1">請選擇檢舉原因，我們將儘速審核。</p>
        </div>

        <div class="px-6 py-2 space-y-3">
          <label 
            v-for="reason in reasons" 
            :key="reason"
            class="c-report-reason"
            :class="{ 'c-report-reason--active': selectedReason === reason }"
          >
            <input 
              v-model="selectedReason"
              type="radio" 
              name="report_reason" 
              :value="reason" 
              class="w-4 h-4 text-brand-primary focus:ring-brand-primary"
            >
            <span class="text-sm text-fg-primary">{{ reason }}</span>
          </label>

          <!-- 其他原因輸入框 -->
          <textarea 
            v-if="selectedReason === '其他'"
            v-model="otherReason"
            placeholder="請簡述原因..."
            rows="3"
            class="c-report-input"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 px-6 py-6">
          <button 
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-base transition-colors"
            @click="handleCancel"
          >
            取消
          </button>
          <button 
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform active:scale-95 bg-status-error hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedReason || (selectedReason === '其他' && !otherReason.trim())"
            @click="handleConfirm"
          >
            送出檢舉
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>