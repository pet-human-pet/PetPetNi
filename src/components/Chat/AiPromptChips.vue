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
      :key="typeof prompt === 'string' ? prompt : prompt.text"
      class="whitespace-nowrap rounded-full border border-brand-primary bg-bg-surface px-3 py-1 text-xs text-brand-primary transition-colors hover:bg-brand-primary hover:text-white flex items-center gap-1.5"
      @click="emit('select', typeof prompt === 'string' ? prompt : prompt.text)"
    >
      <i v-if="typeof prompt !== 'string' && prompt.icon" class="fa-solid" :class="prompt.icon"></i>
      {{ typeof prompt === 'string' ? prompt : prompt.text }}
    </button>
  </div>
</template>
