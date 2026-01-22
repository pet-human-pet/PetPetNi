<script setup>
import { ref, onMounted } from 'vue'
import { useConfirm } from '@/composables/useConfirm'

const { register } = useConfirm()
const visible = ref(false)
const props = ref({
  title: '',
  message: '',
  type: 'primary',
  confirmText: '確認',
  cancelText: '取消'
})

let resolvePromise = null

const show = (options) => {
  props.value = {
    title: options.title || '提示',
    message: options.message || '',
    type: options.type || 'primary', // 'primary' | 'danger' | 'blue'
    confirmText: options.confirmText || '確認',
    cancelText: options.cancelText || '取消'
  }
  visible.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const instance = { show }

onMounted(() => {
  register(instance)
})

const handleConfirm = () => {
  visible.value = false
  if (resolvePromise) resolvePromise(true)
}

const handleCancel = () => {
  visible.value = false
  if (resolvePromise) resolvePromise(false)
}

// 給父層 (App.vue) 或透過 Composable 存取
defineExpose({ show })
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="c-dialog-overlay z-50">
      <div class="c-dialog-box relative w-full max-w-[400px] rounded-2xl bg-white shadow-xl">
        <!-- Close Button -->
        <button
          class="cursor-pointer absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
          @click="handleCancel"
        >
          <i class="fa-solid fa-xmark text-gray-500"></i>
        </button>

        <div class="px-6 pt-8 pb-2 text-center">
          <h3 class="text-fg-secondary text-xl font-bold">{{ props.title }}</h3>
        </div>

        <div class="px-6 py-2">
          <p class="text-fg-secondary/90 leading-relaxed">{{ props.message }}</p>
        </div>

        <div class="flex justify-end gap-3 px-6 py-6">
          <button
            type="button"
            class="hover:bg-bg-base text-fg-muted cursor-pointer rounded-lg px-4 py-2 text-sm font-bold transition-colors hover:bg-gray-100"
            @click="handleCancel"
          >
            {{ props.cancelText }}
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-lg px-8 py-2 text-sm font-bold text-white shadow-sm transition-transform active:scale-95"
            :class="{
              'bg-func-danger hover:bg-func-danger/90': props.type === 'danger',
              'bg-brand-primary hover:bg-brand-primary/90': props.type !== 'danger'
            }"
            @click="handleConfirm"
          >
            {{ props.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
