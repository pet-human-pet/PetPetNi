<script setup>
import { requiredTagGroups, optionalTagCategories } from '@/utils/profileData.js'

defineProps({
  requiredSelections: {
    type: Object,
    required: true
  },
  optionalTags: {
    type: Array,
    required: true
  },
  maxOptionalTags: {
    type: Number,
    default: 5
  },

  requiredCount: {
    type: Number,
    default: 0
  },

  title: {
    type: String,
    default: '編輯標籤'
  },

  showRequired: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:requiredSelections',
  'selectRequired',
  'toggleOptional',
  'removeOptional',
  'close',
  'confirm'
])

const selectRequiredTag = (groupId, value) => {
  emit('selectRequired', groupId, value)
}

const toggleOptionalTag = (tag) => {
  emit('toggleOptional', tag)
}

const removeOptionalTag = (index) => {
  emit('removeOptional', index)
}

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <div class="c-card w-full max-w-lg bg-white p-6">
    <h3 class="mb-4 text-center text-xl font-bold">{{ title }}</h3>

    <div class="custom-scrollbar max-h-[60vh] space-y-6 overflow-y-auto pr-2">
      <!-- 必選區 -->
      <div v-if="showRequired" class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-lg">⭐</span>
          <h4 class="text-base font-bold text-gray-700">
            必選區
            <span class="ml-2 text-sm font-normal text-gray-500">
              ({{ requiredCount }}/{{ requiredTagGroups.length }})
            </span>
          </h4>
        </div>

        <div v-for="group in requiredTagGroups" :key="group.id" class="rounded-xl bg-gray-50 p-4">
          <label class="mb-3 block text-sm font-bold text-gray-600">{{ group.label }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="option in group.options"
              :key="option.value"
              type="button"
              :class="[
                'flex flex-col items-center justify-center rounded-xl border-2 py-3 transition-all',
                requiredSelections[group.id] === option.value
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              ]"
              @click="selectRequiredTag(group.id, option.value)"
            >
              <span class="text-xl">{{ option.emoji }}</span>
              <span class="mt-1 text-xs font-bold text-gray-600">{{ option.label }}</span>
              <span class="mt-0.5 text-center text-xs text-gray-400">{{ option.description }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 非必選區 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏷️</span>
            <h4 class="text-base font-bold text-gray-700">
              非必選區
              <span class="ml-2 text-sm font-normal text-gray-500">
                ({{ optionalTags.length }}/{{ maxOptionalTags }})
              </span>
            </h4>
          </div>
          <span
            v-if="optionalTags.length >= maxOptionalTags"
            class="animate-pulse text-xs font-medium text-orange-500"
            >已達上限</span
          >
        </div>

        <div
          v-for="category in optionalTagCategories"
          :key="category.id"
          class="rounded-xl bg-gray-50 p-4"
        >
          <label class="mb-3 flex items-center gap-1 text-sm font-bold text-gray-600">
            <span>{{ category.emoji }}</span>
            <span>{{ category.label }}</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in category.tags"
              :key="tag"
              type="button"
              :class="[
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                optionalTags.includes(`#${tag}`)
                  ? 'border-orange-400 bg-orange-100 text-orange-700'
                  : optionalTags.length >= maxOptionalTags
                    ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50'
              ]"
              :disabled="
                !optionalTags.includes(`#${tag}`) && optionalTags.length >= maxOptionalTags
              "
              @click="toggleOptionalTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- 已選標籤預覽 -->
      <Transition name="fade">
        <div
          v-if="optionalTags.length > 0"
          class="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-4"
        >
          <p class="mb-2 text-xs font-medium text-gray-500">已選擇的標籤：</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, index) in optionalTags"
              :key="tag"
              class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 transition-all hover:bg-orange-200"
              @click="removeOptionalTag(index)"
            >
              {{ tag }}
              <span class="text-xs">✕</span>
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <div class="mt-6 flex gap-3">
      <button
        class="flex-1 rounded-full bg-gray-100 py-3 font-bold text-gray-700 transition-all hover:bg-gray-200"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="flex-1 rounded-full bg-[#f48e31] py-3 font-bold text-white shadow-md transition-all hover:brightness-110"
        @click="handleConfirm"
      >
        完成
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
