<script setup>
import { ref } from 'vue'
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
  },

  // 控制「完成」按鈕顯示（profile 頁面顯示，註冊流程隱藏）
  showConfirmButton: {
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

// 手風琴狀態管理（獨立）
const expandedCategory = ref(null)

const toggleCategory = (categoryId) => {
  expandedCategory.value = expandedCategory.value === categoryId ? null : categoryId
}
</script>

<template>
  <div class="w-full">
    <h3 v-if="title" class="mb-4 text-center text-xl font-bold">{{ title }}</h3>

    <div class="space-y-6">
      <!-- 必選區 -->
      <div v-if="showRequired" class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-lg">⭐</span>
          <h4 class="text-base font-bold text-gray-700">
            必填資訊
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

      <!-- 特色標籤 (手風琴設計) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏷️</span>
            <h4 class="text-base font-bold text-gray-700">
              特色標籤
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

        <!-- 手風琴分類容器（固定高度 + 內部滾動） -->
        <div class="max-h-[400px] space-y-3 overflow-y-auto rounded-lg pr-1">
          <div
            v-for="category in optionalTagCategories"
            :key="category.id"
            class="overflow-hidden rounded-xl border-2 border-gray-200 transition-all"
          >
            <!-- 可點擊的標題列 -->
            <button
              type="button"
              class="flex w-full items-center justify-between bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              @click="toggleCategory(category.id)"
            >
              <div class="flex items-center gap-2">
                <span>{{ category.emoji }}</span>
                <span class="font-bold text-gray-700">{{ category.label }}</span>
                <span class="text-sm text-gray-500">
                  (已選
                  {{
                    optionalTags.filter((tag) => category.tags.some((t) => tag === `#${t}`)).length
                  }})
                </span>
              </div>
              <span
                class="text-gray-400 transition-transform duration-300"
                :class="{ 'rotate-180': expandedCategory === category.id }"
              >
                ▼
              </span>
            </button>

            <!-- 標籤內容區（可展開/摺疊） -->
            <div
              class="grid transition-all duration-300 ease-out"
              :class="expandedCategory === category.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
              <div class="overflow-hidden">
                <div class="flex flex-wrap gap-2 bg-white p-4">
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

    <div v-if="showConfirmButton" class="mt-6 flex gap-3">
      <button
        type="button"
        class="flex-1 rounded-full bg-gray-100 py-3 font-bold text-gray-700 transition-all hover:bg-gray-200"
        @click="handleClose"
      >
        取消
      </button>
      <button
        type="button"
        class="flex-1 rounded-full bg-orange-400 py-3 font-bold text-white shadow-md transition-all hover:brightness-110"
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
