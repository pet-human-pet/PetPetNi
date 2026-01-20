<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat.js'
import { useChatMenus } from '@/composables/useChatMenus'
import { useChatTimer } from '@/composables/useChatTimer'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useReport } from '@/composables/useReport'

import FriendProfile from '@/components/Chat/FriendProfile.vue'
import ChatInputArea from '@/components/Chat/ChatInputArea.vue'
import MessageBubble from '@/components/Chat/MessageBubble.vue'

const router = useRouter()
const store = useChatStore()
const toast = useToast()
const { showConfirm } = useConfirm()
const { showReport } = useReport()

const success = (msg) => toast.success(msg)
const error = (msg) => toast.error(msg)

const { activeMsgId, openMsgMenu, handleMsgAction } = useChatMenus({
  store,
  success,
  showConfirm,
  showReport
})
const { timeLeft } = useChatTimer(store)

const msgContainer = ref(null)
const inputAreaRef = ref(null)

const handleStartChat = (id) => {
  store.switchCategory('match')
  store.openChat(id)
  store.selectedFriendId = null
  store.privateSubTab = 'friend'
}

const handleViewProfile = (id) => {
  router.push({ name: 'Profile', params: { id } })
}

const handleRemoveFriend = async (id) => {
  const isConfirmed = await showConfirm({
    title: '解除好友',
    message: '確定要將此人從好友名單中移除嗎？這將會徹底刪除其資料。',
    type: 'danger',
    confirmText: '解除'
  })
  if (isConfirmed) {
    store.removeFriend(id)
    success('已解除好友關係')
    store.selectedFriendId = null
  }
}

const handleToast = (msg) => error(msg)

watch(
  () => store.activeChat?.msgs.length,
  async () => {
    await nextTick()
    if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
)

const remainingMsgs = computed(() => {
  if (!store.activeChat) return 0
  const limit = store.activeChat.type === 'knock' ? 3 : 10
  return limit - store.myMessageCount
})

const handleAcceptStranger = () => store.acceptStranger(store.activeChat.id)
const handleRejectStranger = async () => {
  const isConfirmed = await showConfirm({
    title: '拒絕敲敲門',
    message: '確定要拒絕嗎？',
    type: 'danger',
    confirmText: '拒絕'
  })
  if (isConfirmed) store.rejectStranger(store.activeChat.id)
}
const handleBecomeFriendFromLimit = async () => {
  const isConfirmed = await showConfirm({
    title: '成為好友',
    message: '確定要與對方成為好友嗎？',
    confirmText: '確定'
  })
  if (isConfirmed) store.becomeFriend(store.activeChat.id)
}

const handleRejectMatch = async () => {
  const isConfirmed = await showConfirm({
    title: '拒絕配對',
    message: '確定要拒絕嗎？拒絕後將無法再與對方互動。',
    type: 'danger',
    confirmText: '拒絕'
  })
  if (isConfirmed) store.deleteChat(store.activeChat.id)
}

const handleBubbleAction = (action, msg) => {
  handleMsgAction(action, msg)
}

const handleMenuOpen = (msgId) => {
  if (store.chatMode === 'LOCKED' || store.activeChat.isBlocked) return
  openMsgMenu(msgId)
}
</script>

<template>
  <div
    class="bg-bg-base fixed inset-0 z-50 flex h-full min-w-0 flex-1 transform flex-col transition-transform duration-300 md:static md:z-auto md:transform-none"
    :class="[
      store.activeChatId || store.selectedFriendId
        ? 'translate-x-0'
        : 'translate-x-full md:translate-x-0'
    ]"
  >
    <!-- Empty States -->
    <div
      v-if="!store.activeChat && !store.selectedFriend"
      class="text-fg-secondary hidden h-full flex-1 flex-col items-center justify-center md:flex"
    >
      <i class="fa-solid fa-comments mb-4 text-6xl text-gray-300"></i>
      <p class="font-semi text-base">請選擇一個對話或好友開始</p>
    </div>

    <!-- Friend Profile -->
    <FriendProfile
      v-else-if="store.selectedFriend"
      @chat="handleStartChat"
      @profile="handleViewProfile"
      @delete="handleRemoveFriend"
      @close="store.selectedFriendId = null"
    />

    <!-- Chat Window -->
    <div v-else-if="store.activeChat" class="relative flex h-full flex-col">
      <!-- Chat Header -->
      <div
        class="border-border-default bg-bg-surface z-10 flex h-17.5 shrink-0 items-center justify-between border-b px-6"
      >
        <div class="flex items-center gap-3">
          <i
            class="fa-solid fa-chevron-left text-fg-primary cursor-pointer text-xl md:hidden"
            @click="store.activeChatId = null"
          ></i>
          <div
            class="h-10 w-10 rounded-full bg-gray-200 bg-cover"
            :style="{ backgroundImage: `url(${store.activeChat.avatar})` }"
          ></div>
          <div>
            <div class="text-fg-primary flex items-center gap-2 font-bold">
              {{ store.activeChat.name }}
            </div>
            <div class="text-fg-secondary text-xs">
              <template v-if="store.activeChat.type === 'event'">
                <span :class="timeLeft.includes('剩餘') ? 'font-bold text-red-500' : ''">
                  {{ timeLeft || '活動進行中' }}
                </span>
              </template>
              <template v-else-if="store.activeChat.type === 'community'">社群</template>
              <template v-else>{{
                store.activeChat.status === 'matching' ? '配對互動中' : '線上'
              }}</template>
            </div>
          </div>
        </div>
      </div>

      <!-- Notice Bar -->
      <div
        v-if="store.activeChat.notice"
        class="flex shrink-0 items-center justify-between border-b border-yellow-100 bg-yellow-50 px-4 py-2 text-sm text-yellow-800"
      >
        <div class="flex items-center">
          <i class="fa-solid fa-bullhorn mr-2"></i> {{ store.activeChat.notice }}
        </div>
        <button
          class="rounded p-1 hover:bg-yellow-200/50"
          @click="store.clearNotice(store.activeChat.id)"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Messages Area -->
      <div
        ref="msgContainer"
        class="bg-bg-base no-scrollbar flex-1 space-y-4 overflow-y-auto p-6"
        :class="{ 'pb-40': store.chatMode === 'LOCKED', 'pb-20': store.activeChat.isBlocked }"
      >
        <MessageBubble
          v-for="(msg, index) in store.activeChat.msgs"
          :key="msg.id"
          :msg="msg"
          :is-me="msg.sender === 'me'"
          :avatar="store.activeChat.avatar"
          :show-avatar="msg.sender !== 'me'"
          :menu-visible="activeMsgId === msg.id"
          :is-first="index === 0"
          @menu-open="handleMenuOpen"
          @action="handleBubbleAction"
        />
      </div>

      <!-- Bottom Interaction Area -->
      <div class="bg-bg-surface w-full shrink-0">
        <!-- Locked Mode (Knock Knock) -->
        <div
          v-if="store.chatMode === 'LOCKED'"
          class="flex w-full flex-col items-center gap-4 border-t border-red-100 bg-red-50 p-6 md:py-8"
        >
          <div class="text-base font-bold text-red-500 md:text-lg">
            這是一則敲敲門訊息，是否接受？
          </div>
          <div class="flex gap-6">
            <button
              class="text-fg-secondary border-border-default rounded-full border bg-white px-8 py-2 font-bold transition-all hover:bg-gray-50 active:scale-95"
              @click="handleRejectStranger"
            >
              拒絕
            </button>
            <button
              class="rounded-full bg-red-500 px-8 py-2 font-bold text-white shadow-md transition-all hover:bg-red-600 active:scale-95"
              @click="handleAcceptStranger"
            >
              接受
            </button>
          </div>
        </div>

        <!-- Blocked User -->
        <div
          v-else-if="store.activeChat.isBlocked"
          class="flex w-full flex-col items-center gap-2 border-t border-red-100 bg-red-50 p-4"
        >
          <div class="text-sm font-bold text-red-500">您已封鎖此用戶</div>
          <div class="text-fg-secondary text-xs">如需傳送訊息，請先解除封鎖。</div>
          <button
            class="mt-2 rounded-full bg-zinc-100 px-4 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-200"
            @click="store.unblockChat(store.activeChatId)"
          >
            解除封鎖
          </button>
        </div>

        <!-- Standard Chat Input / Limit Counter -->
        <div v-else>
          <div v-if="store.chatMode === 'PET_MODE'" class="w-full shrink-0">
            <div
              v-if="store.isLimitReached"
              class="border-border-default bg-bg-base flex flex-col items-center gap-2 border-t p-4"
            >
              <div class="text-brand-primary text-sm font-bold">互動已達上限，是否成為好友？</div>
              <div class="flex gap-4">
                <button
                  class="rounded-full bg-zinc-200 px-6 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-300"
                  @click="handleRejectMatch"
                >
                  拒絕
                </button>
                <button
                  class="bg-brand-primary hover:bg-brand-primary/90 rounded-full px-6 py-1.5 text-sm font-medium text-white shadow-sm"
                  @click="handleBecomeFriendFromLimit"
                >
                  成為好友
                </button>
              </div>
            </div>
            <div
              v-else
              class="border-brand-primary/20 bg-brand-primary/10 text-fg-secondary flex items-center justify-center border-b px-4 py-2.5 text-sm font-bold"
            >
              <template v-if="store.activeChat.type === 'knock'">
                敲敲門試聊：剩餘 {{ remainingMsgs }} 句 (限制 30 字)
              </template>
              <template v-else> 配對互動中：剩餘 {{ remainingMsgs }} 句 (限制 30 字) </template>
            </div>
          </div>

          <ChatInputArea v-if="!store.isLimitReached" ref="inputAreaRef" @toast="handleToast" />
        </div>
      </div>
    </div>
  </div>
</template>
