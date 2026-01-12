<script setup>
import { computed } from 'vue'

const props = defineProps({
  chat: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  isMe: { type: Boolean, default: false }, 
  showStatus: { type: Boolean, default: true },
  showPin: { type: Boolean, default: true },
  isFriendListMode: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'contextmenu'])

const lastMsg = computed(() => {
  if (!props.chat.msgs || props.chat.msgs.length === 0) return null
  return props.chat.msgs[props.chat.msgs.length - 1]
})

const displayTime = computed(() => {
  return lastMsg.value ? lastMsg.value.time : ''
})

const displayText = computed(() => {
  if (props.chat.isBlocked) return '已封鎖此用戶'
  return lastMsg.value ? lastMsg.value.text : '點擊開始聊天'
})
</script>

<template>
  <div 
    class="c-chat-item group" 
    :class="{ 
      'bg-bg-base': isActive || chat.pinned,
      'bg-bg-base/50': !isActive && chat.pinned 
    }"
    @click="emit('click', chat)"
    @contextmenu="emit('contextmenu', $event, chat)"
  >
    <!-- Avatar Area -->
    <div class="relative shrink-0">
      <div 
        class="c-chat-avatar" 
        :style="{ backgroundImage: `url(${chat.avatar})`, filter: chat.isBlocked ? 'grayscale(100%)' : 'none' }"
      ></div>
      
      <!-- Status Dot -->
      <div 
        v-if="showStatus && chat.status === 'friend' && !chat.isBlocked" 
        class="c-badge c-badge--dot -right-0.5 -bottom-0.5 bg-green-500 shadow-sm"
      ></div>
    </div>

    <div class="c-chat-info">
      <div class="c-chat-title">
        <div class="c-chat-name">
          <i v-if="showPin && chat.pinned" class="fa-solid fa-thumbtack text-brand-primary rotate-45 text-xs"></i>
          <i v-if="chat.isBlocked" class="fa-solid fa-ban text-xs text-red-500"></i>
          
          <span class="truncate" :class="{ 'text-fg-muted': chat.isBlocked }">{{ chat.name }}</span>
          
          <!-- Badges -->
          <span v-if="chat.status === 'matching'" class="c-chat-label bg-status-match/10 text-status-match">配對</span>
          <span v-if="chat.type === 'knock' && chat.status !== 'friend'" class="c-chat-label bg-status-knock/10 text-status-knock">敲敲門</span>
          <span v-if="chat.status === 'friend'" class="c-chat-label bg-status-success/10 text-status-success">好友</span>
        </div>
        
        <span v-if="!isFriendListMode" class="text-fg-muted text-xs whitespace-nowrap">{{ displayTime }}</span>
      </div>

      <div class="c-chat-desc">
        <template v-if="isFriendListMode">
          <span>{{ chat.statusMsg || '' }}</span>
        </template>
        <template v-else>
          <span v-if="chat.isBlocked" class="text-status-error">{{ displayText }}</span>
          <span v-else>{{ chat.statusMsg || displayText }}</span>
        </template>
      </div>
    </div>

    <slot name="action"></slot>
  </div>
</template>
