<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="fixed top-20 left-1/2 z-50 flex w-full max-w-[90%] -translate-x-1/2 flex-col gap-2 pointer-events-none md:right-4 md:left-auto md:w-auto md:translate-x-0">
    <transition-group 
      tag="div" 
      class="flex flex-col items-center gap-2 md:items-end"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="c-toast w-auto max-w-80"
        :class="`c-toast--${toast.type}`"
      >
        <span class="text-lg font-bold shrink-0">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ️' }}
        </span>
        
        <span class="text-sm font-medium wrap-break-words leading-tight">{{ toast.message }}</span>
        
        <!-- Progress Bar -->
        <div 
          class="c-toast-progress" 
          :style="{ animationDuration: `${toast.duration}ms` }" 
        />
      </div>
    </transition-group>
  </div>
</template>
