<script setup>
import { ref, computed, onMounted } from 'vue'
import PostCard from '@/components/Social/PostCard.vue'
import ImagePreviewModal from '@/components/Share/ImagePreviewModal.vue'
import { useScreen } from '@/composables/useScreen'
import { useActiveItem } from '@/composables/useActiveItem'
import { useToast } from '@/composables/useToast'
import { useImagePreview } from '@/composables/useImagePreview'
import { usePostStore } from '@/stores/usePostStore'

const postStore = usePostStore()
const { success, error } = useToast()
const { isDesktop } = useScreen()
const { previewOpen, previewImages, previewIndex, openPreview, closePreview } = useImagePreview()

const commentManager = useActiveItem({
  enableClickOutside: isDesktop
})

const loadMoreTrigger = ref(null)

const leftPosts = computed(() => postStore.postsWithAuth.filter((_, i) => i % 2 === 0))
const rightPosts = computed(() => postStore.postsWithAuth.filter((_, i) => i % 2 !== 0))

const openComments = (postId) => {
  if (commentManager.activeId.value === postId) {
    commentManager.deactivate()
  } else {
    commentManager.activate(postId)
  }
}

const toggleLike = async (postId) => {
  await postStore.likePost(postId)
}

const toggleBookmark = async (postId) => {
  await postStore.bookmarkPost(postId)
}

const handleUpdate = async (payload) => {
  await postStore.updatePost(payload.id, {
    content: payload.content,
    audience: payload.audience
  })
  success('貼文已更新')
}
const sharePost = async (payload) => {
  if (payload?.url) {
    try {
      await navigator.clipboard.writeText(payload.url)
      success('連結已複製')
    } catch {
      error('複製失敗')
    }
  }
}

const handleDelete = async (postId) => {
  try {
    await postStore.deletePost(postId)
    success('貼文已刪除')
  } catch (error) {
    console.error(error)
    error('刪除失敗')
  }
}

onMounted(() => {
  postStore.fetchPosts()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && postStore.pagination.hasMore && !postStore.isLoading) {
        postStore.fetchPosts({
          page: postStore.pagination.page + 1,
          loadMore: true
        })
      }
    },
    { threshold: 0.5 }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})
</script>

<template>
  <div>
    <!-- 手機/平板：單欄 -->
    <section v-if="!isDesktop" class="mt-4 flex flex-col gap-4">
      <PostCard
        v-for="p in postStore.postsWithAuth"
        :key="p.id"
        :ref="(el) => commentManager.registerRef(p.id, el)"
        :post="p"
        :show-comments="commentManager.activeId.value === p.id"
        @update="handleUpdate"
        @preview-image="openPreview"
        @like="toggleLike"
        @open-comments="openComments"
        @close-comments="commentManager.deactivate()"
        @share="sharePost"
        @bookmark="toggleBookmark"
      />
    </section>

    <!-- 桌機：雙欄 -->
    <section class="mt-6 hidden w-full grid-cols-2 gap-6 md:grid">
      <!-- 左欄 -->
      <div class="flex flex-col gap-6">
        <PostCard
          v-for="p in leftPosts"
          :key="p.id"
          :ref="(el) => commentManager.registerRef(p.id, el)"
          :post="p"
          :show-comments="commentManager.activeId.value === p.id"
          @update="handleUpdate"
          @preview-image="openPreview"
          @like="toggleLike"
          @open-comments="openComments"
          @close-comments="commentManager.deactivate()"
          @share="sharePost"
          @bookmark="toggleBookmark"
        />
      </div>
      <!-- 右欄 -->
      <div class="flex flex-1 flex-col gap-6">
        <PostCard
          v-for="p in rightPosts"
          :key="p.id"
          :ref="(el) => commentManager.registerRef(p.id, el)"
          :post="p"
          :show-comments="commentManager.activeId.value === p.id"
          @update="handleUpdate"
          @preview-image="openPreview"
          @like="toggleLike"
          @open-comments="openComments"
          @close-comments="commentManager.deactivate()"
          @share="sharePost"
          @bookmark="toggleBookmark"
          @delete="handleDelete"
        />
      </div>
    </section>

    <!-- loading (純視覺) -->
    <div ref="loadMoreTrigger" class="grid place-items-center py-10 text-zinc-500">
      <div
        v-if="postStore.isLoading"
        class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent"
      ></div>
      <span v-else-if="!postStore.pagination.hasMore">沒有更多貼文了🐾</span>
    </div>

    <!-- 圖片預覽 Modal -->
    <ImagePreviewModal
      v-model:index="previewIndex"
      :open="previewOpen"
      :images="previewImages"
      @close="closePreview"
    />
  </div>
</template>
