<script setup>
import { computed, ref } from 'vue'
import { useEventForm } from '@/composables/useEventForm'

// Props 與 Emits 定義
const emit = defineEmits(['submit', 'cancel'])

// 引用組合式函數 (Composable)
const { form, errors, validate, resetForm } = useEventForm()

// 本地 UI 狀態
const locOptions = [
  { value: 1, label: '台北 101 大樓' },
  { value: 2, label: '國父紀念館' },
  { value: 3, label: '松山菸廠' },
  { value: 4, label: '象山公園' },
  { value: 5, label: '台北市政府廣場' }
]

// 用於控制提交成功後的顯示狀態
const submittedOpen = ref(false)
const lastSubmitted = ref(null)

// 計算屬性
const locLabel = computed(() => locOptions.find((o) => o.value === Number(form.locId))?.label || '')

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
    <!-- 標題區域 -->
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="text-fg-primary text-[18px] font-bold">
          {{ submittedOpen ? '已提交活動發起' : '建立新活動' }}
        </h2>
        <p v-if="!submittedOpen" class="text-fg-secondary mt-1 text-[12px]">
          送出後會進入待審核狀態，通過後才會公開顯示。
        </p>
      </div>

      <button
        class="text-fg-muted hover:bg-bg-base hover:text-brand-accent flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-gray-100 transition"
        type="button"
        aria-label="關閉"
        @click="handleCancel"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- 提交成功畫面 -->
    <div v-if="submittedOpen">
      <div
        class="border-border-default bg-bg-base text-fg-secondary rounded-xl border p-3 text-[13px]"
      >
        <div class="text-brand-accent mb-1 font-bold">狀態：待審核</div>
        <div>你的活動已送出，管理員審核通過後會公開顯示在地圖與列表中。</div>
      </div>

      <div
        v-if="lastSubmitted"
        class="border-border-default text-fg-secondary mt-3 rounded-xl border bg-white p-3 text-[13px]"
      >
        <div class="mb-2 text-[14px] font-bold">{{ lastSubmitted.title }}</div>
        <div class="space-y-1">
          <div>地點：{{ lastSubmitted.locLabel }}</div>
          <div>人數上限：{{ lastSubmitted.capacity }}</div>
          <div>時間：{{ lastSubmitted.startAt }} ～ {{ lastSubmitted.endAt }}</div>
          <div>聯絡：{{ lastSubmitted.contact }}</div>
        </div>
      </div>

      <button class="c-btn c-btn--primary mt-4 w-full" type="button" @click="handleCancel">
        回到地圖
      </button>

      <button class="c-btn c-btn--secondary mt-3 w-full" type="button" @click="createAnother">
        再發起一個活動
      </button>
    </div>

    <!-- 表單填寫畫面 -->
    <div v-else class="flex flex-col gap-3">
      <!-- 活動名稱 -->
      <div class="flex flex-col gap-1">
        <label class="text-fg-secondary text-[13px] font-bold">
          活動名稱 <span class="text-red-500">*</span>
        </label>
        <p class="text-fg-muted text-[12px]">請輸入簡短明確的標題，例如：松山菸廠狗狗聚會</p>
        <input
          v-model="form.title"
          placeholder="例如：松山菸廠狗狗聚會"
          class="c-input"
          :class="errors.title ? 'border-red-500' : 'border-border-default'"
        />
        <p v-if="errors.title" class="text-[12px] text-red-500">{{ errors.title }}</p>
      </div>

      <!-- 人數上限 -->
      <div class="flex flex-col gap-1">
        <label class="text-fg-secondary text-[13px] font-bold">
          人數上限 <span class="text-red-500">*</span>
        </label>
        <p class="text-fg-muted text-[12px]">請填寫可容納的人數（含自己），例如 10</p>
        <input
          v-model="form.capacity"
          inputmode="numeric"
          placeholder="例如：10"
          class="c-input"
          :class="errors.capacity ? 'border-red-500' : 'border-border-default'"
        />
        <p v-if="errors.capacity" class="text-[12px] text-red-500">{{ errors.capacity }}</p>
      </div>

      <!-- 地點 -->
      <div class="flex flex-col gap-1">
        <label class="text-fg-secondary text-[13px] font-bold">
          選擇地點 <span class="text-red-500">*</span>
        </label>
        <p class="text-fg-muted text-[12px]">選擇地圖上的區域，活動會顯示在對應地點。</p>
        <select
          v-model="form.locId"
          class="c-input"
          :class="errors.locId ? 'border-red-500' : 'border-border-default'"
        >
          <option v-for="o in locOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <p v-if="errors.locId" class="text-[12px] text-red-500">{{ errors.locId }}</p>
      </div>

      <!-- 時間：開始 / 結束 -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label class="text-fg-secondary text-[13px] font-bold">
            開始時間 <span class="text-red-500">*</span>
          </label>
          <p class="text-fg-muted text-[12px]">選擇活動開始時間</p>
          <input
            v-model="form.startAt"
            type="datetime-local"
            class="c-input"
            :class="errors.startAt ? 'border-red-500' : 'border-border-default'"
          />
          <p v-if="errors.startAt" class="text-[12px] text-red-500">{{ errors.startAt }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-fg-secondary text-[13px] font-bold">
            結束時間 <span class="text-red-500">*</span>
          </label>
          <p class="text-fg-muted text-[12px]">結束時間必須晚於開始時間</p>
          <input
            v-model="form.endAt"
            type="datetime-local"
            class="c-input"
            :class="errors.endAt ? 'border-red-500' : 'border-border-default'"
          />
          <p v-if="errors.endAt" class="text-[12px] text-red-500">{{ errors.endAt }}</p>
        </div>
      </div>

      <!-- 聯絡方式 -->
      <div class="flex flex-col gap-1">
        <label class="text-fg-secondary text-[13px] font-bold">
          聯絡方式 <span class="text-red-500">*</span>
        </label>
        <p class="text-fg-muted text-[12px]">請填寫 Email 或台灣手機號碼（09xxxxxxxx）</p>
        <input
          v-model="form.contact"
          placeholder="例如：09xxxxxxxx 或 name@example.com"
          class="c-input"
          :class="errors.contact ? 'border-red-500' : 'border-border-default'"
        />
        <p v-if="errors.contact" class="text-[12px] text-red-500">{{ errors.contact }}</p>
      </div>

      <!-- 活動描述 -->
      <div class="flex flex-col gap-1">
        <label class="text-fg-secondary text-[13px] font-bold">
          活動描述 <span class="text-red-500">*</span>
        </label>
        <p class="text-fg-muted text-[12px]">
          請描述集合點、注意事項、是否需要牽繩等（至少 10 字）
        </p>
        <textarea
          v-model="form.desc"
          placeholder="例如：下午 3 點在入口集合，請攜帶水和拾便袋，狗狗需牽繩…"
          class="c-input h-24 resize-none"
          :class="errors.desc ? 'border-red-500' : 'border-border-default'"
        ></textarea>
        <p v-if="errors.desc" class="text-[12px] text-red-500">{{ errors.desc }}</p>
      </div>

      <!-- 送出按鈕 -->
      <button class="c-btn c-btn--primary" type="button" @click="submit">送出審核</button>

      <!-- 取消按鈕 -->
      <button class="c-btn c-btn--secondary" type="button" @click="handleCancel">取消返回</button>
    </div>
  </div>
</template>
