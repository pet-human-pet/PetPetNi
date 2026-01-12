<script setup>
import { ref, onMounted } from 'vue'
import { useConfirm } from '@/composables/useConfirm'

const { register } = useConfirm()
const visible = ref(false)
const props = ref({
  title: '',
  message: '',
  type: 'primary', // 'primary' | 'danger'
  confirmText: '確認',
  cancelText: '取消'
})

let resolvePromise = null

const show = (options) => {
  props.value = {
    title: options.title || '提示',
    message: options.message || '',
    type: options.type || 'primary',
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
    <div v-if="visible" class="c-dialog-overlay">
      <div class="c-dialog-box">
        <div class="px-6 pt-6 pb-2">
          <h3 class="text-lg font-bold text-fg-primary">{{ props.title }}</h3>
        </div>

        <div class="px-6 py-2">
          <p class="text-sm text-fg-secondary leading-relaxed">{{ props.message }}</p>
        </div>

        <div class="flex justify-end gap-3 px-6 py-6">
          <button 
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-base transition-colors"
            @click="handleCancel"
          >
            {{ props.cancelText }}
          </button>
          <button 
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform active:scale-95"
            :class="props.type === 'danger' ? 'bg-status-error hover:bg-red-600' : 'bg-brand-primary hover:bg-brand-primary/90'"
            @click="handleConfirm"
          >
            {{ props.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>