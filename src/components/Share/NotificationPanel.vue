<script setup>
import { computed, ref } from 'vue'
import { useActiveItem } from '@/composables/useActiveItem'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { useScreen } from '@/composables/useScreen'
import { useScrollLock } from '@/composables/useScrollLock'

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

// Mobile check & Scroll Lock
const { breakpoints } = useScreen()
const isPanelMobile = breakpoints.smaller('md')
useScrollLock(computed(() => isOpen.value && isPanelMobile.value))

const isRefreshing = ref(false)
const pullDistance = ref(0)
const touchStart = ref(0)
function onTouchStart(e) {
  if (e.currentTarget && e.currentTarget.scrollTop === 0) {
    touchStart.value = e.touches[0].clientY
  }
}

function onTouchMove(e) {
  if (touchStart.value === 0) return
  const currentY = e.touches[0].clientY
  const diff = currentY - touchStart.value
  const container = e.currentTarget

  if (diff > 0 && container?.scrollTop <= 0) {
    if (e.cancelable) e.preventDefault()
    pullDistance.value = diff
  } else {
    pullDistance.value = 0
  }
}
function onTouchEnd() {
  if (pullDistance.value > 50 && !isRefreshing.value) {
    handleRefresh()
  }
  pullDistance.value = 0
  touchStart.value = 0
}
function handleRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1500)
}
</script>

<template>
  <div :ref="(el) => registerRef(PANEL_ID, el)" class="relative">
    <!-- header -->
    <button
      type="button"
      class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
      title="通知"
      @click="toggle"
    >
      <i class="fa-regular fa-bell"></i>
      <span
        v-if="unreadCount > 0"
        class="absolute top-2 right-2 h-2 w-2 rounded-full border border-white bg-[#ff5e57]"
      />
    </button>

    <div v-if="isOpen">
      <div class="fixed inset-0 z-2000 flex flex-col bg-gray-100 md:hidden">
        <!-- Mobile Header -->
        <div class="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center text-zinc-600"
            @click="deactivate"
          >
            <i class="fa-solid fa-chevron-left text-lg"></i>
          </button>
          <div class="text-lg font-bold text-zinc-800">通知</div>
          <button
            type="button"
            class="text-sm font-medium text-zinc-500 active:text-zinc-800"
            @click="markAllRead"
          >
            全部已讀
          </button>
        </div>

        <!-- 下拉更新 -->
        <div
          class="flex items-center justify-center overflow-hidden bg-gray-50 transition-all duration-200"
          :style="{
            height: isRefreshing
              ? '50px'
              : pullDistance > 0
                ? Math.min(pullDistance, 60) + 'px'
                : '0px'
          }"
        >
          <i
            class="fa-solid fa-spinner text-zinc-400"
            :class="{
              'animate-spin': isRefreshing,
              'rotate-180': !isRefreshing && pullDistance > 30
            }"
          ></i>
        </div>

        <!-- Mobile -->
        <div
          class="flex-1 overflow-y-auto p-4"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div v-if="notifications.length > 0" class="flex flex-col justify-center gap-3">
            <div
              v-for="n in notifications"
              :key="n.id"
              class="flex items-center gap-3 rounded-2xl px-3 py-2 shadow-sm"
              :class="n.read ? 'bg-white hover:bg-zinc-50' : 'notification-list ring-2'"
              @click="markRead(n.id)"
            >
              <!-- 通知點點 -->
              <div class="flex flex-col items-center gap-1">
                <div class="h-2 w-2">
                  <span v-if="!n.read" class="block h-2 w-2 rounded-full bg-[#ff5e57]"></span>
                </div>
              </div>
              <!-- Icon -->
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white text-zinc-400 shadow-sm"
              >
                <i class="fa-solid fa-shield-dog text-lg"></i>
              </div>

              <!-- 通知內容 -->
              <div class="min-w-0 flex-1 pt-0.5">
                <div class="mb-0.5 line-clamp-1 text-[15px] font-bold text-zinc-800">
                  {{ n.title }}
                </div>
                <div class="mb-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                  {{ n.desc }}
                </div>
                <div class="text-xs text-zinc-400">
                  {{ n.time }}
                </div>
              </div>

              <!-- 刪除 -->
              <button
                type="button"
                class="mt-1 flex h-8 w-8 items-center justify-center text-zinc-400 active:text-[#ff5e57]"
                @click.stop="removeNotification(n.id)"
              >
                <i class="fa-regular fa-trash-can text-lg"></i>
              </button>
            </div>

            <!-- Footer -->
            <div class="mt-4 pb-8 text-center text-sm text-zinc-400">沒有更多通知</div>
          </div>

          <div v-else class="flex h-64 flex-col items-center justify-center text-zinc-400">
            <i class="fa-regular fa-bell-slash mb-2 text-3xl"></i>
            <div>目前沒有新通知</div>
          </div>
        </div>
      </div>

      <!-- DESKTOP -->
      <div
        class="absolute right-0 z-50 mt-3 hidden w-90 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] md:block"
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
          <!-- 下拉更新 -->
          <div
            class="flex items-center justify-center overflow-hidden bg-gray-50 transition-all duration-200"
            :style="{
              height: isRefreshing
                ? '40px'
                : pullDistance > 0
                  ? Math.min(pullDistance, 50) + 'px'
                  : '0px'
            }"
          >
            <i
              class="fa-solid fa-spinner text-zinc-400"
              :class="{
                'animate-spin': isRefreshing,
                'rotate-180': !isRefreshing && pullDistance > 30
              }"
            ></i>
          </div>

          <div
            class="no-scrollbar max-h-70 overflow-auto px-2 py-2"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div
              v-for="n in notifications"
              :key="n.id"
              class="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 transition"
              :class="n.read ? 'bg-white hover:bg-zinc-50' : 'notification-list ring-1'"
            >
              <!-- 通知點點 -->
              <div class="pt-2">
                <span
                  class="block h-2 w-2 rounded-full"
                  :class="n.read ? 'bg-zinc-100' : 'bg-red-400'"
                />
              </div>

              <!-- Icon -->
              <div
                class="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
              >
                <i class="fa-solid fa-shield-dog"></i>
              </div>

              <!-- 通知內容 -->
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
                class="mt-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700"
                aria-label="remove"
                @click.stop="removeNotification(n.id)"
              >
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
            <!-- Footer -->
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
  </div>
</template>
