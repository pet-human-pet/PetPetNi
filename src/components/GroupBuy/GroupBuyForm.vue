<script setup>
import { computed, reactive, ref } from 'vue'

/**
 * Emits
 * - submit(payload): 送出團購（預設 status: 'pending'）
 * - cancel(): 取消
 */
const emit = defineEmits(['submit', 'cancel'])

/** ========== State ========== */
const isSubmitted = ref(false)

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

/** ========== Computed ========== */
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

const canSubmit = computed(() => {
  return (
    !errors.title &&
    !errors.price &&
    !errors.img &&
    !errors.deadline &&
    !errors.meetupLocation &&
    !errors.shippingNote &&
    !errors.contact &&
    !errors.desc
  )
})

const props = defineProps({
  pendingItems: { type: Array, default: () => [] }
})

/** ========== Validators ========== */
function clearErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

function isValidUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function validate() {
  clearErrors()

  if (!form.title.trim()) errors.title = '請填寫商品名稱'
  if (!form.price || Number(form.price) <= 0) errors.price = '價格需為大於 0 的數字'

  if (form.img && !isValidUrl(form.img)) errors.img = '圖片網址格式不正確（需 http/https）'

  if (!form.deadline) {
    errors.deadline = '請選擇截止日期'
  } else {
    // 截止日不可早於今天（以本地日期為準）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(`${form.deadline}T00:00:00`)
    if (d < today) errors.deadline = '截止日期不可早於今天'
  }

  if (form.deliveryMethod === 'meetup') {
    if (!form.meetupLocation.trim()) errors.meetupLocation = '請填寫面交地點'
  } else {
    if (!form.shippingNote.trim()) errors.shippingNote = '請填寫配送/運費說明'
  }

  if (!form.contact.trim()) errors.contact = '請填寫聯絡方式（LINE/IG/電話/Email）'
  if (!form.desc.trim()) errors.desc = '請填寫詳細說明（特色、規格、注意事項等）'

  // 回傳是否通過
  return Object.values(errors).every((msg) => !msg)
}

/** ========== Actions ========== */
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

function submit() {
  if (!validate()) return

  emit('submit', {
    id: Date.now(),
    status: 'pending', // ✅ 送審中
    createdAt: new Date().toISOString(),

    title: form.title.trim(),
    category: form.category,
    categoryLabel: categoryLabel.value,

    price: Number(form.price),
    target: Number(form.target || 0),

    img: form.img || 'https://via.placeholder.com/800x400',
    deadline: form.deadline,

    deliveryMethod: form.deliveryMethod,
    meetupLocation: form.deliveryMethod === 'meetup' ? form.meetupLocation.trim() : '',
    shippingNote: form.deliveryMethod === 'delivery' ? form.shippingNote.trim() : '',

    contact: form.contact.trim(),
    desc: form.desc.trim()
  })

  isSubmitted.value = true
  // 送審後你要不要清空可自行決定；我這裡先清空
  resetForm()
}

function backToForm() {
  isSubmitted.value = false
}
</script>

<template>
  <div
    class="h-full overflow-y-auto p-10 max-[800px]:fixed max-[800px]:top-15 max-[800px]:left-0 max-[800px]:z-50 max-[800px]:h-[calc(100vh-60px)] max-[800px]:w-full max-[800px]:bg-white max-[800px]:pb-20"
  >
    <!-- 送審中紀錄（最新在上） -->
    <div v-if="pendingItems.length" class="mb-6">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-[14px] font-bold text-[#666]">送審中</h3>
        <span class="text-[12px] text-[#999]">通過後才會顯示在團購列表</span>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="item in pendingItems.slice(0, 3)"
          :key="item.id"
          class="flex items-start gap-3 rounded-xl border border-[#eee] bg-[#fff7ee] p-3"
        >
          <img :src="item.img" alt="pending" class="h-16 w-20 shrink-0 rounded-lg object-cover" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-[14px] font-bold text-[#333]">{{ item.title }}</p>
              <span class="rounded-full bg-[#ff9f43] px-2 py-0.5 text-[12px] font-bold text-white">
                審核中
              </span>
            </div>
            <p class="mt-1 line-clamp-2 text-[12px] text-[#666]">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 送審成功畫面 -->
    <section v-if="isSubmitted" class="mx-auto max-w-150">
      <div class="rounded-2xl border border-[#eee] bg-white p-6 shadow-sm">
        <h2 class="text-[22px] font-bold text-[#333]">已送出審核 ✅</h2>
        <p class="mt-2 text-[#666]">你的團購已進入「待審核」狀態，通過後才會顯示在團購列表。</p>

        <div class="mt-6 flex flex-col gap-3">
          <button
            class="rounded-lg bg-[#ff9f43] p-3 font-bold text-white"
            type="button"
            @click="backToForm"
          >
            再發起一筆
          </button>

          <button
            class="rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
            type="button"
            @click="emit('cancel')"
          >
            返回
          </button>
        </div>
      </div>
    </section>

    <!-- 表單 -->
    <section v-else class="mx-auto max-w-150">
      <div class="mb-6">
        <h2 class="text-[24px] font-bold"><i class="fa-solid fa-shop mr-2"></i>發起團購</h2>
        <p class="text-[#666]">填寫完整資訊並送審，通過後才會公開顯示。</p>
      </div>

      <div class="flex flex-col gap-5">
        <!-- 商品名稱 -->
        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]"
            >商品名稱<span class="text-[#ff4d4f]">*</span></label
          >
          <input
            v-model="form.title"
            placeholder="例如：吉娃娃造型抱枕"
            class="rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
          />
          <p v-if="errors.title" class="text-[12px] text-[#ff4d4f]">{{ errors.title }}</p>
        </div>

        <!-- 類別 + 截止日 -->
        <div class="grid grid-cols-2 gap-5 max-[800px]:grid-cols-1 max-[800px]:gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-[13px] font-bold text-[#666]">類別</label>
            <select
              v-model="form.category"
              class="w-full rounded-lg border border-[#ddd] bg-white p-2.5"
            >
              <option value="food">零食/食品</option>
              <option value="clothes">衣物/配件</option>
              <option value="toys">玩具/用品</option>
              <option value="health">保健/清潔</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-[13px] font-bold text-[#666]"
              >截止日期<span class="text-[#ff4d4f]">*</span></label
            >
            <input
              v-model="form.deadline"
              type="date"
              class="w-full rounded-lg border border-[#ddd] p-2.5"
            />
            <p v-if="errors.deadline" class="text-[12px] text-[#ff4d4f]">{{ errors.deadline }}</p>
          </div>
        </div>

        <!-- 價格 + 目標 -->
        <div class="grid grid-cols-2 gap-5 max-[800px]:grid-cols-1 max-[800px]:gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-[13px] font-bold text-[#666]"
              >團購價格 (元)<span class="text-[#ff4d4f]">*</span></label
            >
            <input
              v-model="form.price"
              placeholder="349"
              type="number"
              inputmode="numeric"
              class="w-full rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
            />
            <p v-if="errors.price" class="text-[12px] text-[#ff4d4f]">{{ errors.price }}</p>
          </div>

          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-[13px] font-bold text-[#666]">目標數量</label>
            <input
              v-model="form.target"
              placeholder="30"
              type="number"
              inputmode="numeric"
              class="w-full rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
            />
          </div>
        </div>

        <!-- 圖片 -->
        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">圖片網址</label>
          <input v-model="form.img" class="rounded-lg border border-[#ddd] p-2.5" />
          <p v-if="errors.img" class="text-[12px] text-[#ff4d4f]">{{ errors.img }}</p>

          <div
            v-if="form.img && !errors.img"
            class="mt-2 overflow-hidden rounded-xl border border-[#eee]"
          >
            <img :src="form.img" alt="preview" class="h-40 w-full object-cover" />
          </div>
        </div>

        <!-- 取貨方式 -->
        <div class="flex flex-col gap-2">
          <label class="text-[13px] font-bold text-[#666]">取貨方式</label>

          <div class="flex gap-3">
            <label class="flex items-center gap-2 text-[14px] text-[#333]">
              <input v-model="form.deliveryMethod" type="radio" value="meetup" />
              面交
            </label>
            <label class="flex items-center gap-2 text-[14px] text-[#333]">
              <input v-model="form.deliveryMethod" type="radio" value="delivery" />
              配送
            </label>
          </div>

          <div v-if="form.deliveryMethod === 'meetup'" class="flex flex-col gap-1">
            <input
              v-model="form.meetupLocation"
              placeholder="面交地點（例：捷運市政府站 2 號出口）"
              class="rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
            />
            <p v-if="errors.meetupLocation" class="text-[12px] text-[#ff4d4f]">
              {{ errors.meetupLocation }}
            </p>
          </div>

          <div v-else class="flex flex-col gap-1">
            <input
              v-model="form.shippingNote"
              placeholder="配送方式/運費說明（例：超取 60 元、滿 2 件免運）"
              class="rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
            />
            <p v-if="errors.shippingNote" class="text-[12px] text-[#ff4d4f]">
              {{ errors.shippingNote }}
            </p>
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

        <!-- 詳細說明 -->
        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]"
            >詳細說明<span class="text-[#ff4d4f]">*</span></label
          >
          <textarea
            v-model="form.desc"
            placeholder="商品特色、規格、注意事項、成團規則、截止時間…"
            class="h-40 rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
          ></textarea>
          <p v-if="errors.desc" class="text-[12px] text-[#ff4d4f]">{{ errors.desc }}</p>
        </div>

        <!-- Actions -->
        <button
          class="rounded-lg bg-[#ff9f43] p-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!canSubmit"
          type="button"
          @click="submit"
        >
          送審團購
        </button>

        <button
          class="rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
          type="button"
          @click="emit('cancel')"
        >
          取消
        </button>
      </div>
    </section>
  </div>
</template>
