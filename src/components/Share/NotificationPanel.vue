<script setup>
import { computed } from 'vue'
import { useActiveItem } from '@/composables/useActiveItem'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const { activeId, activate, deactivate, registerRef } = useActiveItem()
const notificationStore = useNotificationStore()
const { notifications, unreadCount } = storeToRefs(notificationStore)
const { markRead, markAllRead, removeNotification } = notificationStore

const PANEL_ID = 'notification-panel'

const isOpen = computed(() => activeId.value === PANEL_ID)

const toggle = () => {
  if (isOpen.value) {
    deactivate()
  } else {
    activate(PANEL_ID)
  }
}
</script>

<template>
  <!-- 註冊 root element 給 useActiveItem 使用，ID 必須對應 -->
  <div :ref="(el) => registerRef(PANEL_ID, el)" class="relative">
    <!-- header 通知icon 管理開關 -->
    <button
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
      title="通知"
      @click="toggle"
    >
      <i class="fa-regular fa-bell"></i>
      <span
        v-if="unreadCount > 0"
        class="absolute top-2 right-2 h-2 w-2 rounded-full border border-white bg-[#ff5e57]"
      />
    </button>

    <!-- 電腦版欄位 -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-50 mt-3 w-90 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
    >
      <!-- 通知欄header -->
      <div class="flex items-center justify-between px-4 py-3">
        <div class="text-base font-semibold text-zinc-900">通知</div>
        <button
          type="button"
          class="cursor-pointer text-sm text-zinc-500 hover:text-zinc-800"
          @click="markAllRead"
        >
          全部已讀
        </button>
      </div>

      <div class="border-t border-zinc-100"></div>

      <!-- 通知清單 -->
      <div class="border-b border-gray-100">
        <div class="no-scrollbar max-h-70 overflow-auto px-2 py-2">
          <div
            v-for="n in notifications"
            :key="n.id"
            class="mb-2 flex items-start gap-3 rounded-xl px-3 py-3 transition"
            :class="
              n.read
                ? 'bg-white hover:bg-zinc-50'
                : 'bg-[#fffcf7] ring-1 ring-[#ffe2c4] hover:bg-[#fff3e6]'
            "
          >
            <!-- 已讀/未讀點點 -->
            <div class="pt-2">
              <span
                class="block h-2 w-2 rounded-full"
                :class="n.read ? 'bg-zinc-100' : 'bg-red-400'"
              />
            </div>

            <!-- 通知icon -->
            <div
              class="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
            >
              <i class="fa-solid fa-shield-dog"></i>
            </div>

            <!-- 內容 -->
            <button type="button" class="min-w-0 flex-1 text-left" @click="markRead(n.id)">
              <div class="truncate text-sm font-semibold text-zinc-900">
                {{ n.title }}
              </div>
              <div class="mt-0.5 text-sm text-zinc-700">
                {{ n.desc }}
              </div>
              <div class="mt-1 text-xs text-zinc-400">
                {{ n.time }}
              </div>
            </button>

            <!-- 刪除 -->
            <button
              type="button"
              class="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="remove"
              @click.stop="removeNotification(n.id)"
            >
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
          <!-- 沒有通知時 -->
          <div
            v-if="notifications.length === 0"
            class="px-4 py-10 text-center text-sm text-zinc-500"
          >
            目前沒有通知
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
