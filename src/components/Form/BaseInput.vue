<script setup>
// 使用 Vue 3.4+ 的 defineModel 處理雙向綁定
const model = defineModel({ type: String })

defineProps({
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  inputClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="mb-4">
    <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :class="[
        'w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:outline-none',
        error
          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
          : 'border-gray-300 hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200',
        inputClass
      ]"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
