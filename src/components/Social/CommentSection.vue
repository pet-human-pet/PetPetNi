<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useSwipe, useScrollLock } from '@vueuse/core'
import { useScreen } from '@/composables/useScreen'
import { useToast } from '@/composables/useToast'
import { formatCommentTime } from '@/utils/formatTime'
import { useCommentStore } from '@/stores/comment'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const toProfile = () => {
  const rawId = props.post.authorIdInt ?? props.post.userIdInt ?? props.post.user_id_int
  const userIdInt = Number(rawId)
  const hasUserIdInt = Number.isFinite(userIdInt) && userIdInt > 0

  // 如果有可用的 userIdInt，導向該用戶的個人頁面
  if (hasUserIdInt) {
    router.push({ name: 'Profile', params: { userIdInt } })
    return
  }

  // 備用：導向自己的個人頁面
  router.push({ name: 'Profile' })
}

const commentStore = useCommentStore()
const authStore = useAuthStore()

// 載入留言
const isLoading = ref(true)

onMounted(async () => {
  if (props.post.id) {
    try {
      await commentStore.fetchComments(props.post.id)
    } finally {
      isLoading.value = false
    }
  } else {
    isLoading.value = false
  }
})

const comments = computed(() => commentStore.getComments(props.post.id))

const emit = defineEmits(['close', 'add-comment', 'delete-comment'])

const { isMobile } = useScreen()
const { success, error } = useToast()

// Mobile 滾動鎖定
const isLocked = useScrollLock(document.body)

watch(
  isMobile,
  (val) => {
    isLocked.value = val
  },
  { immediate: true }
)

onUnmounted(() => {
  isLocked.value = false
})

const MAX_COMMENT_LENGTH = 50

// 新增留言
const newComment = ref('')

const submitComment = async () => {
  if (!newComment.value.trim() || newComment.value.length > MAX_COMMENT_LENGTH) return
  try {
    await commentStore.addComment(props.post.id, newComment.value)
    emit('add-comment')
    newComment.value = ''
    success('留言已發佈')
  } catch (err) {
    console.error(err)
    error('留言失敗')
  }
}

const handleDelete = async (id) => {
  try {
    await commentStore.deleteComment(props.post.id, id)
    emit('delete-comment')
    success('留言已刪除')
  } catch (err) {
    console.error(err)
    error('刪除失敗')
  }
}

const mobileSheetRef = ref(null)
const { lengthY, isSwiping } = useSwipe(mobileSheetRef)

// 下滑超過一定距離則關閉
const swipeOffset = computed(() => {
  if (!isMobile.value || !isSwiping.value) return 0
  return lengthY.value < 0 ? -lengthY.value : 0 // 只允許下滑 (lengthY < 0 為下滑)
})

const onSwipeEnd = () => {
  if (lengthY.value < -100) {
    emit('close')
  }
}
</script>

<template>
  <!-- Mobile -->
  <Teleport to="body" :disabled="!isMobile">
    <div v-if="isMobile" class="fixed inset-0 z-1000 flex items-end justify-center md:hidden">
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
        <div class="flex items-center justify-between border-b border-zinc-200 px-4 pb-4">
          <h3 class="text-sm text-zinc-400">留言 ({{ comments.length }})</h3>
          <button class="cursor-pointer text-zinc-400" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Comment -->
        <div class="max-h-[60vh] min-h-[16vh] overflow-y-auto px-4 pt-2">
          <div v-if="isLoading" class="space-y-4 px-1 py-2">
            <div v-for="i in 3" :key="i" class="flex gap-3">
              <div class="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200"></div>
              <div class="flex-1 space-y-2 py-1">
                <div class="h-3 w-24 animate-pulse rounded bg-zinc-200"></div>
                <div class="h-3 w-3/4 animate-pulse rounded bg-zinc-200"></div>
              </div>
            </div>
          </div>
          <div
            v-else-if="comments.length === 0"
            class="flex flex-col items-center justify-center py-10 text-zinc-400"
          >
            <i class="fa-regular fa-comment-dots mb-2 text-2xl"></i>
            <span class="text-sm">目前沒有留言</span>
          </div>
          <div
            v-for="c in comments"
            :key="c.id"
            class="mb-4 flex gap-2 rounded-lg p-1 transition-colors duration-300"
            :class="c.isHighlight ? 'bg-yellow-50/40 ring-1 ring-yellow-200' : 'bg-white ring-0'"
          >
            <div class="h-8 w-8 shrink-0 rounded-full bg-zinc-200"></div>
            <div class="min-w-0 flex-1">
              <div>
                <div class="flex items-baseline justify-between pb-1">
                  <div class="flex items-center justify-center">
                    <button class="pr-2 text-sm font-bold text-blue-800" @click="toProfile">
                      {{ c.author }}
                    </button>
                    <span class="text-xs text-zinc-300">
                      {{ formatCommentTime(c.createdAt) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <!-- 判斷是否為當前用戶的留言 -->
                    <div v-if="c.authorId === authStore.user?.id" class="flex gap-6 pr-2">
                      <button
                        class="text-zinc-400 hover:text-zinc-500"
                        @click.stop="handleDelete(c.id)"
                      >
                        <i class="fa-solid fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="text-sm break-all whitespace-pre-wrap text-zinc-600">
                  {{ c.content }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="border-t border-zinc-100 px-4 pt-4">
          <div class="flex flex-col gap-1">
            <div class="flex gap-2 rounded-full bg-zinc-100 px-4 py-2">
              <input
                v-model="newComment"
                type="text"
                placeholder="新增留言..."
                class="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
                @keyup.enter="submitComment"
              />
              <button
                class="text-brand-primary disabled:text-zinc-400"
                :disabled="!newComment.trim() || newComment.length > MAX_COMMENT_LENGTH"
                @click="submitComment"
              >
                <i class="fa-solid fa-arrow-up"></i>
              </button>
            </div>
            <div class="flex justify-end px-2">
              <span
                class="text-xs"
                :class="newComment.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-zinc-400'"
              >
                {{ newComment.length }}/{{ MAX_COMMENT_LENGTH }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Desktop -->
  <div
    v-if="!isMobile"
    class="animate-pop-in absolute right-12 bottom-16 z-40 w-[70%] origin-bottom-left rounded-2xl border border-zinc-100 bg-white p-3 shadow-xl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-zinc-100 pb-2 pl-3">
      <span class="text-sm text-zinc-500">留言 ({{ comments.length }})</span>
      <button
        class="cursor-pointer text-xl text-zinc-400 hover:text-zinc-500"
        @click="$emit('close')"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- List -->
    <div class="no-scrollbar max-h-40 min-h-14 space-y-1 overflow-y-auto p-1">
      <div v-if="isLoading" class="space-y-3 py-2">
        <div v-for="i in 3" :key="i" class="flex gap-3 px-1">
          <div class="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-3 w-24 animate-pulse rounded bg-zinc-200"></div>
            <div class="h-3 w-3/4 animate-pulse rounded bg-zinc-200"></div>
          </div>
        </div>
      </div>
      <div
        v-else-if="comments.length === 0"
        class="flex flex-col items-center justify-center py-8 text-zinc-400"
      >
        <span class="text-sm">目前沒有留言</span>
      </div>
      <div
        v-for="c in comments"
        :key="c.id"
        class="flex gap-3 rounded-lg px-3 py-3 pr-4 transition-colors duration-300"
        :class="c.isHighlight ? 'bg-yellow-50/40 ring-1 ring-yellow-200' : 'bg-white ring-0'"
      >
        <div class="h-8 w-8 shrink-0 rounded-full bg-zinc-200"></div>
        <div class="min-w-0 flex-1">
          <div>
            <div class="flex items-baseline justify-between pb-1">
              <div class="flex items-center justify-center gap-5 md:gap-2">
                <span class="text-sm font-bold text-blue-800" @click="toProfile">{{
                  c.author
                }}</span>
                <span class="text-xs text-gray-400">
                  {{ formatCommentTime(c.createdAt) }}
                  <span v-if="c.isEdited" class="ml-1 text-gray-500">(已編輯)</span>
                </span>
              </div>
              <div class="flex items-center gap-4">
                <div v-if="c.authorId === authStore.user?.id" class="flex gap-2">
                  <button
                    class="cursor-pointer text-zinc-300 transition-colors hover:text-red-500"
                    @click.stop="handleDelete(c.id)"
                  >
                    <i class="fa-solid fa-trash text-md"></i>
                  </button>
                </div>
              </div>
            </div>
            <p class="text-fg-primary text-sm break-all whitespace-pre-wrap">
              {{ c.content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-zinc-100 pt-1">
      <div class="mt-2 flex flex-col gap-1">
        <div class="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
          <input
            v-model="newComment"
            type="text"
            placeholder="寫下你的留言..."
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            @keyup.enter="submitComment"
          />
          <button
            class="grid h-7 w-7 place-items-center rounded-full text-white transition-colors disabled:cursor-not-allowed disabled:bg-zinc-200"
            :disabled="!newComment.trim() || newComment.length > MAX_COMMENT_LENGTH"
            :class="{
              'bg-brand-primary cursor-pointer':
                newComment.trim() && newComment.length <= MAX_COMMENT_LENGTH
            }"
            @click="submitComment"
          >
            <i class="fa-solid fa-arrow-up text-xs"></i>
          </button>
        </div>
        <div class="flex justify-end px-2">
          <span
            class="text-xs"
            :class="newComment.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-zinc-400'"
          >
            {{ newComment.length }}/{{ MAX_COMMENT_LENGTH }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
