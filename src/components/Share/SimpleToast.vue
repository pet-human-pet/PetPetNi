<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="fixed top-20 left-1/2 z-50 flex w-full max-w-[90%] -translate-x-1/2 flex-col gap-2 pointer-events-none md:right-4 md:left-auto md:w-auto md:translate-x-0">
    <transition-group 
      name="toast" 
      tag="div" 
      class="flex flex-col items-center gap-2 md:items-end"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto relative flex w-auto max-w-80 items-center gap-3 overflow-hidden rounded-lg px-4 py-3 shadow-lg transition-all"
        :class="{
          'bg-green-600 text-white': toast.type === 'success',
          'bg-red-600 text-white': toast.type === 'error',
          'bg-blue-600 text-white': toast.type === 'info'
        }"
      >
        <!-- Icon -->
        <span class="text-lg font-bold shrink-0">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ️' }}
        </span>
        
        <!-- Message -->
        <span class="text-sm font-medium break-words leading-tight">{{ toast.message }}</span>
        
        <!-- Progress Bar -->
        <div 
          class="toast-progress absolute bottom-0 left-0 h-1 bg-white/30" 
          :style="{ animationDuration: `${toast.duration}ms` }" 
        />
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-progress {
  animation: progress linear forwards;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
