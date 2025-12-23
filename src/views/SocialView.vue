<script setup>
import { ref, computed } from 'vue'
import SocialHeader from '@/components/Social/SocialHeader.vue'
import PostCard from '@/components/Social/PostCard.vue'
import PostComposer from '@/components/Social/PostComposer.vue'

const rawPosts = ref([
  {
    id: 1,
    author: 'test',
    isMine: true,
    content:
      '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，請勿當作正式文案。五十個字隱藏',
    ellipsis: true,
    tags: ['#狗', '#柯基', '#日常生活'],
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSum7FwfWAYG3LAVpmMG9e_y3H_u57BstJ5Tg&s'
    ],
    likeCount: 120,
    commentCount: 12
  },
  {
    id: 2,
    author: 'test',
    content:
      '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，請勿當作正式文案。',
    isMine: false,
    ellipsis: false,
    tags: ['#貓', '#奴才日常'],
    images: ['https://media.tenor.com/uKayqry3x90AAAAM/goofy-funny-cat.gif'],
    likeCount: 120,
    commentCount: 12
  },
  {
    id: 3,
    author: 'test',
    content: '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，五十個字隱藏',
    ellipsis: true,
    tags: [],
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn4pPgkiCwbIXkTfSgfhp4BMEjVOJXJItR1FkRMuWplvtUZo4yzGtfKgC1Dqyi7R9lM3Y&usqp=CAU',
      'https://tiptopk9.com/nitropack_static/CQBMbUdUxEdJwDWnlMCaRSOixvBddFgB/assets/images/optimized/rev-dcdf01d/tiptopk9.com/wp-content/uploads/hilarious-chihuahua-dog-meme.jpeg'
    ],
    likeCount: 120,
    commentCount: 12
  }
])

const mapToUiPost = (p) => ({
  id: p.id,
  author: p.author ?? 'unknown',
  isMine: !!p.isMine,
  content: p.content ?? '',
  ellipsis: !!p.ellipsis,
  tags: p.tags ?? [],
  images: p.images ?? [],
  likeCount: p.likeCount ?? 0,
  commentCount: p.commentCount ?? 0
})

const posts = computed(() => rawPosts.value.map(mapToUiPost))

const leftPosts = computed(() => posts.value.filter((_, i) => i % 2 === 0))
const rightPosts = computed(() => posts.value.filter((_, i) => i % 2 !== 0))

const previewOpen = ref(false)
const previewSrc = ref('')

const openEdit = (postId) => {
  // 不做編輯流程：只留入口 (Moved to inline edit in PostCard)
  console.log('edit', postId)
}

const onPreviewImage = (src) => {
  previewSrc.value = src
  previewOpen.value = true
}

const onClosePreview = () => {
  previewOpen.value = false
  previewSrc.value = ''
}

const toggleLike = (postId) => {
  // issue/1：只留接口，不做按讚流程
  console.log('like', postId)
}

const openComments = (postId) => {
  // issue/1：只留接口，不做留言流程
  console.log('open comments', postId)
}

const sharePost = (postId) => {
  // issue/1：只留接口，不做分享流程
  console.log('share', postId)
}

const toggleBookmark = (postId) => {
  // issue/1：只留接口，不做收藏流程
  console.log('bookmark', postId)
}

const handleUpdate = (payload) => {
  const post = rawPosts.value.find((p) => p.id === payload.id)
  if (post) {
    post.content = payload.content
  }
}

const handleSubmit = (payload) => {
  const text = (payload.content ?? '').trim()
  if (!text) return

  rawPosts.value.unshift({
    id: Date.now(),
    author: 'test',
    content: payload.content,
    isMine: true,
    ellipsis: payload.content.length > 50,
    tags: ['#hashtag'],
    images: payload.images ?? [],
    likeCount: 0,
    commentCount: 0
  })
}
</script>

<template>
  <div class="bg-bg-base">
    <header>
      <SocialHeader />
    </header>
    <div class="mx-10 min-h-screen">
      <main class="mx-auto w-full max-w-260 px-4 pb-16">
        <div>
          <PostComposer username="" @submit="handleSubmit" />
        </div>
        <!-- 手機/平板：單欄 -->
        <section class="mt-4 flex flex-col gap-4 lg:hidden">
          <PostCard
            v-for="p in posts"
            :key="p.id"
            :post="p"
            @edit="openEdit"
            @update="handleUpdate"
            @preview-image="onPreviewImage"
            @like="toggleLike"
            @open-comments="openComments"
            @share="sharePost"
            @bookmark="toggleBookmark"
          />
        </section>

        <!-- 桌機：Masonry 雙欄 -->
        <section class="mt-6 hidden items-start gap-6 lg:flex">
          <!-- 左欄 -->
          <div class="flex flex-1 flex-col gap-6">
            <PostCard
              v-for="p in leftPosts"
              :key="p.id"
              :post="p"
              @edit="openEdit"
              @update="handleUpdate"
              @preview-image="onPreviewImage"
              @like="toggleLike"
              @open-comments="openComments"
              @share="sharePost"
              @bookmark="toggleBookmark"
            />
          </div>
          <!-- 右欄 -->
          <div class="flex flex-1 flex-col gap-6">
            <PostCard
              v-for="p in rightPosts"
              :key="p.id"
              :post="p"
              @edit="openEdit"
              @update="handleUpdate"
              @preview-image="onPreviewImage"
              @like="toggleLike"
              @open-comments="openComments"
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
    </div>
  </div>
</template>
