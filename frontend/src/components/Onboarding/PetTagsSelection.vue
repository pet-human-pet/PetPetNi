<script setup>
import { ref, watch } from 'vue'
import { requiredTagGroups } from '@/utils/profileData.js'
import { useTagSelection } from '@/composables/useTagSelection.js'
import TagSelector from '@/components/Share/TagSelector.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

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

// 滑動卡片狀態管理
const currentCardIndex = ref(0) // 當前卡片索引 (0: 必填資訊, 1: 特色標籤)
const cardContainerRef = ref(null)

// 必填資訊手風琴狀態（獨立）
const requiredExpandedSection = ref('size') // 預設展開「體型」

// 滑動到指定卡片
const scrollToCard = (index) => {
  const container = cardContainerRef.value
  if (container) {
    const cardWidth = container.offsetWidth
    container.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    })
  }
}

// 監聽滑動事件更新當前索引
const handleScroll = () => {
  const container = cardContainerRef.value
  if (container) {
    const cardWidth = container.offsetWidth
    const scrollLeft = container.scrollLeft
    const newIndex = Math.round(scrollLeft / cardWidth)
    if (newIndex !== currentCardIndex.value) {
      currentCardIndex.value = newIndex
    }
  }
}

// 切換必填資訊手風琴（確保單一展開）
const toggleRequiredSection = (sectionId) => {
  requiredExpandedSection.value = requiredExpandedSection.value === sectionId ? null : sectionId
}

// 處理必填標籤選擇並自動展開下一個區塊
const handleSelectRequiredTag = (groupId, value) => {
  selectRequiredTag(groupId, value)

  // 確保在第一張卡片且有選擇值
  if (currentCardIndex.value === 0 && value) {
    // 根據選擇的區塊，自動展開下一個（快速展開）
    setTimeout(() => {
      if (groupId === 'size') {
        requiredExpandedSection.value = 'personality_type'
      } else if (groupId === 'personality_type') {
        requiredExpandedSection.value = 'activity_level'
      }
    }, 100)
  }
}

// 監聽必填選項變化，自動展開下一個區塊
watch(
  () => requiredSelections.value,
  (newVal, oldVal) => {
    if (currentCardIndex.value !== 0) return

    if (newVal.size && (!oldVal || !oldVal.size)) {
      setTimeout(() => {
        requiredExpandedSection.value = 'personality_type'
      }, 100)
    } else if (newVal.personality_type && (!oldVal || !oldVal.personality_type)) {
      setTimeout(() => {
        requiredExpandedSection.value = 'activity_level'
      }, 100)
    }
  },
  { deep: true }
)

// 監聽必選項完成狀態，自動切換到選填頁
watch(allRequiredSelected, (isAllSelected) => {
  if (isAllSelected && currentCardIndex.value === 0) {
    setTimeout(() => {
      scrollToCard(1)
    }, 300)
  }
})

const submitForm = () => {
  if (!allRequiredSelected.value) return
  emit('submit', getSubmitData())
}
</script>

<template>
  <div class="flex h-full max-h-screen flex-col overflow-y-hidden p-4 text-gray-800 md:p-6">
    <h2 class="mb-2 text-center text-2xl font-bold">為毛孩選擇專屬標籤</h2>
    <p class="mb-4 text-center text-sm text-gray-500">這些標籤將幫助找到最適合的玩伴！</p>

    <!-- 卡片指示器 -->
    <div class="mb-4 flex justify-center gap-2">
      <button
        v-for="(label, index) in ['必填資訊', '特色標籤']"
        :key="index"
        type="button"
        :class="[
          'h-2 rounded-full transition-all duration-300',
          // TODO: Replace bg-orange-400 with var(--app-primary)
          currentCardIndex === index ? 'w-8 bg-orange-400' : 'w-2 bg-gray-300 hover:bg-gray-400'
        ]"
        :aria-label="`切換到${label}`"
        @click="scrollToCard(index)"
      />
    </div>

    <!-- 滑動卡片容器（固定高度，內部滾動） -->
    <div
      ref="cardContainerRef"
      class="hide-scrollbar flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth"
      role="region"
      aria-label="標籤選擇卡片"
      @scroll="handleScroll"
    >
      <div class="flex">
        <!-- 卡片 1: 必填資訊 -->
        <div class="h-full w-full shrink-0 snap-center overflow-y-auto px-2">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-lg">⭐</span>
              <h3 class="text-lg font-bold text-gray-700">
                必填資訊
                <span class="ml-2 text-sm font-normal text-gray-500">
                  ({{ requiredCount }}/{{ requiredTagGroups.length }})
                </span>
              </h3>
            </div>

            <!-- 必填資訊手風琴 -->
            <div
              v-for="group in requiredTagGroups"
              :key="group.id"
              class="overflow-hidden rounded-xl border-2 border-gray-200 transition-all"
            >
              <!-- 可點擊的標題列 -->
              <button
                type="button"
                class="flex w-full items-center justify-between bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                @click="toggleRequiredSection(group.id)"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ group.options[0].emoji }}</span>
                  <span class="font-bold text-gray-700">{{ group.label }}</span>
                  <!-- TODO: Replace text-orange-500 with var(--app-primary) -->
                  <span v-if="requiredSelections[group.id]" class="text-sm text-orange-500">
                    ✓ 已選擇
                  </span>
                </div>
                <span
                  class="text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': requiredExpandedSection === group.id }"
                >
                  ▼
                </span>
              </button>

              <!-- 選項內容區 -->
              <div
                class="grid transition-all duration-300 ease-out"
                :class="
                  requiredExpandedSection === group.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                "
              >
                <div class="overflow-hidden">
                  <div class="grid grid-cols-3 gap-2 bg-white p-4">
                    <button
                      v-for="option in group.options"
                      :key="option.value"
                      type="button"
                      :class="[
                        'flex flex-col items-center justify-center rounded-xl border-2 py-3 transition-all',
                        // TODO: Replace border-orange-400 and bg-orange-50 with var(--app-primary) variants
                        requiredSelections[group.id] === option.value
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      ]"
                      @click="handleSelectRequiredTag(group.id, option.value)"
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
            </div>
          </div>
        </div>

        <!-- 卡片 2: 特色標籤 -->
        <div class="h-full w-full shrink-0 snap-center overflow-y-auto px-2">
          <TagSelector
            :required-selections="requiredSelections"
            :optional-tags="optionalTags"
            :max-optional-tags="maxOptionalTags"
            :required-count="requiredCount"
            :show-required="false"
            :show-confirm-button="false"
            title=""
            @select-required="selectRequiredTag"
            @toggle-optional="toggleOptionalTag"
            @remove-optional="removeOptionalTag"
            @close="emit('back')"
            @confirm="submitForm"
          />
        </div>
      </div>
    </div>

    <div class="mt-2 text-center text-xs text-gray-400">👈 左右滑動切換 👉</div>

    <!-- 按鈕群組 -->
    <div class="mt-4 flex gap-3">
      <button
        type="button"
        class="flex-1 rounded-xl border-2 border-gray-300 bg-white py-4 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
        @click="emit('back')"
      >
        上一步
      </button>
      <!-- TODO: Replace #ffa75f with var(--app-primary) -->
      <button
        type="button"
        class="flex-1 rounded-xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        style="background-color: #ffa75f"
        :disabled="!allRequiredSelected || loading"
        @click="submitForm"
      >
        <div v-if="loading" class="loader-container">
          <svg class="ring-progress" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20"></circle>
            <circle cx="25" cy="25" r="20"></circle>
          </svg>
        </div>
        <span v-else>完成註冊</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 隱藏滾動條但保留滑動功能 */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Custom Loader Styles */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px; /* Adjust to button height */
}

.ring-progress {
  width: 24px; /* Scaled down from 50px */
  height: 24px;
  animation: spin 1s linear infinite;
}

.ring-progress circle {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3); /* Optimized background ring for white button text/orange bg */
  stroke-width: 4;
}

.ring-progress circle:nth-child(2) {
  stroke: #ffffff; /* White stroke to contrast with orange button */
  stroke-dasharray: 150; /* Adjusted for smaller size logic? No, dasharray depends on viewBox radius (20*2*PI approx 125). 150 covers it. */
  stroke-dashoffset: 50;
  stroke-linecap: round;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
