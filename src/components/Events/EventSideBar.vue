<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  events: { type: Array, required: true },
  selectedId: { type: [Number, String, null], default: null }
})

const emit = defineEmits(['select', 'create', 'open-comments'])

const formOpen = ref(false)
const submittedOpen = ref(false)

const locOptions = [
  { value: 1, label: '台北 101 大樓' },
  { value: 2, label: '國父紀念館' },
  { value: 3, label: '松山菸廠' },
  { value: 4, label: '象山公園' },
  { value: 5, label: '台北市政府廣場' }
]

const form = reactive({
  title: '',
  capacity: '', // 人數上限（字串接 v-model，送出轉 number）
  locId: 1,
  startAt: '', // datetime-local
  endAt: '', // datetime-local
  contact: '', // 手機或 Email
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

const lastSubmitted = ref(null)

// 原本的 scrollTo 保留
const cardEls = new Map()
const setCardRef = (id) => (el) => {
  if (el) cardEls.set(id, el)
}
function scrollTo(id) {
  cardEls.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}
defineExpose({ scrollTo })

function resetForm() {
  form.title = ''
  form.capacity = ''
  form.locId = 1
  form.startAt = ''
  form.endAt = ''
  form.contact = ''
  form.desc = ''

  Object.keys(errors).forEach((k) => (errors[k] = ''))
  lastSubmitted.value = null
}

function openForm() {
  submittedOpen.value = false
  formOpen.value = true
}

function closeAll() {
  formOpen.value = false
  submittedOpen.value = false
  resetForm()
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

function submit() {
  if (!validate()) {
    alert('有必填欄位尚未完成或格式不正確，請查看紅色提示')
    return
  }

  const locLabel = locOptions.find((o) => o.value === Number(form.locId))?.label || ''

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

  // 先記錄一份給「待審核」畫面顯示
  lastSubmitted.value = {
    ...payload,
    locLabel
  }

  emit('create', payload)

  formOpen.value = false
  submittedOpen.value = true
}

function createAnother() {
  // 保留待審核頁面關掉，重新開表單 + 清空
  submittedOpen.value = false
  resetForm()
  formOpen.value = true
}
</script>

<template>
  <section
    class="max-[800px]:no-scrollbar flex flex-col gap-3.75 max-[800px]:pointer-events-auto max-[800px]:snap-x max-[800px]:snap-mandatory max-[800px]:flex-row max-[800px]:gap-3 max-[800px]:overflow-x-auto max-[800px]:pb-1.25"
  >
    <!-- create card -->
    <div
      class="rounded-xl border-2 border-dashed border-[#ff9f43] bg-white p-4 transition-all max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:items-center max-[800px]:justify-center max-[800px]:rounded-2xl max-[800px]:p-0 max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
    >
      <button
        class="flex w-full items-center justify-center gap-2 bg-transparent py-2 text-[16px] font-bold text-[#ff9f43] max-[800px]:h-full max-[800px]:flex-col max-[800px]:text-[14px]"
        type="button"
        @click="openForm"
      >
        <i class="fa-solid fa-circle-plus max-[800px]:text-[28px]"></i>
        <span>發起新活動</span>
      </button>

      <!-- form -->
      <div
        v-if="formOpen"
        class="relative mt-3.75 flex flex-col gap-3 border-t border-[#eee] pt-3.75 max-[800px]:fixed max-[800px]:inset-0 max-[800px]:z-1000 max-[800px]:m-0 max-[800px]:overflow-y-auto max-[800px]:border-0 max-[800px]:bg-white max-[800px]:px-5 max-[800px]:pt-20 max-[800px]:pb-5"
      >
        <button
          class="absolute top-3 right-3 flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          type="button"
          aria-label="關閉"
          @click.stop="closeAll"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <h3 class="mb-1 font-bold">建立新活動</h3>
        <p class="text-[12px] text-[#888]">送出後會進入待審核狀態，通過後才會公開顯示。</p>

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
          <p class="text-[12px] text-[#999]">
            請描述集合點、注意事項、是否需要牽繩等（至少 10 字）
          </p>
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
          class="mt-2 hidden w-full rounded-lg bg-[#eee] p-3 font-bold text-[#666] max-[800px]:block"
          type="button"
          @click="closeAll"
        >
          取消返回
        </button>
      </div>

      <!-- submitted / pending view -->
      <div
        v-else-if="submittedOpen"
        class="relative mt-3.75 flex flex-col gap-3 border-t border-[#eee] pt-3.75 max-[800px]:fixed max-[800px]:inset-0 max-[800px]:z-1000 max-[800px]:m-0 max-[800px]:overflow-y-auto max-[800px]:border-0 max-[800px]:bg-white max-[800px]:px-5 max-[800px]:pt-20 max-[800px]:pb-5"
      >
        <button
          class="absolute top-3 right-3 flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          type="button"
          aria-label="關閉"
          @click.stop="closeAll"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <h3 class="text-[16px] font-bold">已提交活動發起</h3>

        <div class="rounded-xl border border-[#eee] bg-[#fffcf7] p-3 text-[13px] text-[#555]">
          <div class="mb-1 font-bold text-[#ff9f43]">狀態：待審核</div>
          <div>你的活動已送出，管理員審核通過後會公開顯示在地圖與列表中。</div>
        </div>

        <div
          v-if="lastSubmitted"
          class="rounded-xl border border-[#eee] bg-white p-3 text-[13px] text-[#555]"
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
          class="rounded-lg bg-[#ff9f43] p-3 font-bold text-white"
          type="button"
          @click="closeAll"
        >
          回到活動列表
        </button>

        <button
          class="rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
          type="button"
          @click="createAnother"
        >
          再發起一個活動
        </button>
      </div>
    </div>

    <!-- cards -->
    <ul class="m-0 flex list-none flex-col gap-3.75 p-0 max-[800px]:contents">
      <li
        v-for="evt in props.events"
        :key="evt.id"
        :ref="setCardRef(evt.id)"
        class="relative cursor-pointer overflow-hidden rounded-xl border border-[#ddd] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:justify-between max-[800px]:rounded-2xl max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
        :class="
          String(props.selectedId) === String(evt.id)
            ? 'border-2 border-[#ff9f43] bg-[#fffcf7]'
            : ''
        "
        @click="emit('select', evt)"
      >
        <div class="p-3.75 max-[800px]:p-3">
          <div class="mb-1 text-[16px] font-bold">{{ evt.title }}</div>
          <div
            class="[display:-webkit-box] overflow-hidden text-[13px] leading-[1.4] text-[#666] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] max-[800px]:text-[12px]"
          >
            {{ evt.desc }}
          </div>
        </div>

        <div class="flex gap-2.5 px-3.75 pb-3.75 max-[800px]:px-3 max-[800px]:pb-3.75">
          <button
            class="h-8.5 flex-1 rounded-[17px] bg-[#ff9f43] text-[12px] font-bold text-white max-[800px]:h-8"
          >
            <i class="fa-solid fa-paw mr-1"></i> 參加
          </button>
          <button
            class="h-8.5 flex-1 rounded-[17px] bg-[#f0f2f5] text-[12px] font-bold text-[#555] max-[800px]:h-8"
          >
            <i class="fa-regular fa-heart"></i>
          </button>
          <button
            type="button"
            class="h-8 flex-1 rounded-[17px] bg-[#f0f2f5] text-[12px] font-bold text-[#555] max-[800px]:h-8"
            @click.stop="emit('open-comments', evt)"
          >
            <i class="fa-regular fa-comment-dots"></i>
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
