<script setup>
import { ref, onMounted } from 'vue' // 引入 Vue 的響應式與生命週期函式

// 1. 內部狀態：控制彈窗是否顯示
const isVisible = ref(false)

// 2. 當元件掛載時，檢查瀏覽器是否有「已同意」的紀錄
onMounted(() => {
  const hasAccepted = localStorage.getItem('chat-rules-accepted')
  // 如果沒有紀錄，就顯示彈窗
  if (!hasAccepted) {
    isVisible.value = true
  }
})

// 3. 按下「我同意」的動作
const handleAccept = () => {
  // 儲存紀錄到瀏覽器 (LocalStorage)
  localStorage.setItem('chat-rules-accepted', 'true')
  // 關閉彈窗
  isVisible.value = false
}
</script>

<template>
  <div
    v-if="isVisible"
    class="u-lock-scroll fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
  >
    <div
      class="c-card bg-bg-base border-border-default shadow-dialog relative w-full max-w-sm border"
    >
      <h2 class="c-title text-fg-primary mb-4 flex items-center gap-2 font-bold">
        <span>🚫</span> 聊天室小提醒
      </h2>

      <ul class="text-fg-secondary mb-6 space-y-4 text-sm">
        <li class="flex gap-2"><span>-</span> <span>保持友善，避免人身攻擊。</span></li>
        <li class="flex gap-2"><span>-</span> <span>禁止傳送違法或色情內容。</span></li>
        <li class="flex gap-2"><span>-</span> <span>請勿隨意透露個人隱私資訊。</span></li>
      </ul>

      <button
        class="c-btn--primary rounded-btn bg-btn-primary text-fg-primary w-full py-3 py-3.5 font-bold transition-opacity hover:opacity-90"
        @click="handleAccept"
      >
        我同意，進入聊天室
      </button>
    </div>
  </div>
</template>
