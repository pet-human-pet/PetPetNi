// src/composables/useScrollLock.js
import { ref, watch, onUnmounted, unref } from 'vue'

// 全域變數：所有引入這個 Composable 的組件共用這個計數器
const lockCount = ref(0)

export function useScrollLock(shouldLock) {
  let isLockedByMe = false

  const updateLock = (isActive) => {
    if (isActive) {
      if (!isLockedByMe) {
        lockCount.value++
        isLockedByMe = true
      }
    } else {
      if (isLockedByMe) {
        lockCount.value--
        isLockedByMe = false
      }
    }

    // 實際操作 DOM
    if (lockCount.value > 0) {
      document.body.classList.add('u-lock-scroll')
    } else {
      document.body.classList.remove('u-lock-scroll')
    }
  }

  // 監聽傳入的參數 (支援 ref 或 boolean)
  watch(
    () => unref(shouldLock),
    (val) => updateLock(val),
    { immediate: true }
  )

  // 當組件被銷毀 (例如切換頁面) 時，自動解鎖
  onUnmounted(() => {
    updateLock(false)
  })
}
