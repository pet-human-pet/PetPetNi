<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  friend: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['chat', 'profile', 'delete', 'close'])

// 狀態編輯
const isEditing = ref(false)
const editValue = ref('')
const statusInput = ref(null)

const startEdit = async () => {
  editValue.value = props.friend.statusMsg || ''
  isEditing.value = true
  await nextTick()
  statusInput.value?.focus()
}

const saveStatus = () => {
  props.friend.statusMsg = editValue.value
  isEditing.value = false
}
</script>

<template>
  <!-- 滿版背景圖容器 -->
  <div class="flex flex-col h-full relative overflow-hidden bg-[#f9fbf2]">
    <!-- 手繪風格平舖背景 -->
    <div class="absolute inset-0 opacity-[0.08]" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png');"></div>
    
    <!-- 輕微的漸層遮罩 -->
    <div class="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10"></div>

    <!-- Top Toolbar -->
    <div class="relative z-20 flex justify-between p-6">
      <!-- 左邊：返回按鈕 -->
      <button type="button" class="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-fg-secondary hover:bg-white transition-all shadow-sm" @click="emit('close')">
        <i class="fa-solid fa-chevron-left text-xl"></i>
      </button>
      
      <!-- 右邊：留空 -->
      <div class="w-10 h-10"></div>
    </div>
    
    <!-- Main Content -->
    <div class="relative z-10 flex flex-col items-center justify-center flex-1 px-6 -mt-10">
      <!-- Round Avatar -->
      <div class="relative mb-6">
        <div class="w-36 h-36 rounded-full border-4 border-white bg-cover bg-center shadow-2xl bg-gray-200" :style="{backgroundImage: `url(${friend.avatar})`}"></div>
        <div v-if="friend.status === 'friend'" class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
      </div>
      
      <!-- Name -->
      <h2 class="text-2xl font-black text-fg-primary mb-3 flex items-center gap-2">
        {{ friend.name }}
        <span class="text-[10px] bg-[#FF9A8B]/20 text-[#FF9A8B] px-2 py-0.5 rounded-md uppercase tracking-widest font-bold">好友</span>
      </h2>

      <!-- Status (Editable) -->
      <div class="h-12 flex items-center justify-center mb-10 w-full max-w-xs">
        <div v-if="!isEditing" class="group flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-black/5 transition-colors" @click="startEdit">
          <p class="text-sm text-fg-secondary text-center leading-relaxed italic opacity-80 line-clamp-2">
            "{{ friend.statusMsg || '這隻小夥伴還在發呆中...' }}"
          </p>
          <i class="fa-solid fa-pencil text-xs text-[#FF9A8B] opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </div>
        
        <input 
          v-else
          ref="statusInput"
          v-model="editValue"
          type="text"
          class="w-full text-center text-sm bg-white border-b-2 border-[#FF9A8B] outline-none py-1 text-fg-primary"
          @blur="saveStatus"
          @keydown.enter="saveStatus"
        />
      </div>

      <!-- Paw Buttons Group -->
      <div class="w-full max-w-sm flex flex-col items-center gap-8">
        
        <!-- Row 1: Chat & Profile (Large Paws) -->
        <div class="flex gap-8 w-full justify-center px-4">
          
          <!-- 傳送訊息 (實心粉橘肉球) -->
          <button 
            class="group relative w-32 h-32 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            @click="emit('chat', friend.id)"
          >
            <!-- 指頭 (3個圓潤橢圓) -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5 w-full justify-center">
              <div class="w-7 h-5 rounded-full bg-[#FF9A8B] -rotate-12 transform origin-bottom"></div>
              <div class="w-8 h-6 rounded-full bg-[#FF9A8B] -mt-2"></div>
              <div class="w-7 h-5 rounded-full bg-[#FF9A8B] rotate-12 transform origin-bottom"></div>
            </div>
            
            <!-- 掌心 (大且圓潤) -->
            <div class="w-32 h-24 rounded-[45%_45%_40%_40%/55%_55%_45%_45%] bg-[#FF9A8B] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1),0_8px_15px_rgba(255,154,139,0.3)] flex flex-col items-center justify-center relative z-10 text-white">
              <i class="fa-solid fa-comment-dots text-2xl mb-1 drop-shadow-sm"></i>
              <span class="text-xs font-black tracking-wide drop-shadow-sm">傳送訊息</span>
            </div>
          </button>

          <!-- 查看頁面 (白色描邊肉球) -->
          <button 
            class="group relative w-32 h-32 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            @click="emit('profile', friend.id)"
          >
            <!-- 指頭 -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5 w-full justify-center">
              <div class="w-7 h-5 rounded-full border-[3px] border-[#FF9A8B] bg-white -rotate-12 transform origin-bottom"></div>
              <div class="w-8 h-6 rounded-full border-[3px] border-[#FF9A8B] bg-white -mt-2"></div>
              <div class="w-7 h-5 rounded-full border-[3px] border-[#FF9A8B] bg-white rotate-12 transform origin-bottom"></div>
            </div>
            
            <!-- 掌心 -->
            <div class="w-32 h-24 rounded-[45%_45%_40%_40%/55%_55%_45%_45%] bg-white border-[3px] border-[#FF9A8B] shadow-sm flex flex-col items-center justify-center relative z-10 text-[#FF9A8B] hover:bg-[#fff5f2] transition-colors">
              <i class="fa-solid fa-user text-2xl mb-1"></i>
              <span class="text-xs font-black tracking-wide">查看頁面</span>
            </div>
          </button>
        </div>

        <!-- 刪除好友 -->
        <button 
          class="px-6 py-2 text-xs font-bold text-red-400 bg-red-50 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors flex items-center gap-2"
          @click="emit('delete', friend.id)"
        >
          <i class="fa-solid fa-heart-crack"></i> 刪除好友
        </button>
      </div>
    </div>

    <!-- Bottom Footer Text -->
    <div class="relative z-10 p-8 text-center">
      <div class="text-[9px] text-fg-muted/40 font-bold tracking-[0.3em] uppercase">PetPetNi Friend Card</div>
    </div>
  </div>
</template>