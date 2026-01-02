<script setup>
import { ref, computed } from 'vue'
import { useSwipe } from '@vueuse/core'
import { useScreen } from '@/composables/useScreen'

defineProps({
  postId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close'])

const { isMobile } = useScreen()

const comments = ref([
  { id: 1, user: 'user123', content: '真可愛！', time: '2025/12/30' },
  { id: 2, user: 'dog_lover', content: '這是在哪裡拍的呀？', time: '2025/12/30' },
  { id: 3, user: 'cat_king', content: '雖然我是貓派，但這隻可以。', time: '2025/12/31' }
])

const newComment = ref('')

const submitComment = () => {
  if (!newComment.value.trim()) return
  comments.value.push({
    id: Date.now(),
    user: 'me',
    content: newComment.value,
    time: new Date().toLocaleDateString()
  })
  newComment.value = ''
}

const mobileSheetRef = ref(null)
const { lengthY, isSwiping } = useSwipe(mobileSheetRef)

// 下滑超過一定距離則關閉
const swipeOffset = computed(() => {
  if (!isMobile.value || !isSwiping.value) return 0
  return lengthY.value > 0 ? lengthY.value : 0 // 只允許下滑
})

const onSwipeEnd = () => {
  if (lengthY.value > 100) {
    emit('close')
  }
}
</script>

<template>
  <!-- Mobile -->
  <Teleport to="body" :disabled="!isMobile">
    <div v-if="isMobile" class="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      <!-- Overlay (點擊關閉) -->
      <div class="absolute inset-0 bg-black/60 transition-opacity" @click="$emit('close')"></div>

      <div
        ref="mobileSheetRef"
        class="relative w-full rounded-t-2xl bg-white pt-3 pb-6 shadow-xl transition-transform duration-200 ease-out"
        :style="{ transform: `translateY(${swipeOffset}px)` }"
        @touchend="onSwipeEnd"
      >
        <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-300"></div>

        <!-- Header -->
        <div class="mb-4 flex items-center justify-between px-4">
          <h3 class="font-bold text-zinc-800">留言 ({{ comments.length }})</h3>
          <button class="text-zinc-400" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Comment -->
        <div class="max-h-[60vh] overflow-y-auto px-4">
          <div v-for="c in comments" :key="c.id" class="mb-4 flex gap-3">
            <div class="h-8 w-8 shrink-0 rounded-full bg-zinc-200"></div>
            <div class="flex-1">
              <div class="flex items-baseline justify-between">
                <span class="text-sm font-bold text-zinc-800">{{ c.user }}</span>
                <span class="text-xs text-zinc-400">{{ c.time }}</span>
              </div>
              <p class="text-sm text-zinc-600">{{ c.content }}</p>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="mt-2 border-t border-zinc-100 px-4 pt-4">
          <div class="flex gap-2 rounded-full bg-zinc-100 px-4 py-2">
            <input
              v-model="newComment"
              type="text"
              placeholder="新增留言..."
              class="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              @keyup.enter="submitComment"
            />
            <button
              class="text-blue-600 disabled:text-zinc-400"
              :disabled="!newComment.trim()"
              @click="submitComment"
            >
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Desktop -->
  <div
    v-if="!isMobile"
    class="animate-pop-in absolute right-5 bottom-16 z-30 w-[80%] origin-bottom-right rounded-2xl border border-zinc-100 bg-white p-4 shadow-xl"
  >
    <!-- Header -->
    <div class="mb-3 flex items-center justify-between border-b border-zinc-100 pb-2">
      <span class="text-xs font-bold text-zinc-500">留言 ({{ comments.length }})</span>
    </div>

    <!-- List -->
    <div class="scrollbar max-h-60 space-y-4 overflow-y-auto pr-1">
      <div v-for="c in comments" :key="c.id" class="flex gap-3">
        <div class="h-8 w-8 shrink-0 rounded-full bg-zinc-200"></div>
        <div class="flex-1">
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-bold text-zinc-800">{{ c.user }}</span>
            <span class="text-xs text-zinc-400">{{ c.time }}</span>
          </div>
          <p class="text-sm text-zinc-600">{{ c.content }}</p>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="mt-3 flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
      <input
        v-model="newComment"
        type="text"
        placeholder="寫下你的留言..."
        class="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        @keyup.enter="submitComment"
      />
      <button
        class="hover:bg-brand-primary grid h-7 w-7 place-items-center rounded-full bg-zinc-300 text-white transition-colors disabled:cursor-not-allowed disabled:bg-zinc-200"
        :disabled="!newComment.trim()"
        :class="{ 'bg-brand-primary': newComment.trim() }"
        @click="submitComment"
      >
        <i class="fa-solid fa-arrow-up text-xs"></i>
      </button>
    </div>
  </div>
</template>
