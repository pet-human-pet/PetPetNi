<script setup>
import { ref, nextTick, computed } from 'vue'
import { useChatStore } from '@/stores/chat' // Import store
import IconChat from '@/components/icons/IconChat.vue'
import IconProfile from '@/components/icons/IconProfile.vue'

const store = useChatStore()
const friend = computed(() => store.selectedFriend)
const isSelf = computed(() => friend.value?.id === store.currentUserId)

const emit = defineEmits(['chat', 'profile', 'delete', 'close'])

const isEditing = ref(false)
const editValue = ref('')
const statusInput = ref(null)

const startEdit = async () => {
  if (!isSelf.value) return // 非本人不可編輯
  editValue.value = friend.value?.statusMsg || ''
  isEditing.value = true
  await nextTick()
  statusInput.value?.focus()
}

const saveStatus = () => {
  if (isSelf.value) {
    store.updateMyProfile({ statusMsg: editValue.value })
  }
  isEditing.value = false
}
</script>

<template>
  <div class="bg-bg-brand-light relative flex h-full flex-col overflow-hidden">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[40%] overflow-hidden">
      <img
        src="@/assets/images/background-profile.webp"
        class="h-full w-full object-cover opacity-20"
        alt=""
      />
      <div
        class="via-bg-brand-light/10 to-bg-brand-light absolute inset-0 bg-linear-to-b from-transparent"
      ></div>
    </div>
    <div class="pointer-events-none absolute inset-0 bg-white/20"></div>

    <div class="relative z-20 flex justify-between p-4">
      <!-- 返回按鈕 -->
      <button
        type="button"
        class="text-fg-secondary flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md backdrop-blur-sm transition-all hover:bg-white"
        @click="emit('close')"
      >
        <i class="fa-solid fa-chevron-left text-lg"></i>
      </button>
      <div class="h-10 w-10"></div>
    </div>

    <div class="relative z-10 -mt-10 flex flex-1 flex-col items-center justify-center px-6">
      <div class="relative mb-6">
        <div
          class="h-36 w-36 rounded-full border-4 border-white bg-gray-200 bg-cover bg-center shadow-2xl"
          :style="{ backgroundImage: `url(${friend.avatar})` }"
        ></div>
      </div>

      <div class="relative mb-3 flex h-10 w-full items-center justify-center">
        <h2 class="text-fg-primary flex items-center justify-center px-3 py-1 text-2xl font-black">
          {{ friend.name }}
        </h2>

        <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-y-1/2">
          <span v-if="!isSelf" class="c-profile-tag c-profile-tag--friend">好友</span>
          <span v-else class="c-profile-tag c-profile-tag--me">我</span>
        </div>
      </div>

      <div class="mb-10 flex h-12 w-full max-w-xs items-center justify-center">
        <div
          v-if="!isEditing"
          class="group flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
          :class="{ 'cursor-pointer hover:bg-black/5': isSelf }"
          @click="startEdit"
        >
          <div v-if="isSelf" class="c-icon-edit ml-1 h-3 w-3 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </div>
        </div>

        <input
          v-else
          ref="statusInput"
          v-model="editValue"
          type="text"
          class="border-status-friend text-fg-primary w-full border-b-2 bg-white py-1 text-center text-sm outline-none"
          @blur="saveStatus"
          @keydown.enter="saveStatus"
        />
      </div>

      <div v-if="!isSelf" class="mt-[-30px] flex w-full max-w-sm flex-col items-center">
        <div v-if="friend.isBlocked" class="mb-8 flex flex-col items-center gap-4">
          <div class="text-sm font-bold text-red-500 opacity-80">此用戶已被封鎖</div>
          <button
            class="flex items-center gap-2 rounded-full bg-zinc-100 px-8 py-3 font-bold text-zinc-600 shadow-sm transition-all hover:bg-zinc-200"
            @click="store.unblockChat(friend.id)"
          >
            <i class="fa-solid fa-unlock"></i> 解除封鎖
          </button>
        </div>

        <div v-else class="flex w-full justify-center gap-20 px-4">
          <button
            class="group relative flex h-16 w-16 flex-col items-center justify-center transition-transform hover:scale-110 active:scale-90 md:h-20 md:w-20"
            @click="emit('chat', friend.id)"
          >
            <IconChat
              class="h-10 w-10 transition-all duration-300 md:h-14 md:w-14 md:group-hover:scale-50 md:group-hover:opacity-0"
            />

            <div
              class="mt-1 flex items-center justify-center transition-all duration-300 md:absolute md:inset-0 md:mt-0 md:scale-50 md:opacity-0 md:group-hover:scale-100 md:group-hover:opacity-100"
            >
              <span
                class="text-fg-terracotta text-xs font-black tracking-tighter whitespace-nowrap md:text-base"
                >聊天</span
              >
            </div>
          </button>

          <button
            class="group relative flex h-16 w-16 flex-col items-center justify-center transition-transform hover:scale-110 active:scale-90 md:h-20 md:w-20"
            @click="emit('profile', friend.targetUserIdInt || friend.id)"
          >
            <IconProfile
              class="h-10 w-10 transition-all duration-300 md:h-14 md:w-14 md:group-hover:scale-50 md:group-hover:opacity-0"
            />

            <div
              class="mt-1 flex items-center justify-center transition-all duration-300 md:absolute md:inset-0 md:mt-0 md:scale-50 md:opacity-0 md:group-hover:scale-100 md:group-hover:opacity-100"
            >
              <span
                class="text-fg-terracotta text-xs font-black tracking-tighter whitespace-nowrap md:text-base"
                >個人頁面</span
              >
            </div>
          </button>
        </div>

        <button
          class="text-fg-secondary/30 hover:text-func-danger mt-4 flex items-center gap-2 rounded-full bg-transparent px-6 py-2 text-sm font-bold transition-all hover:bg-red-50"
          @click="emit('delete', friend.id)"
        >
          <i class="fa-solid fa-heart-crack opacity-50"></i> 刪除好友
        </button>
      </div>
    </div>
  </div>
</template>
