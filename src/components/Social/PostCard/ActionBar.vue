<script setup>
import { computed } from 'vue'
import { useCommentStore } from '@/stores/comment'

// 使用 Pinia Store 取得即時留言數量
const commentStore = useCommentStore()

const props = defineProps({
  postId: { type: [String, Number], required: true },
  likeCount: { type: Number, default: 0 },
  isLiked: { type: Boolean, default: false },
  isBookmarked: { type: Boolean, default: false }
})

const comments = computed(() => commentStore.getComments(props.postId))

const emit = defineEmits(['like', 'open-comments', 'share', 'bookmark'])

const onLike = () => emit('like', props.postId)
const onOpenComments = () => emit('open-comments', props.postId)
const onShare = () => emit('share', props.postId)
const onBookmark = () => emit('bookmark', props.postId)
</script>

<template>
  <div class="mt-4 flex items-center justify-between">
    <div class="flex items-center gap-6 text-gray-400">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2"
        aria-label="Like"
        @click="onLike"
      >
        <span class="text-xl">
          <i :class="isLiked ? 'fa-solid fa-paw text-red-300' : 'fa-solid fa-paw'" />
        </span>
        <span class="text-sm">{{ likeCount }}</span>
      </button>

      <button
        type="button"
        class="flex cursor-pointer items-center gap-2"
        aria-label="Comment"
        @click="onOpenComments"
      >
        <span class="text-xl"><i class="fa-solid fa-comment" /></span>
        <span class="text-sm">{{ comments.length }}</span>
      </button>

      <button type="button" class="flex items-center gap-2" aria-label="Share" @click="onShare">
        <span class="text-xl"><i class="fa-solid fa-share" /></span>
      </button>
    </div>
    <button
      type="button"
      class="grid cursor-pointer place-items-center text-gray-400"
      aria-label="Bookmark"
      @click="onBookmark"
    >
      <span class="text-xl"
        ><i
          :class="
            isBookmarked ? 'fa-solid fa-bookmark text-brand-accent' : 'fa-regular fa-bookmark'
          "
      /></span>
    </button>
  </div>
</template>
