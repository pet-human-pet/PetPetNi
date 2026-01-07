<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { isValidEmail } from '@/utils/validators'

const props = defineProps({
  item: { type: Object, default: null }
})

// 可選：之後要把申請資料送到父層或 API
const emit = defineEmits(['apply', 'overlay'])

// UI state
const formOpen = ref(false)
const hasApplied = ref(false)
const isDescOpen = ref(false)

// form state
const form = reactive({
  name: '',
  phone: '',
  email: '',
  note: ''
})

const isValid = computed(() => form.name.trim() && form.phone.trim() && emailOk.value)

const emailOk = computed(() => isValidEmail(form.email))

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
  if (!props.item) return
  if (!isValid.value) return

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
    class="bg-bg-surface fixed top-15 left-0 z-50 h-[calc(100vh-60px)] w-full overflow-y-auto px-6 pt-14 pb-64 md:static md:z-auto md:h-full md:w-auto md:bg-transparent md:p-10 md:pb-10"
  >
    <template v-if="props.item">
      <!-- ===== Header ===== -->
      <div class="border-border-default mb-5 border-b pb-5">
        <div class="text-fg-primary mt-2.5 mb-2 text-[28px] font-bold md:mt-0">
          {{ props.item.title }}
        </div>
        <div class="text-fg-secondary flex gap-5 text-[14px]">
          <span><i class="fa-solid fa-users mr-1"></i>目標 {{ props.item.target }} 人</span>
          <span><i class="fa-regular fa-clock mr-1"></i>截止: 2026/09/10</span>
        </div>
      </div>

      <!-- ===== Form（覆蓋在詳情上方）===== -->
      <template v-if="formOpen">
        <div class="border-border-default bg-bg-surface shadow-card rounded-2xl border p-6">
          <div class="mb-5 flex items-center justify-between">
            <div class="text-fg-primary text-[20px] font-bold">填寫個人資料</div>
            <button
              type="button"
              class="text-fg-secondary hover:bg-bg-base rounded-lg px-3 py-2 text-[14px] font-bold"
              @click="closeJoinForm"
            >
              返回
            </button>
          </div>

          <div class="space-y-4">
            <label class="block">
              <div class="text-fg-primary mb-2 text-[14px] font-bold">
                姓名 <span class="text-func-danger">*</span>
              </div>
              <input
                v-model.trim="form.name"
                type="text"
                placeholder="例如：王小明"
                class="c-input border-border-default focus:border-brand-primary w-full rounded-xl px-4 py-3 text-[14px] outline-none"
              />
            </label>

            <label class="block">
              <div class="text-fg-primary mb-2 text-[14px] font-bold">
                手機 <span class="text-func-danger">*</span>
              </div>
              <input
                v-model.trim="form.phone"
                type="tel"
                placeholder="例如：0912-345-678"
                class="c-input border-border-default focus:border-brand-primary w-full rounded-xl px-4 py-3 text-[14px] outline-none"
              />
            </label>

            <label class="block">
              <div class="text-fg-primary mb-2 text-[14px] font-bold">
                Email <span class="text-func-danger">*</span>
              </div>
              <input
                v-model.trim="form.email"
                type="email"
                placeholder="例如：abc@gmail.com"
                class="c-input focus:border-brand-primary w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                :class="
                  form.email.trim() && !emailOk ? 'border-func-danger' : 'border-border-default'
                "
              />
              <p
                v-if="form.email.trim() && !emailOk"
                class="text-func-danger mt-2 text-[12px] font-bold"
              >
                Email 格式不正確，請輸入像 abc@gmail.com
              </p>
            </label>

            <label class="block">
              <div class="text-fg-primary mb-2 text-[14px] font-bold">備註（可選）</div>
              <textarea
                v-model.trim="form.note"
                rows="4"
                placeholder="例如：希望平日晚上面交 / 有問題可用 LINE 聯絡我…"
                class="c-input border-border-default focus:border-brand-primary h-32 w-full resize-none rounded-xl px-4 py-3 text-[14px] leading-6 outline-none"
              />
            </label>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              class="c-btn--secondary bg-bg-surface text-fg-secondary rounded-xl px-5 py-3 text-[14px] font-bold"
              @click="closeJoinForm"
            >
              取消
            </button>

            <button
              type="button"
              class="c-btn--primary rounded-xl px-6 py-3 text-[14px] font-bold text-white hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!isValid"
              @click="submitJoin"
            >
              填寫完畢
            </button>
          </div>

          <p class="text-fg-muted mt-3 text-[12px]">
            <span class="text-func-danger">*</span> 為必填欄位
          </p>
        </div>
      </template>

      <!-- ===== Detail ===== -->
      <template v-else>
        <div>
          <img
            :src="props.item.img"
            :alt="props.item.title"
            class="mb-3 h-48 w-full rounded-xl object-cover md:mb-5 md:h-auto md:max-h-60"
          />

          <div
            class="rounded-xl border-2 p-5"
            :class="hasApplied ? 'c-status-block--success' : 'border-brand-primary bg-bg-base'"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-fg-primary">團購優惠價</div>
                <div
                  class="text-[24px] font-bold"
                  :class="hasApplied ? 'text-status-success' : 'text-brand-primary'"
                >
                  NT$ {{ props.item.price }}
                </div>
              </div>

              <button
                type="button"
                class="rounded-lg px-8 py-3 text-[18px] font-bold text-white"
                :class="
                  hasApplied
                    ? 'bg-status-success opacity-90'
                    : 'bg-brand-primary hover:brightness-95 active:brightness-90'
                "
                :disabled="hasApplied"
                @click="openJoinForm"
              >
                {{ hasApplied ? '已申請' : '我要跟團 +1' }}
              </button>
            </div>

            <p v-if="hasApplied" class="text-status-success mt-3 text-[13px]">
              已收到你的申請，後續會由主辦方與你聯絡。
            </p>
          </div>

          <div
            class="mt-5 flex cursor-pointer items-center justify-between md:cursor-default"
            @click="isDescOpen = !isDescOpen"
          >
            <h3 class="text-fg-primary text-[18px] font-bold">商品詳情</h3>
            <span class="md:hidden">
              <i
                class="fa-solid text-fg-secondary transition-transform duration-300"
                :class="isDescOpen ? 'fa-chevron-up rotate-0' : 'fa-chevron-down'"
              ></i>
            </span>
          </div>

          <div
            class="grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr] md:opacity-100"
            :class="
              isDescOpen
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0 md:grid-rows-[1fr] md:opacity-100'
            "
          >
            <div class="overflow-hidden">
              <div class="text-fg-primary mt-2 leading-7 whitespace-pre-wrap">
                {{ props.item.desc }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-else>
      <div class="text-fg-muted mt-25 text-center">
        <i class="fa-solid fa-basket-shopping text-[48px]"></i>
        <p class="mt-5">請點選左側團購項目查看詳情</p>
      </div>
    </template>
  </div>
</template>
