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
  <div class="flex flex-col h-full relative overflow-hidden bg-bg-brand-light">
    <div class="absolute inset-x-0 top-0 h-[40%] overflow-hidden pointer-events-none">
      <img 
        src="@/assets/images/background-Photoroom.png" 
        class="w-full h-full object-cover opacity-20"
        alt=""
      />
      <div class="absolute inset-0 bg-linear-to-b from-transparent via-bg-brand-light/10 to-bg-brand-light"></div>
    </div>
    <div class="absolute inset-0 bg-white/20 pointer-events-none"></div>

    <div class="relative z-20 flex justify-between p-4">
      <!-- 返回按鈕 -->
      <button type="button" class="w-9 h-9 flex items-center justify-center rounded-full bg-white text-fg-secondary hover:bg-white transition-all shadow-md backdrop-blur-sm" @click="emit('close')">
        <i class="fa-solid fa-chevron-left text-lg"></i>
      </button>
      <div class="w-10 h-10"></div>
    </div>
    
    <div class="relative z-10 flex flex-col items-center justify-center flex-1 px-6 -mt-10">
      <div class="relative mb-6">
        <div class="w-36 h-36 rounded-full border-4 border-white bg-cover bg-center shadow-2xl bg-gray-200" :style="{backgroundImage: `url(${friend.avatar})`}"></div>
        <div v-if="friend.status === 'friend' && !isSelf" class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
      </div>
      
      <div class="flex items-center justify-center mb-3 h-10 w-full relative">
        <h2 class="flex items-center justify-center text-2xl font-black text-fg-primary px-3 py-1">
          {{ friend.name }}
        </h2>

        <div class="absolute left-1/2 -translate-y-1/2 top-1/2 pointer-events-none">
           <span v-if="!isSelf" class="c-profile-tag c-profile-tag--friend">好友</span>
           <span v-else class="c-profile-tag c-profile-tag--me">我</span>
        </div>
      </div>

      <div class="h-12 flex items-center justify-center mb-10 w-full max-w-xs">
        <div v-if="!isEditing" class="group flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" :class="{ 'cursor-pointer hover:bg-black/5': isSelf }" @click="startEdit">
          <p class="text-sm text-fg-secondary text-center leading-relaxed italic opacity-80 line-clamp-2">
            "{{ friend.statusMsg || '這隻小夥伴還在發呆中...' }}"
          </p>
          <div v-if="isSelf" class="w-3 h-3 ml-1 shrink-0 c-icon-edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </div>
        </div>
        
        <input 
          v-else
          ref="statusInput"
          v-model="editValue"
          type="text"
          class="w-full text-center text-sm bg-white border-b-2 border-status-friend outline-none py-1 text-fg-primary"
          @blur="saveStatus"
          @keydown.enter="saveStatus"
        />
      </div>

      <div v-if="!isSelf" class="w-full max-w-sm flex flex-col items-center mt-8">

        <div v-if="friend.isBlocked" class="flex flex-col items-center gap-4 mb-8">
          <div class="text-red-500 text-sm font-bold opacity-80">此用戶已被封鎖</div>
          <button 
            class="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 px-8 py-3 rounded-full font-bold shadow-sm transition-all flex items-center gap-2"
            @click="store.unblockChat(friend.id)"
          >
            <i class="fa-solid fa-unlock"></i> 解除封鎖
          </button>
        </div>

        <div v-else class="flex gap-20 w-full justify-center px-4">

          <button 
            class="group relative flex h-16 w-16 md:h-20 md:w-20 flex-col items-center justify-center transition-transform hover:scale-110 active:scale-90"
            @click="emit('chat', friend.id)"
          >
            <IconChat 
              class="h-10 w-10 md:h-14 md:w-14 transition-all duration-300 md:group-hover:scale-50 md:group-hover:opacity-0" 
            />

            <div 
              class="mt-1 md:absolute md:inset-0 md:mt-0 flex items-center justify-center transition-all duration-300 md:opacity-0 md:scale-50 md:group-hover:scale-100 md:group-hover:opacity-100"
            >
              <span class="text-xs md:text-base font-black tracking-tighter text-fg-terracotta whitespace-nowrap">聊天</span>
            </div>
          </button>

          <button 
            class="group relative flex h-16 w-16 md:h-20 md:w-20 flex-col items-center justify-center transition-transform hover:scale-110 active:scale-90"
            @click="emit('profile', friend.id)"
          >
            <IconProfile 
              class="h-10 w-10 md:h-14 md:w-14 transition-all duration-300 md:group-hover:scale-50 md:group-hover:opacity-0" 
            />

            <div 
              class="mt-1 md:absolute md:inset-0 md:mt-0 flex items-center justify-center transition-all duration-300 md:opacity-0 md:scale-50 md:group-hover:scale-100 md:group-hover:opacity-100"
            >
              <span class="text-xs md:text-base font-black tracking-tighter text-fg-terracotta whitespace-nowrap">個人頁面</span>
            </div>
          </button>
        </div>

        <button 
          class="mt-16 px-6 py-2 text-sm font-bold text-fg-secondary/30 hover:text-func-danger bg-transparent hover:bg-red-50 rounded-full transition-all flex items-center gap-2"
          @click="emit('delete', friend.id)"
        >
          <i class="fa-solid fa-heart-crack opacity-50"></i> 刪除好友
        </button>
      </div>
    </div>
  </div>
</template>