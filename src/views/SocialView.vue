<script setup>
import { ref, computed, onMounted } from 'vue'
import PostCard from '@/components/Social/PostCard.vue'
import PostComposer from '@/components/Social/PostComposer.vue'
import { useScreen } from '@/composables/useScreen'
import { useActiveItem } from '@/composables/useActiveItem'
import { usePostStore } from '@/stores/usePostStore'
import { useToast } from '@/composables/useToast'

const postStore = usePostStore()
const { success, error } = useToast()
import ImagePreviewModal from '@/components/Share/ImagePreviewModal.vue'
import { useImagePreview } from '@/composables/useImagePreview'

const rawPosts = ref([
  {
    id: 1,
    audience: 'friends',
    author: 'test',
    isMine: true,
    content:
      '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，請勿當作正式文案。',
    tags: ['#狗', '#柯基', '#日常生活'],
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSum7FwfWAYG3LAVpmMG9e_y3H_u57BstJ5Tg&s'
    ],
    isNew: false,
    likeCount: 120,
    isLiked: false,
    commentCount: 12,
    isBookmarked: false
  },
  {
    id: 2,
    author: 'test',
    audience: 'public',
    content:
      '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，請勿當作正式文案。',
    isMine: false,
    tags: ['#貓', '#奴才日常'],
    images: ['https://media.tenor.com/uKayqry3x90AAAAM/goofy-funny-cat.gif'],
    isNew: false,
    likeCount: 120,
    isLiked: true,
    commentCount: 12,
    isBookmarked: false
  },
  {
    id: 3,
    audience: 'public',
    author: 'test',
    content: '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果',
    tags: [],
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn4pPgkiCwbIXkTfSgfhp4BMEjVOJXJItR1FkRMuWplvtUZo4yzGtfKgC1Dqyi7R9lM3Y&usqp=CAU',
      'https://tiptopk9.com/nitropack_static/CQBMbUdUxEdJwDWnlMCaRSOixvBddFgB/assets/images/optimized/rev-dcdf01d/tiptopk9.com/wp-content/uploads/hilarious-chihuahua-dog-meme.jpeg'
    ],
    isNew: false,
    likeCount: 120,
    isLiked: false,
    commentCount: 12,
    isBookmarked: false
  }
])

onMounted(() => {
  postStore.fetchPosts()
})

// 桌機雙欄用
const leftPosts = computed(() => rawPosts.value.filter((_, i) => i % 2 === 0))
const rightPosts = computed(() => rawPosts.value.filter((_, i) => i % 2 !== 0))

/** 按讚 */
const toggleLike = (postId) => {
  // TODO: 資料源不一 (顯示用 rawPosts，但這裡找 postStore)。未來需統一資料源。目前僅做樂觀更新，未來可串接 API
  const post = postStore.posts.find((p) => p.id === postId)
  if (!post) return

  post.isLiked = !post.isLiked
  post.likeCount += post.isLiked ? 1 : -1
}

// 留言管理
const { isDesktop } = useScreen()

const commentManager = useActiveItem({
  enableClickOutside: isDesktop
})

const openComments = (postId) => {
  if (commentManager.activeId.value === postId) {
    commentManager.deactivate()
  } else {
    commentManager.activate(postId)
  }
}

// 收藏
const toggleBookmark = (postId) => {
  // TODO: 資料源不一致，未來需統一
  const post = postStore.posts.find((p) => p.id === postId)
  if (!post) return

  post.isBookmarked = !post.isBookmarked
}

// 編輯：PostCard emit update 後，這裡更新內容
const handleUpdate = (payload) => {
  // TODO: 資料源不一致，未來需統一
  const post = postStore.posts.find((p) => p.id === payload.id)
  if (!post) return

  if (payload.content !== undefined) post.content = payload.content
  if (payload.audience !== undefined) post.audience = payload.audience
  if (payload.commentCount !== undefined) post.commentCount = payload.commentCount

  success('貼文已更新')
}

// 發文
const handleSubmit = async (payload) => {
  try {
    // 嘗試呼叫 API (即使失敗也繼續更新本地假資料以便測試)
    await postStore.createPost(payload.content, payload.images)
  } catch {
    error('發布伺服器失敗，貼文僅暫存於本地')
  }

  // 無論 API 成功與否，都同步更新本地假資料
  rawPosts.value.unshift({
    id: Date.now(),
    audience: payload.audience || 'public',
    author: 'test',
    isMine: true,
    content: payload.content,
    tags: [],
    images: payload.images,
    isNew: true,
    likeCount: 0,
    isLiked: false,
    commentCount: 0,
    isBookmarked: false
  })

  success('貼文已發布')
}

// 圖片預覽
const { previewOpen, previewImages, previewIndex, openPreview, closePreview } = useImagePreview()

/** 其他功能：先留接口 */
// const openEdit = (postId) => console.log('edit', postId)
const sharePost = async (payload) => {
  if (payload?.url) {
    try {
      await navigator.clipboard.writeText(payload.url)
      showToast('連結已複製')
    } catch {
      showToast('複製失敗')
    }
  }
}
</script>

<template>
  <div class="bg-bg-base">
    <div class="mx-10 min-h-screen">
      <main class="mx-auto w-full max-w-260 px-4 pb-16">
        <div class="pt-5 md:pt-8">
          <PostComposer username="" @submit="handleSubmit" />
        </div>
        <!-- 手機/平板：單欄 -->
        <section v-if="!isDesktop" class="mt-4 flex flex-col gap-4">
          <PostCard
            v-for="p in rawPosts"
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
            />
          </div>
        </section>

        <!-- loading (純視覺) -->
        <div class="grid place-items-center py-10 text-zinc-500">
          <div
            class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent"
          ></div>
        </div>
      </main>

      <ImagePreviewModal
        v-model:index="previewIndex"
        :open="previewOpen"
        :images="previewImages"
        @close="closePreview"
      />

    </div>
  </div>
</template>
