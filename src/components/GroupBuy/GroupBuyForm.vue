<script setup>
import { ref } from 'vue'
import { useGroupBuyForm } from '@/composables/useGroupBuyForm'

/**
 * Emits
 * - submit(payload): 送出團購（預設 status: 'pending'）
 * - cancel(): 取消
 */
const emit = defineEmits(['submit', 'cancel'])

const { form, errors, categoryLabel, validate, resetForm } = useGroupBuyForm()
const isSubmitted = ref(false)

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
    class="bg-bg-surface fixed top-15 left-0 z-50 h-[calc(100vh-60px)] w-full overflow-y-auto p-6 pb-20 md:static md:z-auto md:h-full md:w-auto md:bg-transparent md:p-10 md:pb-10"
  >
    <!-- 送審成功畫面 -->
    <section v-if="isSubmitted" class="mx-auto max-w-150">
      <div class="border-border-default bg-bg-surface rounded-2xl border p-6 shadow-sm">
        <h2 class="text-fg-primary text-[22px] font-bold">已送出審核 ✅</h2>
        <p class="text-fg-secondary mt-2">
          你的團購已進入「待審核」狀態，通過後才會顯示在團購列表。
        </p>

        <div class="mt-6 flex flex-col gap-3">
          <button class="c-btn--primary" type="button" @click="backToForm">再發起一筆</button>

          <button class="c-btn--secondary" type="button" @click="emit('cancel')">返回</button>
        </div>
      </div>
    </section>

    <!-- 表單 -->
    <section v-else class="mx-auto max-w-150">
      <div class="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 class="text-fg-primary text-[24px] font-bold">
            <i class="fa-solid fa-shop mr-2"></i>發起團購
          </h2>
          <p class="text-fg-secondary">填寫完整資訊並送審，通過後才會公開顯示。</p>
        </div>

        <button
          class="text-fg-muted hover:bg-bg-base hover:text-brand-accent flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-gray-100 transition"
          type="button"
          aria-label="關閉"
          @click="emit('cancel')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="flex flex-col gap-5">
        <!-- 商品名稱 -->
        <div class="flex flex-col gap-1">
          <label class="text-fg-secondary text-[13px] font-bold"
            >商品名稱<span class="text-func-danger">*</span></label
          >
          <input v-model="form.title" placeholder="例如：吉娃娃造型抱枕" class="c-input" />
          <p v-if="errors.title" class="text-func-danger text-[12px]">{{ errors.title }}</p>
        </div>

        <!-- 類別 + 截止日 -->
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-fg-secondary text-[13px] font-bold">類別</label>
            <select v-model="form.category" class="c-select">
              <option value="food">零食/食品</option>
              <option value="clothes">衣物/配件</option>
              <option value="toys">玩具/用品</option>
              <option value="health">保健/清潔</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-fg-secondary text-[13px] font-bold"
              >截止日期<span class="text-func-danger">*</span></label
            >
            <input v-model="form.deadline" type="date" class="c-input" />
            <p v-if="errors.deadline" class="text-func-danger text-[12px]">{{ errors.deadline }}</p>
          </div>
        </div>

        <!-- 價格 + 目標 -->
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-fg-secondary text-[13px] font-bold"
              >團購價格 (元)<span class="text-func-danger">*</span></label
            >
            <input
              v-model="form.price"
              placeholder="349"
              type="number"
              inputmode="numeric"
              class="c-input"
            />
            <p v-if="errors.price" class="text-func-danger text-[12px]">{{ errors.price }}</p>
          </div>

          <div class="flex min-w-0 flex-col gap-1">
            <label class="text-fg-secondary text-[13px] font-bold">目標數量</label>
            <input
              v-model="form.target"
              placeholder="30"
              type="number"
              inputmode="numeric"
              class="c-input"
            />
          </div>
        </div>

        <!-- 圖片 -->
        <div class="flex flex-col gap-1">
          <label class="text-fg-secondary text-[13px] font-bold">圖片網址</label>
          <input v-model="form.img" class="c-input" />
          <p v-if="errors.img" class="text-func-danger text-[12px]">{{ errors.img }}</p>

          <div
            v-if="form.img && !errors.img"
            class="border-border-default mt-2 overflow-hidden rounded-xl border"
          >
            <img :src="form.img" alt="preview" class="h-40 w-full object-cover" />
          </div>
        </div>

        <!-- 取貨方式 -->
        <div class="flex flex-col gap-2">
          <label class="text-fg-secondary text-[13px] font-bold">取貨方式</label>

          <div class="flex gap-3">
            <label class="text-fg-primary flex items-center gap-2 text-[14px]">
              <input v-model="form.deliveryMethod" type="radio" value="meetup" />
              面交
            </label>
            <label class="text-fg-primary flex items-center gap-2 text-[14px]">
              <input v-model="form.deliveryMethod" type="radio" value="delivery" />
              配送
            </label>
          </div>

          <div v-if="form.deliveryMethod === 'meetup'" class="flex flex-col gap-1">
            <input
              v-model="form.meetupLocation"
              placeholder="面交地點（例：捷運市政府站 2 號出口）"
              class="c-input"
            />
            <p v-if="errors.meetupLocation" class="text-func-danger text-[12px]">
              {{ errors.meetupLocation }}
            </p>
          </div>

          <div v-else class="flex flex-col gap-1">
            <input
              v-model="form.shippingNote"
              placeholder="配送方式/運費說明（例：超取 60 元、滿 2 件免運）"
              class="c-input"
            />
            <p v-if="errors.shippingNote" class="text-func-danger text-[12px]">
              {{ errors.shippingNote }}
            </p>
          </div>
        </div>

        <!-- 聯絡方式 -->
        <div class="flex flex-col gap-1">
          <label class="text-fg-secondary text-[13px] font-bold">
            聯絡方式 <span class="text-func-danger">*</span>
          </label>
          <p class="text-fg-muted text-[12px]">請填寫 Email 或台灣手機號碼（09xxxxxxxx）</p>
          <input
            v-model="form.contact"
            placeholder="例如：09xxxxxxxx 或 name@example.com"
            class="c-input"
            :class="errors.contact ? 'border-func-danger' : 'border-border-default'"
          />
          <p v-if="errors.contact" class="text-func-danger text-[12px]">{{ errors.contact }}</p>
        </div>

        <!-- 詳細說明 -->
        <div class="flex flex-col gap-1">
          <label class="text-fg-secondary text-[13px] font-bold"
            >詳細說明<span class="text-func-danger">*</span></label
          >
          <textarea
            v-model="form.desc"
            placeholder="商品特色、規格、注意事項、成團規則、截止時間…"
            class="c-input h-40 resize-none leading-relaxed"
          ></textarea>
          <p v-if="errors.desc" class="text-func-danger text-[12px]">{{ errors.desc }}</p>
        </div>

        <!-- Actions -->
        <button
          class="c-btn--primary disabled:opacity-60"
          :disabled="!validate"
          type="button"
          @click="submit"
        >
          送審團購
        </button>

        <button class="c-btn--secondary" type="button" @click="emit('cancel')">取消</button>
      </div>
    </section>
  </div>
</template>
