<script setup>
import ShareBtn from './ShareBtn.vue'

const props = defineProps({
  postId: { type: [String, Number], required: true },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  isLiked: { type: Boolean, default: false },
  isBookmarked: { type: Boolean, default: false },
  shareUrl: { type: String, default: '' },
  shareTitle: { type: String, default: '' },
  shareText: { type: String, default: '' }
})

const emit = defineEmits(['like', 'open-comments', 'share', 'bookmark'])
const handleLike = () => emit('like', props.postId)
const handleOpenComments = () => emit('open-comments', props.postId)
const handleBookmark = () => emit('bookmark', props.postId)
const handleShare = (payload) => emit('share', payload)
</script>

<template>
  <div class="mt-4 flex items-center justify-between">
    <div class="flex items-center gap-6 text-gray-400">
      <button
        type="button"
        class="action-btn flex cursor-pointer items-center gap-2"
        aria-label="Like"
        @click="handleLike"
      >
        <span class="action-icon inline-flex items-center justify-center text-xl leading-none">
          <i :class="isLiked ? 'fa-solid fa-paw text-red-300' : 'fa-solid fa-paw'" />
        </span>
        <span class="text-sm">{{ likeCount }}</span>
      </button>

      <button
        type="button"
        class="action-btn flex cursor-pointer items-center gap-2"
        aria-label="Comment"
        @click="handleOpenComments"
      >
        <span class="action-icon inline-flex items-center justify-center text-xl leading-none"
          ><i class="fa-solid fa-comment"
        /></span>
        <span class="text-sm">{{ commentCount }}</span>
      </button>

      <ShareBtn
        :post-id="postId"
        :share-url="shareUrl"
        :share-title="shareTitle"
        :share-text="shareText"
        @share="handleShare"
      ></ShareBtn>
    </div>
    <button
      type="button"
      class="action-btn grid cursor-pointer place-items-center text-gray-400"
      aria-label="Bookmark"
      @click="handleBookmark"
    >
      <span class="action-icon text-xl"
        ><i
          :class="
            isBookmarked ? 'fa-solid fa-bookmark text-brand-accent' : 'fa-regular fa-bookmark'
          "
      /></span>
    </button>
  </div>
</template>
