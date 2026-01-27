<script setup>
defineProps({
  label: { type: String, required: true },
  href: { type: String, default: '' },
  isButton: { type: Boolean, default: false },
  customClass: { type: String, default: '' },
  labelClass: { type: String, default: '' }
})

defineEmits(['click'])
</script>

<template>
  <component
    :is="isButton ? 'button' : 'a'"
    :href="!isButton ? href : undefined"
    :target="!isButton ? '_blank' : undefined"
    :rel="!isButton ? 'noopener noreferrer' : undefined"
    :type="isButton ? 'button' : undefined"
    class="group text-brand-primary flex cursor-pointer items-center justify-between rounded-full bg-white font-bold transition-colors hover:bg-gray-100"
    :class="customClass"
    @click="$emit('click')"
  >
    <span :class="labelClass">{{ label }}</span>
    <span class="transition-transform group-hover:translate-x-1">
      <slot name="arrow">
        <span class="text-lg">→</span>
      </slot>
    </span>
  </component>
</template>
