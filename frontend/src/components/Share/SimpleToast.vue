<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="fixed top-4 left-1/2 z-200 flex w-full max-w-[90%] -translate-x-1/2 flex-col gap-2 pointer-events-none md:top-20 md:right-4 md:left-auto md:w-auto md:translate-x-0">
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
        class="c-toast"
        :class="`c-toast--${toast.type}`"
      >
        <div class="flex h-5 w-5 shrink-0 items-center justify-center">
          <i v-if="toast.type === 'success'" class="fa-solid fa-circle-check text-base"></i>
          <i v-else-if="toast.type === 'error'" class="fa-solid fa-circle-exclamation text-base"></i>
          <i v-else class="fa-solid fa-circle-info text-base"></i>
        </div>
        
        <span class="text-sm font-bold text-fg-primary leading-tight tracking-tight wrap-break-words">{{ toast.message }}</span>
        
        <!-- Progress Bar -->
        <div 
          class="c-toast-progress" 
          :style="{ animationDuration: `${toast.duration}ms` }" 
        />
      </div>
    </transition-group>
  </div>
</template>
