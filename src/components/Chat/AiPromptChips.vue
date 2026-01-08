<script setup>
defineProps({
  prompts: { type: Array, default: () => [] }
})

const emit = defineEmits(['select'])
</script>

<template>
  <div
    class="flex shrink-0 gap-2 overflow-x-auto border-b border-border-default bg-bg-base p-2 no-scrollbar"
  >
    <button
      v-for="prompt in prompts"
      :key="prompt"
      class="whitespace-nowrap rounded-full border border-brand-primary bg-bg-surface px-3 py-1 text-xs text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
      @click="emit('select', prompt)"
    >
      {{ prompt }}
    </button>
  </div>
</template>
