<script setup>
// 1. Imports
import { computed, reactive, ref } from 'vue'

// 2. Props & Emits
const emit = defineEmits(['submit', 'cancel'])

// 3. 常數與狀態 (State)
const locOptions = [
  { value: 1, label: '台北 101 大樓' },
  { value: 2, label: '國父紀念館' },
  { value: 3, label: '松山菸廠' },
  { value: 4, label: '象山公園' },
  { value: 5, label: '台北市政府廣場' }
]

const submittedOpen = ref(false)
const lastSubmitted = ref(null)

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

// 4. 計算屬性 (Computed)
const locLabel = computed(() => locOptions.find((o) => o.value === Number(form.locId))?.label || '')

// 5. 方法/函式 (Functions)
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

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function isPhoneTW(v) {
  const digits = v.replace(/[\s-]/g, '')
  return /^09\d{8}$/.test(digits)
}

function validate() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (!form.title.trim()) errors.title = '請輸入活動名稱'

  if (!form.capacity) errors.capacity = '請輸入活動人數上限'
  else {
    const n = Number(form.capacity)
    if (!Number.isFinite(n) || n <= 0) errors.capacity = '人數需為正整數'
    else if (!Number.isInteger(n)) errors.capacity = '人數需為整數'
    else if (n < 2) errors.capacity = '人數至少 2 人以上'
    else if (n > 300) errors.capacity = '人數上限建議不超過 300'
  }

  if (!form.locId) errors.locId = '請選擇地點'

  if (!form.startAt) errors.startAt = '請選擇開始時間'
  if (!form.endAt) errors.endAt = '請選擇結束時間'
  if (form.startAt && form.endAt) {
    const s = new Date(form.startAt).getTime()
    const e = new Date(form.endAt).getTime()
    if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
      errors.endAt = '結束時間必須晚於開始時間'
    }
  }

  const contact = form.contact.trim()
  if (!contact) errors.contact = '請填寫聯絡方式（手機或 Email）'
  else if (!isEmail(contact) && !isPhoneTW(contact)) {
    errors.contact = '格式不正確，請輸入 Email 或台灣手機號碼（09xxxxxxxx）'
  }

  if (!form.desc.trim()) errors.desc = '請輸入活動描述'
  else if (form.desc.trim().length < 10) errors.desc = '描述至少 10 個字，讓大家更清楚活動內容'

  return !Object.values(errors).some(Boolean)
}

function handleCancel() {
  submittedOpen.value = false
  lastSubmitted.value = null
  resetForm()
  emit('cancel')
}

function submit() {
  if (!validate()) {
    alert('有必填欄位尚未完成或格式不正確，請查看紅色提示')
    return
  }

  const payload = {
    title: form.title.trim(),
    locId: Number(form.locId),
    capacity: Number(form.capacity),
    startAt: form.startAt,
    endAt: form.endAt,
    contact: form.contact.trim(),
    desc: form.desc.trim(),
    status: 'pending'
  }

  lastSubmitted.value = { ...payload, locLabel: locLabel.value }
  emit('submit', payload)

  submittedOpen.value = true
}

function createAnother() {
  submittedOpen.value = false
  lastSubmitted.value = null
  resetForm()
}
</script>

<template>
  <!-- 右側面板內容：自己滾動，不撐高整頁 -->
  <div class="relative h-full w-full overflow-y-auto bg-white px-5 pt-6 pb-6">
    <!-- Header -->
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="text-[18px] font-bold text-[#333]">
          {{ submittedOpen ? '已提交活動發起' : '建立新活動' }}
        </h2>
        <p v-if="!submittedOpen" class="mt-1 text-[12px] text-[#888]">
          送出後會進入待審核狀態，通過後才會公開顯示。
        </p>
      </div>

      <button
        class="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
        type="button"
        aria-label="關閉"
        @click="handleCancel"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Submitted View -->
    <div v-if="submittedOpen">
      <div class="rounded-xl border border-[#eee] bg-[#fffcf7] p-3 text-[13px] text-[#555]">
        <div class="mb-1 font-bold text-[#ff9f43]">狀態：待審核</div>
        <div>你的活動已送出，管理員審核通過後會公開顯示在地圖與列表中。</div>
      </div>

      <div
        v-if="lastSubmitted"
        class="mt-3 rounded-xl border border-[#eee] bg-white p-3 text-[13px] text-[#555]"
      >
        <div class="mb-2 text-[14px] font-bold">{{ lastSubmitted.title }}</div>
        <div class="space-y-1">
          <div>地點：{{ lastSubmitted.locLabel }}</div>
          <div>人數上限：{{ lastSubmitted.capacity }}</div>
          <div>時間：{{ lastSubmitted.startAt }} ～ {{ lastSubmitted.endAt }}</div>
          <div>聯絡：{{ lastSubmitted.contact }}</div>
        </div>
      </div>

      <button
        class="mt-4 w-full rounded-lg bg-[#ff9f43] p-3 font-bold text-white"
        type="button"
        @click="handleCancel"
      >
        回到地圖
      </button>

      <button
        class="mt-3 w-full rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
        type="button"
        @click="createAnother"
      >
        再發起一個活動
      </button>
    </div>

    <!-- Form View -->
    <div v-else class="flex flex-col gap-3">
      <!-- 活動名稱 -->
      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">
          活動名稱 <span class="text-[#ff4d4f]">*</span>
        </label>
        <p class="text-[12px] text-[#999]">請輸入簡短明確的標題，例如：松山菸廠狗狗聚會</p>
        <input
          v-model="form.title"
          placeholder="例如：松山菸廠狗狗聚會"
          class="rounded-lg border bg-white p-2.5 text-[14px] placeholder:text-[#999]"
          :class="errors.title ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
        />
        <p v-if="errors.title" class="text-[12px] text-[#ff4d4f]">{{ errors.title }}</p>
      </div>

      <!-- 人數上限 -->
      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">
          人數上限 <span class="text-[#ff4d4f]">*</span>
        </label>
        <p class="text-[12px] text-[#999]">請填寫可容納的人數（含自己），例如 10</p>
        <input
          v-model="form.capacity"
          inputmode="numeric"
          placeholder="例如：10"
          class="rounded-lg border bg-white p-2.5 text-[14px] placeholder:text-[#999]"
          :class="errors.capacity ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
        />
        <p v-if="errors.capacity" class="text-[12px] text-[#ff4d4f]">{{ errors.capacity }}</p>
      </div>

      <!-- 地點 -->
      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">
          選擇地點 <span class="text-[#ff4d4f]">*</span>
        </label>
        <p class="text-[12px] text-[#999]">選擇地圖上的區域，活動會顯示在對應地點。</p>
        <select
          v-model="form.locId"
          class="rounded-lg border bg-white p-2.5 text-[14px]"
          :class="errors.locId ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
        >
          <option v-for="o in locOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <p v-if="errors.locId" class="text-[12px] text-[#ff4d4f]">{{ errors.locId }}</p>
      </div>

      <!-- 時間：開始 / 結束 -->
      <div class="grid grid-cols-2 gap-3 max-[800px]:grid-cols-1">
        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">
            開始時間 <span class="text-[#ff4d4f]">*</span>
          </label>
          <p class="text-[12px] text-[#999]">選擇活動開始時間</p>
          <input
            v-model="form.startAt"
            type="datetime-local"
            class="rounded-lg border bg-white p-2.5 text-[14px]"
            :class="errors.startAt ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
          />
          <p v-if="errors.startAt" class="text-[12px] text-[#ff4d4f]">{{ errors.startAt }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">
            結束時間 <span class="text-[#ff4d4f]">*</span>
          </label>
          <p class="text-[12px] text-[#999]">結束時間必須晚於開始時間</p>
          <input
            v-model="form.endAt"
            type="datetime-local"
            class="rounded-lg border bg-white p-2.5 text-[14px]"
            :class="errors.endAt ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
          />
          <p v-if="errors.endAt" class="text-[12px] text-[#ff4d4f]">{{ errors.endAt }}</p>
        </div>
      </div>

      <!-- 聯絡方式 -->
      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">
          聯絡方式 <span class="text-[#ff4d4f]">*</span>
        </label>
        <p class="text-[12px] text-[#999]">請填寫 Email 或台灣手機號碼（09xxxxxxxx）</p>
        <input
          v-model="form.contact"
          placeholder="例如：09xxxxxxxx 或 name@example.com"
          class="rounded-lg border bg-white p-2.5 text-[14px] placeholder:text-[#999]"
          :class="errors.contact ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
        />
        <p v-if="errors.contact" class="text-[12px] text-[#ff4d4f]">{{ errors.contact }}</p>
      </div>

      <!-- 活動描述 -->
      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">
          活動描述 <span class="text-[#ff4d4f]">*</span>
        </label>
        <p class="text-[12px] text-[#999]">請描述集合點、注意事項、是否需要牽繩等（至少 10 字）</p>
        <textarea
          v-model="form.desc"
          placeholder="例如：下午 3 點在入口集合，請攜帶水和拾便袋，狗狗需牽繩…"
          class="h-24 resize-none rounded-lg border bg-white p-2.5 text-[14px] placeholder:text-[#999]"
          :class="errors.desc ? 'border-[#ff4d4f]' : 'border-[#ddd]'"
        ></textarea>
        <p v-if="errors.desc" class="text-[12px] text-[#ff4d4f]">{{ errors.desc }}</p>
      </div>

      <button
        class="rounded-lg bg-[#ff9f43] p-3 font-bold text-white"
        type="button"
        @click="submit"
      >
        送出審核
      </button>

      <button
        class="rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
        type="button"
        @click="handleCancel"
      >
        取消返回
      </button>
    </div>
  </div>
</template>
