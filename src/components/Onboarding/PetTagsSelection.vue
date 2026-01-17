<script setup>
import { requiredTagGroups } from '@/utils/profileData.js'
import { useTagSelection } from '@/composables/useTagSelection.js'
import TagSelector from '@/components/Share/TagSelector.vue'

const emit = defineEmits(['submit', 'back'])

const {
  requiredSelections,
  optionalTags,
  maxOptionalTags,
  requiredCount,
  allRequiredSelected,
  selectRequiredTag,
  toggleOptionalTag,
  removeOptionalTag,
  getSubmitData
} = useTagSelection()

const submitForm = () => {
  if (!allRequiredSelected.value) return
  emit('submit', getSubmitData())
}
</script>

<template>
  <div class="flex flex-col p-6 text-gray-800">
    <h2 class="mb-2 text-center text-2xl font-bold">為毛孩選擇專屬標籤</h2>
    <p class="mb-6 text-center text-sm text-gray-500">這些標籤將幫助找到最適合的玩伴！</p>

    <div class="flex max-h-[70vh] flex-col gap-6 overflow-y-auto pr-2">
      <!-- 使用 TagSelector 元件但隱藏按鈕 -->
      <div class="space-y-6">
        <!-- 必選區 -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">⭐</span>
            <h3 class="text-lg font-bold text-gray-700">
              必選區
              <span class="ml-2 text-sm font-normal text-gray-500">
                ({{ requiredCount }}/{{ requiredTagGroups.length }})
              </span>
            </h3>
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
                <span class="mt-0.5 text-center text-xs text-gray-400">{{
                  option.description
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 非必選區 -->
        <TagSelector
          :required-selections="requiredSelections"
          :optional-tags="optionalTags"
          :max-optional-tags="maxOptionalTags"
          :required-count="requiredCount"
          :show-required="false"
          title=""
          @select-required="selectRequiredTag"
          @toggle-optional="toggleOptionalTag"
          @remove-optional="removeOptionalTag"
          @close="emit('back')"
          @confirm="submitForm"
        />
      </div>

      <!-- 按鈕群組 -->
      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-xl border-2 border-gray-300 bg-white py-4 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          @click="emit('back')"
        >
          上一步
        </button>
        <!-- TODO: Replace with CSS variable var(--app-primary) -->
        <!-- TODO: Replace #ffa75f with var(--app-primary) -->
        <button
          type="button"
          class="flex-1 rounded-xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          style="background-color: #ffa75f"
          :disabled="!allRequiredSelected"
          @click="submitForm"
        >
          完成註冊
        </button>
      </div>
    </div>
  </div>
</template>
