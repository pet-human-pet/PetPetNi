<script setup>
// 使用 Vue 3.4+ 的 defineModel 處理雙向綁定
const model = defineModel()

const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
})
</script>

<template>
  <div class="mb-4">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 hover:border-gray-400"
    />
  </div>
</template>
