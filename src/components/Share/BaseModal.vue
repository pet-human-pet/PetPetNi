<script setup>
import { onMounted, onUnmounted, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

// Lock body scroll when modal is open
watch(
  () => props.isOpen,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  }
)

onMounted(() => {
  if (props.isOpen) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="[z-999] fixed inset-0 flex items-center justify-center p-4 backdrop-blur-md">
      <!-- Backdrop with Login Gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-red-400/80 to-pink-400/80 transition-opacity"
        @click="closeOnBackdrop ? handleClose() : null"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative w-full max-w-lg transform overflow-hidden rounded-2xl p-2 transition-all"
        role="dialog"
        aria-modal="true"
      >
        <!-- 這裡使用 slot 讓外部插入內容 -->
        <slot></slot>

        <!-- 關閉按鈕 (可選) -->
        <button
          v-if="showCloseButton"
          class="absolute top-4 right-4 z-10 p-2 text-gray-400 transition-colors hover:text-white"
          @click="handleClose"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
