<script setup>
import { computed } from 'vue'

const props = defineProps({
  msg: { type: Object, required: true },
  isMe: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  showAvatar: { type: Boolean, default: true },
  menuVisible: { type: Boolean, default: false },
  isFirst: { type: Boolean, default: false }
})

const emit = defineEmits(['menu-open', 'action'])

const bubbleClasses = computed(() => {
  return props.isMe ? 'c-chat-bubble--me' : 'c-chat-bubble--them'
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleAction = (action) => {
  emit('action', action, props.msg)
}
</script>

<template>
  <div class="flex" :class="isMe ? 'justify-end' : 'justify-start'">
    <!-- Avatar -->
    <div
      v-if="!isMe && showAvatar"
      class="mr-3 h-9 w-9 shrink-0 rounded-full bg-gray-300 bg-cover"
      :style="{ backgroundImage: `url(${avatar})` }"
    ></div>

    <div class="group max-w-[70%]">
      <div class="relative">
        <!-- Bubble -->
        <div
          class="c-chat-bubble"
          :class="bubbleClasses"
          @click.stop="emit('menu-open', msg.id)"
          @contextmenu.prevent="emit('menu-open', msg.id)"
        >
          <!-- Reply Reference -->
          <div
            v-if="msg.replyTo"
            class="mb-1 rounded px-2 py-1 text-xs opacity-80"
            :class="
              isMe ? 'border-l-2 border-white bg-white/20' : 'border-fg-muted border-l-2 bg-black/5'
            "
          >
            <div class="mb-0.5 font-bold">回覆：</div>
            <div class="truncate">{{ msg.replyTo.content }}</div>
          </div>

          <!-- Message Content -->
          <span>{{ msg.content }}</span>
        </div>

        <!-- Context Menu (Abstracted classes in components.css) -->
        <div
          v-if="menuVisible"
          class="c-chat-pop"
          :class="[isMe ? 'right-0' : 'left-0', isFirst ? 'top-full mt-1' : 'bottom-full mb-1']"
        >
          <!-- Arrow -->
          <div
            class="c-chat-arrow"
            :class="[
              isFirst
                ? 'bottom-full border-b-[6px] border-b-[#ecf0e5]'
                : 'top-full border-t-[6px] border-t-[#ecf0e5]',
              isMe ? 'right-4' : 'left-4'
            ]"
          ></div>

          <!-- Actions -->
          <div class="c-chat-opt" @click.stop="handleAction('reply')">
            <i class="fa-solid fa-reply"></i> 回覆
          </div>
          <div v-if="isMe" class="c-chat-opt" @click.stop="handleAction('delete')">
            <i class="fa-solid fa-trash-can"></i> 收回
          </div>
          <div v-if="!isMe" class="c-chat-opt" @click.stop="handleAction('report')">
            <i class="fa-solid fa-triangle-exclamation"></i> 檢舉
          </div>
        </div>
      </div>

      <!-- Time & Read Status -->
      <div class="text-fg-muted mt-1 text-xs" :class="isMe ? 'text-right' : ''">
        {{ formatTime(msg.timestamp) }}
        <span v-if="isMe && msg.read">已讀</span>
      </div>
    </div>
  </div>
</template>
