<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, default: null }
})

/**
 * 可選：之後要把申請資料送到父層或 API
 * - apply(payload): { itemId, name, phone, email, note }
 */
const emit = defineEmits(['apply', 'overlay'])

/** ========== UI state ========== */
const formOpen = ref(false)
const hasApplied = ref(false)

/** ========== form state ========== */
const form = reactive({
  name: '',
  phone: '',
  email: '',
  note: ''
})

const isValid = computed(() => form.name.trim() && form.phone.trim() && form.email.trim())

function openJoinForm() {
  if (hasApplied.value) return
  formOpen.value = true
}

function closeJoinForm() {
  formOpen.value = false
}

function resetForm() {
  form.name = ''
  form.phone = ''
  form.email = ''
  form.note = ''
}

function submitJoin() {
  if (!isValid.value || !props.item) return

  emit('apply', {
    itemId: props.item.id,
    ...form
  })

  // ✅ 送出後：自動回到詳情，並把按鈕變成已申請
  hasApplied.value = true
  formOpen.value = false
}
//把狀態丟回父層
watch(formOpen, (val) => {
  emit('overlay', val)
})

/** item 切換時：回到詳情、清空表單、重置已申請 */
watch(
  () => props.item?.id,
  () => {
    formOpen.value = false
    hasApplied.value = false
    resetForm()
  }
)
</script>

<template>
  <div
    class="h-full overflow-y-auto p-10 max-[800px]:fixed max-[800px]:top-15 max-[800px]:left-0 max-[800px]:z-50 max-[800px]:h-[calc(100vh-60px)] max-[800px]:w-full max-[800px]:bg-white max-[800px]:pb-20"
  >
    <template v-if="props.item">
      <!-- ===== Header ===== -->
      <div class="mb-5 border-b border-[#eee] pb-5">
        <div class="mb-2 text-[28px] font-bold max-[800px]:mt-2.5">
          {{ props.item.title }}
        </div>
        <div class="flex gap-5 text-[14px] text-[#666]">
          <span><i class="fa-solid fa-users mr-1"></i>目標 {{ props.item.target }} 人</span>
          <span><i class="fa-regular fa-clock mr-1"></i>截止: 2025/12/31</span>
        </div>
      </div>

      <!-- ===== Form（覆蓋在詳情上方）===== -->
      <template v-if="formOpen">
        <div
          class="rounded-2xl border border-[#eee] bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
        >
          <div class="mb-5 flex items-center justify-between">
            <div class="text-[20px] font-bold">填寫個人資料</div>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-[14px] font-bold text-[#666] hover:bg-[#f5f5f5]"
              @click="closeJoinForm"
            >
              返回
            </button>
          </div>

          <div class="space-y-4">
            <label class="block">
              <div class="mb-2 text-[14px] font-bold text-[#444]">
                姓名 <span class="text-[#ff4d4f]">*</span>
              </div>
              <input
                v-model.trim="form.name"
                type="text"
                placeholder="例如：王小明"
                class="w-full rounded-xl border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#ff9f43]"
              />
            </label>

            <label class="block">
              <div class="mb-2 text-[14px] font-bold text-[#444]">
                手機 <span class="text-[#ff4d4f]">*</span>
              </div>
              <input
                v-model.trim="form.phone"
                type="tel"
                placeholder="例如：0912-345-678"
                class="w-full rounded-xl border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#ff9f43]"
              />
            </label>

            <label class="block">
              <div class="mb-2 text-[14px] font-bold text-[#444]">
                Email <span class="text-[#ff4d4f]">*</span>
              </div>
              <input
                v-model.trim="form.email"
                type="email"
                placeholder="例如：abc@gmail.com"
                class="w-full rounded-xl border border-[#ddd] px-4 py-3 text-[14px] outline-none focus:border-[#ff9f43]"
              />
            </label>

            <label class="block">
              <div class="mb-2 text-[14px] font-bold text-[#444]">備註（可選）</div>
              <textarea
                v-model.trim="form.note"
                rows="4"
                placeholder="例如：希望平日晚上面交 / 有問題可用 LINE 聯絡我…"
                class="w-full resize-none rounded-xl border border-[#ddd] px-4 py-3 text-[14px] leading-6 outline-none focus:border-[#ff9f43]"
              />
            </label>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-[#ddd] bg-white px-5 py-3 text-[14px] font-bold text-[#666] hover:bg-[#fafafa]"
              @click="closeJoinForm"
            >
              取消
            </button>

            <button
              type="button"
              class="rounded-xl bg-[#ff9f43] px-6 py-3 text-[14px] font-bold text-white hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!isValid"
              @click="submitJoin"
            >
              填寫完畢
            </button>
          </div>

          <p class="mt-3 text-[12px] text-[#999]">
            <span class="text-[#ff4d4f]">*</span> 為必填欄位
          </p>
        </div>
      </template>

      <!-- ===== Detail ===== -->
      <template v-else>
        <div>
          <img
            :src="props.item.img"
            :alt="props.item.title"
            class="mb-5 max-h-75 w-full rounded-xl object-cover max-[800px]:max-h-37.5"
          />

          <div
            class="rounded-xl border-2 p-5"
            :class="hasApplied ? 'border-[#d1fae5] bg-[#f6fffb]' : 'border-[#ff9f43] bg-[#fffcf7]'"
          >
            <div class="flex items-center justify-between">
              <div>
                <div>團購優惠價</div>
                <div
                  class="text-[24px] font-bold"
                  :class="hasApplied ? 'text-[#16a34a]' : 'text-[#ff9f43]'"
                >
                  NT$ {{ props.item.price }}
                </div>
              </div>

              <button
                type="button"
                class="rounded-lg px-8 py-3 text-[18px] font-bold text-white"
                :class="
                  hasApplied
                    ? 'bg-[#22c55e] opacity-90'
                    : 'bg-[#ff9f43] hover:brightness-95 active:brightness-90'
                "
                :disabled="hasApplied"
                @click="openJoinForm"
              >
                {{ hasApplied ? '已申請' : '我要跟團 +1' }}
              </button>
            </div>

            <p v-if="hasApplied" class="mt-3 text-[13px] text-[#15803d]">
              已收到你的申請，後續會由主辦方與你聯絡。
            </p>
          </div>

          <h3 class="my-5 text-[18px] font-bold">商品詳情</h3>
          <div class="leading-7 text-[#444]">
            {{ props.item.desc }}
          </div>
        </div>
      </template>
    </template>

    <template v-else>
      <div class="mt-25 text-center text-[#999]">
        <i class="fa-solid fa-basket-shopping text-[48px]"></i>
        <p class="mt-5">請點選左側團購項目查看詳情</p>
      </div>
    </template>
  </div>
</template>
