<script setup>
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: String, default: 'public' }
})

const emit = defineEmits(['update:modelValue'])

// 點擊空白處關閉選單
const open = ref(false)
const target = ref(null)
onClickOutside(target, () => (open.value = false))

const options = [
  { value: 'public', label: '🌐 所有人' },
  { value: 'friends', label: '👥 好友' },
  { value: 'private', label: '🔒 只限自己' }
]

const currentLabel = computed(() => {
  return options.find((o) => o.value === props.modelValue)?.label ?? '🌐 所有人'
})

const select = (v) => {
  emit('update:modelValue', v)
  open.value = false
}
</script>

<template>
  <div ref="target" class="relative">
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200"
      @click="open = !open"
    >
      <span>{{ currentLabel }}</span>
      <span class="text-zinc-500">▼</span>
    </button>

    <div
      v-if="open"
      class="absolute top-11 right-0 z-10 w-40 rounded-xl border bg-white p-1 shadow"
    >
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        class="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
        @click="select(o.value)"
      >
        {{ o.label }}
      </button>
    </div>
  </div>
</template>
