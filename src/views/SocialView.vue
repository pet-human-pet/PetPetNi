<script setup>
import { ref, computed } from 'vue'
import PostCard from '@/components/Social/PostCard.vue'
import PostComposer from '@/components/Social/PostComposer.vue'
import { useScreen } from '@/composables/useScreen'
import { useActiveItem } from '@/composables/useActiveItem'

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

/** 桌機雙欄用 */
const leftPosts = computed(() => rawPosts.value.filter((_, i) => i % 2 === 0))
const rightPosts = computed(() => rawPosts.value.filter((_, i) => i % 2 !== 0))

/** 圖片預覽彈窗 */
const previewOpen = ref(false)
const previewSrc = ref('')

const onPreviewImage = (src) => {
  previewSrc.value = src
  previewOpen.value = true
}

const onClosePreview = () => {
  previewOpen.value = false
  previewSrc.value = ''
}

/** 按讚 */
const toggleLike = (postId) => {
  const post = rawPosts.value.find((p) => p.id === postId)
  if (!post) return

  post.isLiked = !post.isLiked
  post.likeCount += post.isLiked ? 1 : -1

  showToast(post.isLiked ? '已按讚' : '已取消按讚')
}

/** 留言管理 (State) */
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

/** 收藏 */
const toggleBookmark = (postId) => {
  const post = rawPosts.value.find((p) => p.id === postId)
  if (!post) return

  post.isBookmarked = !post.isBookmarked
  showToast(post.isBookmarked ? '已收藏' : '已取消收藏')
}

/** 編輯：PostCard emit update 後，這裡更新內容 */
const handleUpdate = (payload) => {
  const post = rawPosts.value.find((p) => p.id === payload.id)
  if (!post) return

  if (payload.content !== undefined) post.content = payload.content
  if (payload.audience !== undefined) post.audience = payload.audience
  if (payload.commentCount !== undefined) post.commentCount = payload.commentCount

  // 只有真的有更新內容或權限時才顯示提示，單純更新留言數不用提示
  if (payload.content !== undefined || payload.audience !== undefined) {
    showToast('貼文已更新')
  }
}

/** 發文：把新貼文塞到最前面 */
const handleSubmit = (payload) => {
  const text = (payload.content ?? '').trim()
  const images = payload.images ?? []
  const newPostId = Date.now()

  rawPosts.value.unshift({
    id: newPostId,
    audience: payload.audience ?? 'public',
    author: 'test',
    content: text,
    isMine: true,
    tags: payload.tags ?? [],
    images,
    isNew: true,
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    isBookmarked: false
  })

  setTimeout(() => {
    const post = rawPosts.value.find((p) => p.id === newPostId)
    if (post) post.isNew = false
  }, 2000)

  showToast('貼文已發布')
  return true
}

// Toast 提示
const toast = ref({ open: false, message: '' })
let toastTimer = null
const showToast = (message) => {
  toast.value.open = true
  toast.value.message = message

  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.open = false
    toast.value.message = ''
  }, 1600)
}
/** 其他功能：先留接口 */
// const openEdit = (postId) => console.log('edit', postId)
const sharePost = () => {
  /* share */
}
</script>

<template>
  <div class="bg-bg-base">
    <div class="mx-10 min-h-screen">
      <main class="mx-auto w-full max-w-260 px-4 pb-16">
        <div class="pt-5 md:pt-8">
          <PostComposer username="" @submit="handleSubmit" @toast="showToast" />
        </div>
        <!-- 手機/平板：單欄 -->
        <section class="mt-4 flex flex-col gap-4 md:hidden">
          <PostCard
            v-for="p in rawPosts"
            :key="p.id"
            :ref="(el) => commentManager.registerRef(p.id, el)"
            :post="p"
            :show-comments="commentManager.activeId.value === p.id"
            @update="handleUpdate"
            @preview-image="onPreviewImage"
            @like="toggleLike"
            @open-comments="openComments"
            @close-comments="commentManager.deactivate()"
            @share="sharePost"
            @bookmark="toggleBookmark"
          />
        </section>

        <!-- 桌機：雙欄 -->
        <section class="mt-6 hidden items-start gap-6 md:flex">
          <!-- 左欄 -->
          <div class="flex flex-1 flex-col gap-6">
            <PostCard
              v-for="p in leftPosts"
              :key="p.id"
              :ref="(el) => commentManager.registerRef(p.id, el)"
              :post="p"
              :show-comments="commentManager.activeId.value === p.id"
              @update="handleUpdate"
              @preview-image="onPreviewImage"
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
              @preview-image="onPreviewImage"
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

      <!-- 圖片預覽遮罩 -->
      <div v-if="previewOpen" class="fixed inset-0 z-90">
        <!--遮罩-->
        <div class="absolute inset-0 bg-black/70" @click="onClosePreview"></div>

        <div class="relative grid h-full w-full place-items-center p-6">
          <div class="relative h-[80vh] w-[80vw] max-w-225 rounded-2xl bg-transparent">
            <img :src="previewSrc" alt="" class="h-full w-full object-contain" />

            <button
              type="button"
              class="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow"
              @click="onClosePreview"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- toast -->
      <div
        v-if="toast.open"
        class="fixed bottom-20 left-1/2 z-100 -translate-x-1/2 rounded-3xl bg-zinc-900/50 px-4 py-2 text-sm text-white shadow"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>
