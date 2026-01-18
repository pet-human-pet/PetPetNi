import { ref, computed } from 'vue'
import { requiredTagGroups } from '@/utils/profileData.js'

/**
 * 標籤選擇 Composable
 * 提供必選標籤和非必選標籤的狀態管理邏輯
 *
 * @param {string[]} initialOptionalTags - 初始非必選標籤
 * @param {number} maxOptionalTags - 非必選標籤上限
 * @param {Object} initialRequiredSelections - 初始必選標籤選擇
 */
export function useTagSelection(
  initialOptionalTags = [],
  maxOptionalTags = 5,
  initialRequiredSelections = null
) {
  // 必選標籤選擇狀態
  const requiredSelections = ref(
    initialRequiredSelections ||
      requiredTagGroups.reduce((acc, group) => {
        acc[group.id] = null
        return acc
      }, {})
  )

  // 非必選標籤
  const optionalTags = ref([...initialOptionalTags])

  // 計算必選項目完成數
  const requiredCount = computed(() => {
    return Object.values(requiredSelections.value).filter((v) => v !== null).length
  })

  // 是否所有必選項目都已選擇
  const allRequiredSelected = computed(() => {
    return requiredCount.value === requiredTagGroups.length
  })

  // 選擇必選標籤
  const selectRequiredTag = (groupId, value) => {
    requiredSelections.value[groupId] = value
  }

  // 切換非必選標籤（帶 # 前綴格式）
  const toggleOptionalTag = (tag, withHash = true) => {
    const formattedTag = withHash ? `#${tag}` : tag
    const index = optionalTags.value.indexOf(formattedTag)
    if (index > -1) {
      optionalTags.value.splice(index, 1)
    } else if (optionalTags.value.length < maxOptionalTags) {
      optionalTags.value.push(formattedTag)
    }
  }

  // 移除非必選標籤
  const removeOptionalTag = (index) => {
    optionalTags.value.splice(index, 1)
  }

  // 重置所有選擇
  const resetSelections = () => {
    requiredSelections.value = requiredTagGroups.reduce((acc, group) => {
      acc[group.id] = null
      return acc
    }, {})
    optionalTags.value = []
  }

  // 取得格式化的提交資料
  const getSubmitData = () => {
    const hardTags = Object.entries(requiredSelections.value)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => `#${key}:${value}`)

    return {
      requiredTags: hardTags,
      optionalTags: optionalTags.value
    }
  }

  return {
    // 狀態
    requiredSelections,
    optionalTags,
    maxOptionalTags,

    // 計算屬性
    requiredCount,
    allRequiredSelected,

    // 方法
    selectRequiredTag,
    toggleOptionalTag,
    removeOptionalTag,
    resetSelections,
    getSubmitData
  }
}
