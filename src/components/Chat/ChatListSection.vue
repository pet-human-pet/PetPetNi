<script setup>
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat.js'
import { useChatMenus } from '@/composables/useChatMenus'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import ChatListItem from '@/components/Chat/ChatListItem.vue'

const store = useChatStore()
const toast = useToast()
const { showConfirm } = useConfirm()

const success = (msg) => toast.success(msg)

const { contextMenu, openContextMenu, handleMenuAction, handleDirectDelete } = useChatMenus({
  store,
  success,
  showConfirm
})

// 列表過濾與排序邏輯
const sortChats = (list) => {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1
    if (a.pinned && b.pinned) {
      const pinTimeA = a.pinnedAt || 0
      const pinTimeB = b.pinnedAt || 0
      if (pinTimeA !== pinTimeB) return pinTimeB - pinTimeA
    }
    const getLastTime = (chat) =>
      chat.msgs?.length ? chat.msgs[chat.msgs.length - 1].timestamp || 0 : 0
    return getLastTime(b) - getLastTime(a)
  })
}

const filteredChatList = computed(() => {
  let list = []
  if (store.currentCategory === 'friendList') {
    list = [...store.currentChatList]
    return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
  } else if (store.currentCategory === 'match') {
    // 聊天:顯示已成為好友的對話
    list = store.db.match.filter((chat) => chat.status === 'friend' && !chat.isDeleted)
  } else if (store.currentCategory === 'matching') {
    // 配對:顯示配對中的對話
    list = store.db.match.filter((chat) => chat.status === 'matching' && !chat.isDeleted)
  } else if (store.currentCategory === 'knock') {
    // 敲敲門:顯示陌生人對話
    list = store.db.stranger.filter((chat) => !chat.isDeleted)
  } else {
    list = store.currentChatList
  }
  return sortChats(list)
})

const isMessagingCategory = computed(() =>
  ['match', 'matching', 'knock'].includes(store.currentCategory)
)

const isAiHistoryExpanded = ref(false)
</script>

<template>
  <div
    class="bg-bg-surface md:border-border-default relative flex flex-1 shrink-0 flex-col pb-16 md:h-full md:w-95 md:flex-none md:border-r md:pb-0"
  >
    <!-- Mobile Navigation Tabs (Category Sub-switch) -->
    <div
      v-if="isMessagingCategory"
      class="border-border-default no-scrollbar mb-2 flex shrink-0 gap-6 overflow-x-auto border-b px-6 pt-4 pb-2 md:hidden"
    >
      <button
        v-for="tab in [
          { id: 'match', label: '聊天' },
          { id: 'matching', label: '配對' },
          { id: 'knock', label: '敲敲門' }
        ]"
        :key="tab.id"
        class="cursor-pointer text-sm font-black whitespace-nowrap transition-all"
        :class="[
          store.currentCategory === tab.id
            ? 'text-brand-primary border-brand-primary border-b-2 pb-1'
            : 'text-fg-muted'
        ]"
        @click="store.switchCategory(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- AI New Chat Button -->
    <div v-if="store.currentCategory === 'ai'" class="shrink-0 px-2 pb-2">
      <div
        class="group text-fg-primary flex w-full cursor-pointer items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all hover:shadow-sm"
        @click="store.createAiChat()"
      >
        <div
          class="bg-brand-primary flex h-6 w-6 items-center justify-center rounded-full text-white transition-transform duration-300 group-active:-rotate-90"
        >
          <i class="fa-solid fa-plus text-xs"></i>
        </div>
        <span>開啟新對話</span>
      </div>
    </div>

    <!-- Scrollable Chat List -->
    <div class="no-scrollbar flex-1 overflow-y-auto px-2">
      <!-- AI History Toggle (Always Visible) -->
      <div v-if="store.currentCategory === 'ai'" class="mb-2">
        <div
          class="bg-bg-base text-fg-secondary flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm font-bold hover:bg-black/5"
          @click="isAiHistoryExpanded = !isAiHistoryExpanded"
        >
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-bars w-6 text-center text-lg"></i>
            <span>歷史對話 ({{ filteredChatList.length }})</span>
          </div>
          <i
            class="fa-solid fa-chevron-down transition-transform duration-200"
            :class="{ '-rotate-90': !isAiHistoryExpanded }"
          ></i>
        </div>
      </div>

      <!-- AI List Mode -->
      <template v-if="store.currentCategory === 'ai'">
        <div
          v-show="isAiHistoryExpanded"
          class="no-scrollbar max-h-22 overflow-y-auto md:max-h-none"
        >
          <div
            v-for="chat in filteredChatList"
            :key="chat.id"
            class="c-chat-item group"
            :class="{ 'bg-bg-base': store.activeChatId === chat.id }"
            @click="store.openChat(chat.id)"
          >
            <i
              class="fa-regular fa-message mr-3 text-sm opacity-70"
              :class="{ 'text-brand-primary': store.activeChatId === chat.id }"
            ></i>
            <span
              class="flex-1 truncate text-sm font-medium"
              :class="{ 'text-brand-primary': store.activeChatId === chat.id }"
            >
              {{ chat.title || '未命名對話' }}
            </span>
            <div
              class="p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
              @click.stop="handleDirectDelete(chat)"
            >
              <i class="fa-solid fa-trash-can text-xs"></i>
            </div>
          </div>
        </div>

        <!-- AI Welcome Block -->
        <div
          v-if="!store.activeChatId"
          class="border-border-default mt-4 flex shrink-0 flex-col items-center border-t pt-6 md:hidden"
        >
          <div
            class="border-border-default mb-3 h-16 w-16 rounded-full border bg-white p-2 shadow-sm"
          >
            <img :src="store.aiDb.agent.avatar" class="h-full w-full object-contain" />
          </div>
          <h2 class="text-fg-primary text-lg font-bold">我是{{ store.aiDb.agent.name }}</h2>
          <p class="text-fg-secondary mt-2 mb-5 text-sm">{{ store.aiDb.agent.description }}</p>
          <div class="grid w-full grid-cols-2 gap-3 px-1">
            <button
              v-for="prompt in store.aiDb.agent.defaultPrompts"
              :key="prompt.text"
              class="c-ai-prompt-btn"
              @click="store.startAiFeature(prompt.text)"
            >
              <div class="c-ai-prompt-btn__icon"><i class="fa-solid" :class="prompt.icon"></i></div>
              <span class="truncate">{{ prompt.text }}</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Friend List Mode -->
      <template v-else-if="store.currentCategory === 'friendList'">
        <ChatListItem
          :chat="store.db.myProfile"
          :is-active="store.selectedFriendId === store.currentUserId"
          :is-me="true"
          :is-friend-list-mode="true"
          class="mb-2"
          @click="store.selectedFriendId = store.currentUserId"
        />

        <div class="border-border-default mx-2 mb-2 border-b"></div>
        <div>
          <div
            class="text-fg-secondary hover:text-fg-primary mb-1 flex cursor-pointer items-center justify-between px-2 py-2 transition-colors select-none"
            @click="store.isFriendListExpanded = !store.isFriendListExpanded"
          >
            <div class="text-sm font-bold">好友 ({{ filteredChatList.length }})</div>
            <i
              class="fa-solid fa-chevron-down text-sm transition-transform duration-200"
              :class="{ '-rotate-90': !store.isFriendListExpanded }"
            ></i>
          </div>
          <div v-show="store.isFriendListExpanded">
            <ChatListItem
              v-for="chat in filteredChatList"
              :key="chat.id"
              :chat="chat"
              :is-active="store.selectedFriendId === chat.id"
              :show-pin="false"
              :is-friend-list-mode="true"
              @click="store.selectedFriendId = chat.id"
              @contextmenu="openContextMenu"
            />
          </div>
        </div>
      </template>

      <!-- Standard List Mode -->
      <template v-else>
        <ChatListItem
          v-for="chat in filteredChatList"
          :key="chat.id"
          :chat="chat"
          :is-active="store.activeChatId === chat.id"
          @click="store.openChat(chat.id)"
          @contextmenu="openContextMenu"
        />
      </template>
    </div>

    <div
      v-if="contextMenu.visible"
      class="border-border-default bg-bg-surface text-fg-primary fixed z-100 w-32 overflow-hidden rounded-xl border py-1 text-sm shadow-xl"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <div class="c-chat-menu" @click="handleMenuAction('pin')">
        <i
          class="fa-solid fa-thumbtack text-brand-primary"
          :class="{ 'rotate-45': contextMenu.pinned }"
        ></i>
        {{ contextMenu.pinned ? '取消置頂' : '置頂對話' }}
      </div>
      <div class="border-border-default my-1 border-t opacity-50"></div>

      <div
        v-if="contextMenu.chatType === 'community'"
        class="c-chat-menu c-chat-menu-danger"
        @click="handleMenuAction('leave')"
      >
        <i class="fa-solid fa-door-open"></i> 退出社群
      </div>

      <div class="c-chat-menu c-chat-menu-danger" @click="handleMenuAction('delete')">
        <i class="fa-solid fa-trash-can"></i> 刪除對話
      </div>
    </div>
  </div>
</template>
