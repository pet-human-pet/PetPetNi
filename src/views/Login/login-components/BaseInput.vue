<script setup>
defineOptions({
  inheritAttrs: false
})

// 使用 Vue 3.4+ 的 defineModel 處理雙向綁定
const model = defineModel()

defineProps({
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    v-bind="$attrs"
    class="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-all duration-200 hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
  />
</template>
